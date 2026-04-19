import { Router } from "express";
import { applyCompanyAdmin, joinEmployee, searchMcaDatabase, verifyDin } from "../controllers/company.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route for public signup mapping
router.post("/admin/apply", applyCompanyAdmin);
router.get("/mca-verify", searchMcaDatabase);
router.get("/verify-din", verifyDin);

// Protected routes
router.post("/join-employee", verifyToken, joinEmployee);

export default router;
