import { Router } from "express";
import * as applicationController from "@/controllers/application.controller";
import { requireAuth, requireRole } from "@/middleware/auth";

export const applicationRouter = Router();

applicationRouter.get(
  "/me",
  requireAuth,
  requireRole("CANDIDATE"),
  applicationController.listMyApplications
);
applicationRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  applicationController.updateApplicationStatus
);
