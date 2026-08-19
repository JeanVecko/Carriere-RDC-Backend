import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";
import { param } from "@/lib/http";

const profileSchema = z.object({
  phone: z.string().optional(),
  city: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  bio: z.string().optional(),
});

const profileInclude = {
  experiences: { orderBy: { startDate: "desc" as const } },
  documents: { orderBy: { createdAt: "desc" as const } },
};

export async function getMyProfile(req: Request, res: Response) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: req.user!.id },
    include: profileInclude,
  });

  res.json(profile);
}

export async function updateMyProfile(req: Request, res: Response) {
  const data = profileSchema.parse(req.body);

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: req.user!.id },
    update: data,
    create: { ...data, userId: req.user!.id },
    include: profileInclude,
  });

  res.status(201).json(profile);
}

const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

async function requireOwnProfile(userId: string) {
  const profile = await prisma.candidateProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return profile;
}

export async function addExperience(req: Request, res: Response) {
  const data = experienceSchema.parse(req.body);
  const profile = await requireOwnProfile(req.user!.id);

  const experience = await prisma.experience.create({
    data: { ...data, profileId: profile.id },
  });

  res.status(201).json(experience);
}

export async function updateExperience(req: Request, res: Response) {
  const data = experienceSchema.partial().parse(req.body);
  const experience = await prisma.experience.findUnique({
    where: { id: param(req, "id") },
    include: { profile: true },
  });

  if (!experience || experience.profile.userId !== req.user!.id) {
    throw new ApiError(404, "Expérience introuvable.");
  }

  const updated = await prisma.experience.update({
    where: { id: experience.id },
    data,
  });

  res.json(updated);
}

export async function deleteExperience(req: Request, res: Response) {
  const experience = await prisma.experience.findUnique({
    where: { id: param(req, "id") },
    include: { profile: true },
  });

  if (!experience || experience.profile.userId !== req.user!.id) {
    throw new ApiError(404, "Expérience introuvable.");
  }

  await prisma.experience.delete({ where: { id: experience.id } });

  res.status(204).send();
}

const documentTypeSchema = z.enum(["CV", "DIPLOMA", "CERTIFICATE"]);

export async function uploadMyDocument(req: Request, res: Response) {
  if (!req.file) {
    throw new ApiError(400, "Le fichier est requis.");
  }

  const type = documentTypeSchema.parse(req.body.type);
  const profile = await requireOwnProfile(req.user!.id);

  const document = await prisma.candidateDocument.create({
    data: {
      profileId: profile.id,
      type,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileName: req.file.originalname,
    },
  });

  res.status(201).json(document);
}

export async function deleteMyDocument(req: Request, res: Response) {
  const document = await prisma.candidateDocument.findUnique({
    where: { id: param(req, "id") },
    include: { profile: true },
  });

  if (!document || document.profile.userId !== req.user!.id) {
    throw new ApiError(404, "Document introuvable.");
  }

  await prisma.candidateDocument.delete({ where: { id: document.id } });

  res.status(204).send();
}
