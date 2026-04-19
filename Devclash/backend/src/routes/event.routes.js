import express from "express";
import {
  createEvent,
  acceptCollab,
  cancelEvent,
  registerForEvent,
  reportEvent,
  getPendingApprovals,
  approveEvent,
  rejectEvent
} from "../controllers/event.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

// Enforce JWT check on all event routes natively
router.use(verifyToken);

// --- Host/Company Actions ---
// All vetted associates can create, but logic isolates Employees to pending approval
router.post("/create", roleMiddleware(["ADMIN", "OWNER", "EMPLOYEE"]), createEvent);

// Admin / Owner Overrides for Employee submissions
router.get("/pending-approvals", roleMiddleware(["ADMIN", "OWNER"]), getPendingApprovals);
router.post("/:id/approve", roleMiddleware(["ADMIN", "OWNER"]), approveEvent);
router.post("/:id/reject", roleMiddleware(["ADMIN", "OWNER"]), rejectEvent);

// Only Admin/Owners can accept an incoming collaboration
router.post("/:id/accept-collab", roleMiddleware(["ADMIN", "OWNER"]), acceptCollab);

// Cancel event and loop refunds
router.post("/:id/cancel", roleMiddleware(["ADMIN", "OWNER"]), cancelEvent);


// --- Attendee Actions ---
// Any authenticated user can register or report an event
router.post("/:id/register", registerForEvent);
router.post("/:id/report", reportEvent);

export default router;
