import { Router } from "express";
import * as tenderController from "@/controllers/tender.controller";
import { requireAuth, requireRole } from "@/middleware/auth";

export const tenderRouter = Router();

tenderRouter.get("/", tenderController.listTenders);
tenderRouter.get("/:id", tenderController.getTender);
tenderRouter.post("/", requireAuth, requireRole("COMPANY", "ADMIN"), tenderController.createTender);
tenderRouter.patch(
  "/:id",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  tenderController.updateTender
);
