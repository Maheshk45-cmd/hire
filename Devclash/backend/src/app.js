import express from "express";
import cookieParser from "cookie-parser";

// Central Routing imports
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import eventRoutes from "./routes/event.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
// Cron Setup
import { setupCronJobs } from "./cron/cron.setup.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Initialize background chron jobs
setupCronJobs();

import { startEscrowEngine } from "./jobs/escrowPayout.job.js";

// Initialize Escrow Payout Engine
startEscrowEngine();

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀. Escrow engine active.");
});

// Mount Routes Base paths
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/events", eventRoutes);

// Dashboard / Meta / Activity
app.use("/api", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;