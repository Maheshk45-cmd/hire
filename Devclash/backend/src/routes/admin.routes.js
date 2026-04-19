import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { getPendingActions } from "../controllers/admin.controller.js";

const router = Router();
router.use(verifyToken);
router.get("/pending-actions", roleMiddleware(["OWNER", "ADMIN"]), getPendingActions);

export default router;
