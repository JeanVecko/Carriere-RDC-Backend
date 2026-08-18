import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";

const organizationSchema = z.object({
  name: z.string().min(2),
  sector: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export async function createOrUpdateMyOrganization(req: Request, res: Response) {
  const data = organizationSchema.parse(req.body);

  const organization = await prisma.organization.upsert({
    where: { userId: req.user!.id },
    update: data,
    create: { ...data, userId: req.user!.id },
  });

  res.status(201).json(organization);
}

export async function getMyOrganization(req: Request, res: Response) {
  const organization = await prisma.organization.findUnique({
    where: { userId: req.user!.id },
  });

  if (!organization) throw new ApiError(404, "Aucune organisation associée à ce compte.");

  res.json(organization);
}

export async function getOrganization(req: Request, res: Response) {
  const organization = await prisma.organization.findUnique({
    where: { id: req.params.id },
  });

  if (!organization) throw new ApiError(404, "Organisation introuvable.");

  res.json(organization);
}
