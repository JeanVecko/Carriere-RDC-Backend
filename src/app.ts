import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import { errorHandler, notFoundHandler } from "@/middleware/error-handler";
import { authRouter } from "@/routes/auth.routes";
import { organizationRouter } from "@/routes/organization.routes";
import { jobOfferRouter } from "@/routes/job-offer.routes";
import { applicationRouter } from "@/routes/application.routes";
import { tenderRouter } from "@/routes/tender.routes";
import { trainingRouter } from "@/routes/training.routes";
import { newsletterRouter } from "@/routes/newsletter.routes";
import { adminRouter } from "@/routes/admin.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/job-offers", jobOfferRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/tenders", tenderRouter);
app.use("/api/trainings", trainingRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
