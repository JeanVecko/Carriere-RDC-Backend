import type { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { param } from "@/lib/http";

export async function listPendingAccounts(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: { status: "PENDING" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  res.json(users);
}

export async function validateAccount(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: param(req, "id") },
    data: { status: "VALIDATED" },
  });

  res.json(user);
}

export async function suspendAccount(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: param(req, "id") },
    data: { status: "SUSPENDED" },
  });

  res.json(user);
}

export async function listOrganizations(_req: Request, res: Response) {
  const organizations = await prisma.organization.findMany({
    include: { user: { select: { id: true, name: true, email: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(organizations);
}
