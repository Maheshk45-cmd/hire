import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getTrustScore,
  getDashboardMe,
  getCompanyStats,
  getJobDashboard,
  getEventDashboard
} from "../controllers/dashboard.controller.js";

const router = Router();

// Apply auth middleware to all dashboard/meta endpoints
router.use(verifyToken);

router.get("/user/trust-score", getTrustScore);
router.get("/dashboard/me", getDashboardMe);
router.get("/company/stats", getCompanyStats);
router.get("/jobs/my-company", getJobDashboard);
router.get("/events/my-company", getEventDashboard);

export default router;
