import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const emailSchema = z.object({ email: z.string().email() });

export async function subscribe(req: Request, res: Response) {
  const { email } = emailSchema.parse(req.body);

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { status: "ACTIVE" },
    create: { email },
  });

  res.status(201).json(subscriber);
}

export async function unsubscribe(req: Request, res: Response) {
  const { email } = emailSchema.parse(req.body);

  await prisma.newsletterSubscriber.updateMany({
    where: { email },
    data: { status: "UNSUBSCRIBED" },
  });

  res.json({ success: true });
}
