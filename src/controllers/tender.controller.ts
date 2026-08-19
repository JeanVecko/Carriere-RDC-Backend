import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";
import { param } from "@/lib/http";

const tenderSchema = z.object({
  title: z.string().min(3),
  sector: z.string(),
  serviceType: z.string(),
  description: z.string().min(10),
  requiredDocs: z.array(z.string()).default([]),
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

  const organization = await prisma.organization.findUnique({ where: { userId: req.user!.id } });
  if (!organization) throw new ApiError(404, "Aucune organisation associée à ce compte.");
  return organization.id;
}

export async function listTenders(req: Request, res: Response) {
  const { sector, serviceType } = req.query as Record<string, string | undefined>;

  const tenders = await prisma.tender.findMany({
    where: { status: "PUBLISHED", sector: sector || undefined, serviceType: serviceType || undefined },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(tenders);
}

export async function getTender(req: Request, res: Response) {
  const tender = await prisma.tender.findUnique({
    where: { id: param(req, "id") },
    include: { organization: true },
  });
  if (!tender) throw new ApiError(404, "Appel d'offres introuvable.");
  res.json(tender);
}

export async function createTender(req: Request, res: Response) {
  const data = tenderSchema.parse(req.body);
  const organizationId = await resolveOrganizationId(req);

  const tender = await prisma.tender.create({
    data: { ...data, organizationId, publishedByAdmin: req.user!.role === "ADMIN" },
  });

  res.status(201).json(tender);
}

export async function updateTender(req: Request, res: Response) {
  const tender = await prisma.tender.findUnique({
    where: { id: param(req, "id") },
    include: { organization: true },
  });
  if (!tender) throw new ApiError(404, "Appel d'offres introuvable.");
  if (req.user!.role !== "ADMIN" && tender.organization.userId !== req.user!.id) {
    throw new ApiError(403, "Accès refusé.");
  }

  const data = tenderSchema.partial().parse(req.body);
  const updated = await prisma.tender.update({ where: { id: param(req, "id") }, data });
  res.json(updated);
}
