import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";

const atsCriteriaSchema = z.object({
  minEducationLevel: z.string(),
  minExperienceYears: z.number().int().min(0),
  requiredLanguages: z.array(z.string()),
  keySkills: z.array(z.string()),
  niceToHave: z.array(z.string()).default([]),
});

const jobOfferSchema = z.object({
  title: z.string().min(3),
  sector: z.string(),
  city: z.string(),
  contractType: z.string(),
  description: z.string().min(10),
  missions: z.array(z.string()).default([]),
  atsCriteria: atsCriteriaSchema,
  preScreeningQuestions: z.array(z.string()).default([]),
  deadline: z.coerce.date().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

async function resolveOrganizationId(req: Request): Promise<string> {
  if (req.user!.role === "ADMIN") {
    const body = req.body as { organizationId?: string };
    if (!body.organizationId) {
      throw new ApiError(400, "organizationId requis lorsque l'admin publie pour un tiers.");
    }
    return body.organizationId;
  }

  const organization = await prisma.organization.findUnique({
    where: { userId: req.user!.id },
  });
  if (!organization) throw new ApiError(404, "Aucune organisation associée à ce compte.");
  return organization.id;
}

export async function listJobOffers(req: Request, res: Response) {
  const { sector, city, contractType, search } = req.query as Record<string, string | undefined>;

  const jobOffers = await prisma.jobOffer.findMany({
    where: {
      status: "PUBLISHED",
      sector: sector || undefined,
      city: city || undefined,
      contractType: contractType || undefined,
      title: search ? { contains: search, mode: "insensitive" } : undefined,
    },
    include: { organization: true },
    orderBy: { publishedAt: "desc" },
  });

  res.json(jobOffers);
}

export async function getJobOffer(req: Request, res: Response) {
  const jobOffer = await prisma.jobOffer.findUnique({
    where: { id: req.params.id },
    include: { organization: true },
  });

  if (!jobOffer) throw new ApiError(404, "Offre introuvable.");

  res.json(jobOffer);
}

export async function createJobOffer(req: Request, res: Response) {
  const data = jobOfferSchema.parse(req.body);
  const organizationId = await resolveOrganizationId(req);

  const jobOffer = await prisma.jobOffer.create({
    data: {
      ...data,
      organizationId,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      publishedByAdmin: req.user!.role === "ADMIN",
    },
  });

  res.status(201).json(jobOffer);
}

async function assertOwnership(req: Request, jobOfferId: string) {
  const jobOffer = await prisma.jobOffer.findUnique({
    where: { id: jobOfferId },
    include: { organization: true },
  });

  if (!jobOffer) throw new ApiError(404, "Offre introuvable.");

  if (req.user!.role !== "ADMIN" && jobOffer.organization.userId !== req.user!.id) {
    throw new ApiError(403, "Vous n'êtes pas autorisé à modifier cette offre.");
  }

  return jobOffer;
}

export async function updateJobOffer(req: Request, res: Response) {
  await assertOwnership(req, req.params.id);
  const data = jobOfferSchema.partial().parse(req.body);

  const jobOffer = await prisma.jobOffer.update({
    where: { id: req.params.id },
    data: {
      ...data,
      publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  res.json(jobOffer);
}

export async function closeJobOffer(req: Request, res: Response) {
  await assertOwnership(req, req.params.id);

  const jobOffer = await prisma.jobOffer.update({
    where: { id: req.params.id },
    data: { status: "CLOSED" },
  });

  res.json(jobOffer);
}
