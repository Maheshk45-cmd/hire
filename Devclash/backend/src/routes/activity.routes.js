import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getFeed } from "../controllers/activity.controller.js";

const router = Router();

router.use(verifyToken);
router.get("/feed", getFeed);

export default router;
