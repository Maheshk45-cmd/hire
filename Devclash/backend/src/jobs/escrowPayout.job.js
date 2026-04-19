import cron from "node-cron";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";

// Escrow Payout Engine
// Runs daily at midnight to check for events that concluded 5 days ago.
export const startEscrowEngine = () => {
  console.log("🕒 Escrow Engine initialized. Scheduled to run daily.");

  // '0 0 * * *' -> Midnight every day
  cron.schedule("0 0 * * *", async () => {
    console.log("💰 [ESCROW BATCH] Starting daily Escrow processing...");
    try {
      // Find the date exactly 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      // We only target LIVE events held in escrow where the event ended more than 5 days ago
      const eventsPendingPayout = await Event.find({
        eventStatus: "LIVE",
        paymentStatus: "HELD_IN_ESCROW",
        eventEndDate: { $lte: fiveDaysAgo }
      });

      if (eventsPendingPayout.length === 0) {
        console.log("✅ [ESCROW BATCH] No events eligible for payout today.");
        return;
      }

      for (const event of eventsPendingPayout) {
        // Aggregate Total Revenue for this event
        const registrations = await Registration.find({ eventId: event._id, status: "PAID" });
        const totalRevenue = registrations.reduce((acc, curr) => acc + curr.amountPaid, 0);

        if (totalRevenue === 0) {
          // No tickets sold, just release the hold
          event.paymentStatus = "PAYOUT_RELEASED";
          await event.save();
          console.log(`[ESCROW] Event ${event._id} had 0 revenue. Escrow released.`);
          continue;
        }

        // Calculate splits
        const primaryHostRevenue = (totalRevenue * event.splitPercentage) / 100;
        const coHostRevenue = totalRevenue - primaryHostRevenue;

        // Mocking the Bank Transfers
        console.log(`\n================= ESCROW PAYOUT RECORD =================`);
        console.log(`Event ID      : ${event._id}`);
        console.log(`Event Title   : ${event.title}`);
        console.log(`Total Revenue : $${totalRevenue}`);
        console.log(`Primary Host ID : ${event.primaryHostId} -> Payout: $${primaryHostRevenue.toFixed(2)}`);
        
        if (event.coHostId) {
          console.log(`Co-Host ID      : ${event.coHostId} -> Payout: $${coHostRevenue.toFixed(2)}`);
        }
        
        console.log(`Status        : TRANSFER COMPLETE`);
        console.log(`==========================================================\n`);

        // Update Escrow Status
        event.paymentStatus = "PAYOUT_RELEASED";
        await event.save();
      }

      console.log(`✅ [ESCROW BATCH] Successfully processed ${eventsPendingPayout.length} events.`);

    } catch (error) {
      console.error("❌ [ESCROW BATCH ERROR]", error);
    }
  });
};
