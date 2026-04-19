import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyIdentity, verifyFace, getStatus } from "../controllers/user.controller.js";

const router = Router();

// Securing all routes in this router with verifyToken
router.use(verifyToken);

router.post("/verify-identity", verifyIdentity);
router.post("/verify-face", verifyFace);
router.get("/status", getStatus);

export default router;
