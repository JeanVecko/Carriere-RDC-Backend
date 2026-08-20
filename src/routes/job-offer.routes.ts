import { Router } from "express";
import * as jobOfferController from "@/controllers/job-offer.controller";
import * as applicationController from "@/controllers/application.controller";
import { requireAuth, requireRole } from "@/middleware/auth";
import { uploadCv, uploadOfferDocument } from "@/middleware/upload";

export const jobOfferRouter = Router();

jobOfferRouter.get("/", jobOfferController.listJobOffers);
jobOfferRouter.get(
  "/mine",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  jobOfferController.listMyJobOffers
);
jobOfferRouter.get("/:id", jobOfferController.getJobOffer);
jobOfferRouter.post(
  "/",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  jobOfferController.createJobOffer
);
jobOfferRouter.post(
  "/upload",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  uploadOfferDocument.single("document"),
  jobOfferController.createJobOfferFromDocument
);
jobOfferRouter.patch(
  "/:id",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  jobOfferController.updateJobOffer
);
jobOfferRouter.patch(
  "/:id/close",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  jobOfferController.closeJobOffer
);

jobOfferRouter.post(
  "/:id/apply",
  requireAuth,
  requireRole("CANDIDATE"),
  uploadCv.single("cv"),
  applicationController.applyToJobOffer
);
jobOfferRouter.get(
  "/:id/applications",
  requireAuth,
  requireRole("COMPANY", "ADMIN"),
  applicationController.listApplicationsForJobOffer
);
