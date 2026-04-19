import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getNotifications } from "../controllers/notification.controller.js";

const router = Router();
router.use(verifyToken);
router.get("/", getNotifications);

export default router;
