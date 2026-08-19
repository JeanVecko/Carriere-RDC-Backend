import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";
import { scoreApplication, type AtsCriteria } from "@/lib/ats";
import { param } from "@/lib/http";

const applyFormSchema = z.object({
  educationLevel: z.string(),
  experienceYears: z.coerce.number().int().min(0),
  languages: z.array(z.string()).or(z.string().transform((v) => v.split(","))),
  skills: z.array(z.string()).or(z.string().transform((v) => v.split(","))),
  preScreeningAnswers: z.array(z.string()).default([]),
});

export async function applyToJobOffer(req: Request, res: Response) {
  const jobOffer = await prisma.jobOffer.findUnique({ where: { id: param(req, "id") } });
  if (!jobOffer || jobOffer.status !== "PUBLISHED") {
    throw new ApiError(404, "Offre introuvable ou non publiée.");
  }

  if (!req.file) {
    throw new ApiError(400, "Le CV (PDF) est requis.");
  }

  const formAnswers = applyFormSchema.parse(
    typeof req.body.formAnswers === "string" ? JSON.parse(req.body.formAnswers) : req.body
  );

  const existing = await prisma.application.findUnique({
    where: { candidateId_jobOfferId: { candidateId: req.user!.id, jobOfferId: jobOffer.id } },
  });
  if (existing) {
    throw new ApiError(409, "Vous avez déjà postulé à cette offre.");
  }

  const atsResult = scoreApplication(jobOffer.atsCriteria as unknown as AtsCriteria, {
    educationLevel: formAnswers.educationLevel,
    experienceYears: formAnswers.experienceYears,
    languages: formAnswers.languages,
    skills: formAnswers.skills,
  });

  const application = await prisma.application.create({
    data: {
      candidateId: req.user!.id,
      jobOfferId: jobOffer.id,
      formAnswers,
      cvUrl: `/uploads/cv/${req.file.filename}`,
      atsResult,
    },
  });

  res.status(201).json(application);
}

export async function listApplicationsForJobOffer(req: Request, res: Response) {
  const jobOffer = await prisma.jobOffer.findUnique({
    where: { id: param(req, "id") },
    include: { organization: true },
  });

  if (!jobOffer) throw new ApiError(404, "Offre introuvable.");
  if (req.user!.role !== "ADMIN" && jobOffer.organization.userId !== req.user!.id) {
    throw new ApiError(403, "Accès refusé.");
  }

  const applications = await prisma.application.findMany({
    where: { jobOfferId: param(req, "id") },
    include: { candidate: { select: { id: true, name: true, email: true } } },
    // "Correspond" en tête de liste, comme décrit dans le cadrage (section 5.3).
    orderBy: [{ atsResult: "asc" }, { createdAt: "desc" }],
  });

  res.json(applications);
}

export async function listMyApplications(req: Request, res: Response) {
  const applications = await prisma.application.findMany({
    where: { candidateId: req.user!.id },
    include: { jobOffer: { include: { organization: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(applications);
}

const updateStatusSchema = z.object({
  status: z.enum(["RECEIVED", "IN_PROGRESS", "ACCEPTED", "REJECTED"]),
});

export async function updateApplicationStatus(req: Request, res: Response) {
  const application = await prisma.application.findUnique({
    where: { id: param(req, "id") },
    include: { jobOffer: { include: { organization: true } } },
  });

  if (!application) throw new ApiError(404, "Candidature introuvable.");
  if (req.user!.role !== "ADMIN" && application.jobOffer.organization.userId !== req.user!.id) {
    throw new ApiError(403, "Accès refusé.");
  }

  const { status } = updateStatusSchema.parse(req.body);

  const updated = await prisma.application.update({
    where: { id: param(req, "id") },
    data: { status },
  });

  res.json(updated);
}
