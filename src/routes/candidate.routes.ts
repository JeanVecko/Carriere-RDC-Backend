import { Router } from "express";
import * as candidateController from "@/controllers/candidate.controller";
import { requireAuth, requireRole } from "@/middleware/auth";
import { uploadDocument } from "@/middleware/upload";

export const candidateRouter = Router();

candidateRouter.use(requireAuth, requireRole("CANDIDATE"));

candidateRouter.get("/me/profile", candidateController.getMyProfile);
candidateRouter.put("/me/profile", candidateController.updateMyProfile);
candidateRouter.post("/me/experiences", candidateController.addExperience);
candidateRouter.patch("/me/experiences/:id", candidateController.updateExperience);
candidateRouter.delete("/me/experiences/:id", candidateController.deleteExperience);
candidateRouter.post(
  "/me/documents",
  uploadDocument.single("file"),
  candidateController.uploadMyDocument
);
candidateRouter.delete("/me/documents/:id", candidateController.deleteMyDocument);
