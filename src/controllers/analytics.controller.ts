import type { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

export async function trackVisit(req: Request, res: Response) {
  const path =
    typeof req.body?.path === "string" ? req.body.path.slice(0, 255) : null;

  await prisma.siteVisit.create({ data: { path } });

  res.status(201).json({ success: true });
}
