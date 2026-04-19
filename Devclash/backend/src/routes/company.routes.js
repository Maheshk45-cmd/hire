import { Router } from "express";
import { applyCompanyAdmin, joinEmployee } from "../controllers/company.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route for public signup mapping
router.post("/admin/apply", applyCompanyAdmin);

// Protected routes
router.post("/join-employee", verifyToken, joinEmployee);

export default router;
