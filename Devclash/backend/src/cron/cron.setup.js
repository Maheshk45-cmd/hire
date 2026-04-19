import cron from "node-cron";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { logActivity } from "../services/activity.service.js";

export const setupCronJobs = () => {
  // 1. Escrow Payout Job: Runs daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[CRON] Initiating Escrow Payout checks...");
      
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const readyEvents = await Event.find({
        endDate: { $lt: fiveDaysAgo },
        escrowStatus: "ESCROW_HELD"
      });

      for (const event of readyEvents) {
        event.escrowStatus = "RELEASED";
        await event.save();
        
        await logActivity({
          companyId: event.primaryHostId,
          type: "ESCROW_RELEASED",
          message: "Event duration elapsed successfully. Assigned Escrow payload was cleanly distributed."
        });

        console.log(`[ESCROW MOCK PAYOUT - Event ID: ${event._id}]`);
        console.log(`---> Transferring ${event.splitPercentage}% to Primary Host: ${event.primaryHostId}`);
        console.log(`---> Transferring ${100 - event.splitPercentage}% to Co-Host: ${event.coHostId}`);
      }
      
      console.log(`[CRON] Escrow job finished. Processed ${readyEvents.length} events.`);
    } catch (error) {
      console.error("[CRON ERROR] Escrow Job failed:", error.message);
    }
  });

  // 2. Security Reverification Job: Runs on the 1st of every month at midnight
  cron.schedule("0 0 1 * *", async () => {
    try {
      console.log("[CRON] Initiating Employee Security Reverification...");

      const result = await User.updateMany(
        { role: "EMPLOYEE" },
        { $set: { requiresReverification: true } }
      );

      console.log(`[CRON] Reverification flagged for ${result.modifiedCount} employees.`);
    } catch (error) {
      console.error("[CRON ERROR] Security Reverification failed:", error.message);
    }
  });
};
