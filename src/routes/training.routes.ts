import { Router } from "express";
import * as trainingController from "@/controllers/training.controller";
import { requireAuth, requireRole } from "@/middleware/auth";

export const trainingRouter = Router();

trainingRouter.get("/", trainingController.listTrainings);
trainingRouter.get("/:id", trainingController.getTraining);
trainingRouter.post(
  "/",
  requireAuth,
  requireRole("TRAINING_ORG", "ADMIN"),
  trainingController.createTraining
);
trainingRouter.patch(
  "/:id",
  requireAuth,
  requireRole("TRAINING_ORG", "ADMIN"),
  trainingController.updateTraining
);
