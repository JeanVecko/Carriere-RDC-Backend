import { Router } from "express";
import * as contactController from "@/controllers/contact.controller";

export const contactRouter = Router();

contactRouter.post("/", contactController.submitContactMessage);
