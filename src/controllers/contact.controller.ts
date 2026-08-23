import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/middleware/error-handler";
import { param } from "@/lib/http";

const contactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function submitContactMessage(req: Request, res: Response) {
  const data = contactMessageSchema.parse(req.body);

  const contactMessage = await prisma.contactMessage.create({ data });

  res.status(201).json(contactMessage);
}

export async function listContactMessages(_req: Request, res: Response) {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(messages);
}

export async function markContactMessageRead(req: Request, res: Response) {
  const message = await prisma.contactMessage.update({
    where: { id: param(req, "id") },
    data: { isRead: true },
  });

  res.json(message);
}

export async function deleteContactMessage(req: Request, res: Response) {
  await prisma.contactMessage
    .delete({ where: { id: param(req, "id") } })
    .catch(() => {
      throw new ApiError(404, "Message introuvable.");
    });

  res.status(204).send();
}
