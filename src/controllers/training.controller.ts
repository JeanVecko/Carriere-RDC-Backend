import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";
import { param } from "@/lib/http";

const trainingSchema = z.object({
  title: z.string().min(3),
  domain: z.string(),
  objectives: z.string(),
  program: z.string(),
  duration: z.string(),
  modality: z.enum(["ONSITE", "ONLINE", "HYBRID"]),
  sessionDates: z
    .array(z.string())
    .or(z.string().transform((v) => (v ? JSON.parse(v) : [])))
    .default([]),
  price: z.string().optional(),
  location: z.string().optional(),
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

export async function listTrainings(req: Request, res: Response) {
  const { domain, modality } = req.query as Record<string, string | undefined>;

  const trainings = await prisma.training.findMany({
    where: {
      status: "PUBLISHED",
      domain: domain || undefined,
      modality: (modality as "ONSITE" | "ONLINE" | "HYBRID") || undefined,
    },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(trainings);
}

export async function listMyTrainings(req: Request, res: Response) {
  const organization = await prisma.organization.findUnique({
    where: { userId: req.user!.id },
  });
  if (!organization) throw new ApiError(404, "Aucune organisation associée à ce compte.");

  const trainings = await prisma.training.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });

  res.json(trainings);
}

export async function getTraining(req: Request, res: Response) {
  const training = await prisma.training.findUnique({
    where: { id: param(req, "id") },
    include: { organization: true },
  });
  if (!training) throw new ApiError(404, "Formation introuvable.");
  res.json(training);
}

export async function createTraining(req: Request, res: Response) {
  const data = trainingSchema.parse(req.body);
  const organizationId = await resolveOrganizationId(req);

  const training = await prisma.training.create({
    data: {
      ...data,
      posterUrl: req.file ? `/uploads/posters/${req.file.filename}` : undefined,
      organizationId,
    },
  });
  res.status(201).json(training);
}

export async function updateTraining(req: Request, res: Response) {
  const training = await prisma.training.findUnique({
    where: { id: param(req, "id") },
    include: { organization: true },
  });
  if (!training) throw new ApiError(404, "Formation introuvable.");
  if (req.user!.role !== "ADMIN" && training.organization.userId !== req.user!.id) {
    throw new ApiError(403, "Accès refusé.");
  }

  const data = trainingSchema.partial().parse(req.body);
  const updated = await prisma.training.update({
    where: { id: param(req, "id") },
    data: {
      ...data,
      posterUrl: req.file ? `/uploads/posters/${req.file.filename}` : undefined,
    },
  });
  res.json(updated);
}
