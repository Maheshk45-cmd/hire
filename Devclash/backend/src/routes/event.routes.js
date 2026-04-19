import express from "express";
import {
  createEvent,
  acceptCollab,
  cancelEvent,
  registerForEvent,
  reportEvent,
} from "../controllers/event.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

// Enforce JWT check on all event routes natively
router.use(verifyToken);

// --- Host/Company Actions ---
// Only Admin/Owners can create or cancel their events
router.post("/create", roleMiddleware(["ADMIN", "OWNER"]), createEvent);

// Only Admin/Owners can accept an incoming collaboration
router.post("/:id/accept-collab", roleMiddleware(["ADMIN", "OWNER"]), acceptCollab);

// Cancel event and loop refunds
router.post("/:id/cancel", roleMiddleware(["ADMIN", "OWNER"]), cancelEvent);


// --- Attendee Actions ---
// Any authenticated user can register or report an event
router.post("/:id/register", registerForEvent);
router.post("/:id/report", reportEvent);

export default router;
