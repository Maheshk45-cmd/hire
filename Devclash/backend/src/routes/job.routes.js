import { Router } from "express";
import { draftJob, approveJob, reportJob } from "../controllers/job.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/create", draftJob);
router.post("/:id/report", reportJob);

// Admin/Owner only endpoint
router.put("/:id/approve", roleMiddleware(["OWNER", "ADMIN"]), approveJob);

export default router;
