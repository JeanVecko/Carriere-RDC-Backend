import { Router } from "express";
import * as newsletterController from "@/controllers/newsletter.controller";

export const newsletterRouter = Router();

newsletterRouter.post("/subscribe", newsletterController.subscribe);
newsletterRouter.post("/unsubscribe", newsletterController.unsubscribe);
