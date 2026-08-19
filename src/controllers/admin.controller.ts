import type { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { param } from "@/lib/http";
import type { Role } from "@generated/prisma/enums.ts";

const ROLES: Role[] = ["CANDIDATE", "COMPANY", "TRAINING_ORG", "ADMIN"];

export async function listUsers(req: Request, res: Response) {
  const roleParam = req.query.role;
  const role =
    typeof roleParam === "string" && ROLES.includes(roleParam as Role)
      ? (roleParam as Role)
      : undefined;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    users.map(({ passwordHash: _passwordHash, ...safeUser }) => safeUser)
  );
}

export async function getStats(_req: Request, res: Response) {
  const [candidateCount, companyCount, trainingOrgCount, pendingCount, totalVisits] =
    await Promise.all([
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.user.count({ where: { role: "COMPANY" } }),
      prisma.user.count({ where: { role: "TRAINING_ORG" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.siteVisit.count(),
    ]);

  res.json({ candidateCount, companyCount, trainingOrgCount, pendingCount, totalVisits });
}

export async function listPendingAccounts(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: { status: "PENDING" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  res.json(users.map(({ passwordHash: _passwordHash, ...safeUser }) => safeUser));
}

export async function validateAccount(req: Request, res: Response) {
  const { passwordHash: _passwordHash, ...user } = await prisma.user.update({
    where: { id: param(req, "id") },
    data: { status: "VALIDATED" },
  });

  res.json(user);
}

export async function suspendAccount(req: Request, res: Response) {
  const { passwordHash: _passwordHash, ...user } = await prisma.user.update({
    where: { id: param(req, "id") },
    data: { status: "SUSPENDED" },
  });

  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const userId = param(req, "id");

  if (req.user?.id === userId) {
    return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
  }

  await prisma.user.delete({ where: { id: userId } });

  res.status(204).send();
}

export async function listOrganizations(_req: Request, res: Response) {
  const organizations = await prisma.organization.findMany({
    include: { user: { select: { id: true, name: true, email: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(organizations);
}
