import { Router } from "express";
import * as organizationController from "@/controllers/organization.controller";
import { requireAuth, requireRole } from "@/middleware/auth";

export const organizationRouter = Router();

organizationRouter.get(
  "/me",
  requireAuth,
  requireRole("COMPANY", "TRAINING_ORG"),
  organizationController.getMyOrganization
);
organizationRouter.put(
  "/me",
  requireAuth,
  requireRole("COMPANY", "TRAINING_ORG"),
  organizationController.createOrUpdateMyOrganization
);
organizationRouter.get("/:id", organizationController.getOrganization);
