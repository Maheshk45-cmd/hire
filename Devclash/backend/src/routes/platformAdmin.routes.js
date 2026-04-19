import { Router } from "express";
import { onboardCompany, verifyCompanyOwner } from "../controllers/platformAdmin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Conceptually this should be protected by SUPERADMIN role checks for Devclash staff.
// For now, we mock the platform admin access restriction.
router.post("/companies", onboardCompany);
router.post("/companies/:companyId/owners", verifyCompanyOwner);

export default router;
