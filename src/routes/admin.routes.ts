import { Router } from "express";
import * as adminController from "@/controllers/admin.controller";
import { requireAuth, requireRole } from "@/middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/stats", adminController.getStats);
adminRouter.get("/users", adminController.listUsers);
adminRouter.get("/accounts/pending", adminController.listPendingAccounts);
adminRouter.patch("/accounts/:id/validate", adminController.validateAccount);
adminRouter.patch("/accounts/:id/suspend", adminController.suspendAccount);
adminRouter.get("/organizations", adminController.listOrganizations);
adminRouter.delete("/users/:id", adminController.deleteUser);
