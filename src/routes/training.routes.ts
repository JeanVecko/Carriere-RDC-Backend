import { Router } from "express";
import * as trainingController from "@/controllers/training.controller";
import { requireAuth, requireRole } from "@/middleware/auth";
import { uploadPoster } from "@/middleware/upload";

export const trainingRouter = Router();

trainingRouter.get("/", trainingController.listTrainings);
trainingRouter.get(
  "/mine",
  requireAuth,
  requireRole("COMPANY", "TRAINING_ORG", "ADMIN"),
  trainingController.listMyTrainings
);
trainingRouter.get("/:id", trainingController.getTraining);
trainingRouter.post(
  "/",
  requireAuth,
  requireRole("COMPANY", "TRAINING_ORG", "ADMIN"),
  uploadPoster.single("poster"),
  trainingController.createTraining
);
trainingRouter.patch(
  "/:id",
  requireAuth,
  requireRole("COMPANY", "TRAINING_ORG", "ADMIN"),
  uploadPoster.single("poster"),
  trainingController.updateTraining
);
