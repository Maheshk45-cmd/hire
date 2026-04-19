import { Router } from "express";
import { signup, login, verifyDigilocker, verifyFace, sendOtp, verifyOtp, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected Auth/Identity routes
router.post("/verify-digilocker", verifyToken, verifyDigilocker);
router.post("/verify-face", verifyToken, verifyFace);

export default router;
