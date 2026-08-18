import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, verifyPassword } from "@/lib/auth";
import { ApiError } from "@/middleware/error-handler";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CANDIDATE", "COMPANY", "TRAINING_ORG"]).default("CANDIDATE"),
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError(409, "Un compte existe déjà avec cet e-mail.");
  }

  // Candidats actifs immédiatement ; entreprises/organismes en attente de validation admin.
  const status = data.role === "CANDIDATE" ? "VALIDATED" : "PENDING";

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: data.role,
      status,
    },
  });

  const token = signToken({ sub: user.id, role: user.role });

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new ApiError(401, "E-mail ou mot de passe incorrect.");
  }

  if (user.status === "SUSPENDED") {
    throw new ApiError(403, "Ce compte a été suspendu.");
  }

  const token = signToken({ sub: user.id, role: user.role });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { organization: true },
  });

  if (!user) throw new ApiError(404, "Utilisateur introuvable.");

  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json(safeUser);
}
