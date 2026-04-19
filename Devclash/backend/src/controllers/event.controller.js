import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import Company from "../models/company.model.js";
import { logActivity } from "../services/activity.service.js";
import { sendNotificationToAdmins } from "../services/notification.service.js";

// @route   POST /api/events/create
// @desc    Create a new event, manage collab status
// @access  Private (ADMIN/OWNER)
export const createEvent = async (req, res) => {
  try {
    const { title, description, ticketPrice, coHostId, splitPercentage, eventStartDate, eventEndDate } = req.body;
    
    // The main host is the company of the user creating the event
    const primaryHostId = req.user.companyId;

    if (!primaryHostId) {
      return res.status(400).json({ success: false, message: "User must belong to a company to host events." });
    }

    const newEvent = new Event({
      title,
      description,
      ticketPrice,
      primaryHostId,
      coHostId: coHostId || null,
      splitPercentage: coHostId ? splitPercentage : 100,
      eventStartDate,
      eventEndDate,
      eventStatus: coHostId ? "PENDING_COLLAB" : "LIVE",
      paymentStatus: "HELD_IN_ESCROW"
    });

    await newEvent.save();

    await logActivity({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: "EVENT_CREATED",
      message: `A new collaboration blueprint for '${title}' was forwarded to requested Co-Host.`
    });

    await sendNotificationToAdmins(coHostId, `Event collaboration request received for '${title}'.`);

    res.status(201).json({
      success: true,
      message: coHostId ? "Event created and pending co-host approval." : "Event created and is now LIVE.",
      data: newEvent
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: "Failed to create event", error: error.message });
  }
};

// @route   POST /api/events/:id/accept-collab
// @desc    Accept collaboration by co-host
// @access  Private (ADMIN/OWNER of the co-host company)
export const acceptCollab = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user.companyId;

    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Validate that the request maker is the coHost
    if (event.coHostId && event.coHostId.toString() !== userCompanyId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not the assigned co-host." });
    }

    if (event.eventStatus !== "PENDING_COLLAB") {
      return res.status(400).json({ success: false, message: "Event is not pending collaboration." });
    }

    event.eventStatus = "LIVE";
    await event.save();

    await logActivity({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: "EVENT_ACCEPTED",
      message: `The pending collaboration contract for '${event.title}' was formally signed and approved.`
    });

    await sendNotificationToAdmins(event.primaryHostId, `Event '${event.title}' accepted by partner.`);

    res.status(200).json({
      success: true,
      message: "Collaboration accepted. Event is now LIVE.",
      data: event
    });
  } catch (error) {
    console.error("Accept Collab Error:", error);
    res.status(500).json({ success: false, message: "Failed to accept collab", error: error.message });
  }
};

// @route   POST /api/events/:id/cancel
// @desc    Cancel an event and refund tickets
// @access  Private (ADMIN/OWNER of primary host)
export const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user.companyId;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.primaryHostId.toString() !== userCompanyId.toString()) {
      return res.status(403).json({ success: false, message: "Only primary host can cancel this event." });
    }

    if (["CANCELLED", "PAYOUT_RELEASED"].includes(event.paymentStatus)) {
      return res.status(400).json({ success: false, message: "Cannot cancel this event." });
    }

    event.eventStatus = "CANCELLED";
    event.paymentStatus = "REFUNDED";
    await event.save();

    // Mock Refund Loop
    const registrations = await Registration.find({ eventId: id, status: "PAID" });
    
    // In production we would use Promise.all to map over Stripe refunds
    for (let reg of registrations) {
      reg.status = "REFUNDED";
      await reg.save();
      // console.log(`Mocking Stripe Refund for Registration ${reg._id} - Amount: ${reg.amountPaid}`);
    }

    res.status(200).json({
      success: true,
      message: `Event cancelled. Initiated mock refund for ${registrations.length} attendees.`,
      data: event
    });

  } catch (error) {
    console.error("Cancel Event Error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel event", error: error.message });
  }
};

// @route   POST /api/events/:id/register
// @desc    Register for an event (Mock Payment)
// @access  Private (Authenticated users)
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event || event.eventStatus !== "LIVE") {
      return res.status(400).json({ success: false, message: "Event not found or not live." });
    }

    // Checking if already registered
    const existingReg = await Registration.findOne({ eventId: id, userId });
    if (existingReg) {
      return res.status(400).json({ success: false, message: "You are already registered." });
    }

    // Mock Payment Step here -> Assume Stripe/Razorpay succeeds
    const amountPaid = event.ticketPrice;

    const newRegistration = new Registration({
      eventId: id,
      userId,
      amountPaid,
      status: "PAID"
    });

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "Successfully registered and payment held in Escrow.",
      data: newRegistration
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Failed to register", error: error.message });
  }
};

// @route   POST /api/events/:id/report
// @desc    Report fake event
// @access  Private (Authenticated users)
export const reportEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    event.reportCount += 1;

    // Fraud threshold mechanism
    if (event.reportCount >= 5 && event.eventStatus === "LIVE") {
      event.eventStatus = "FLAGGED";
      // We don't automatically refund, we retain escrow pending review
      console.log(`[ALERT] Event ${event._id} has been FLAGGED for fraud (5+ reports). Escrow frozen.`);
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event reported successfully. Trust & Safety team will review.",
      status: event.eventStatus
    });

  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ success: false, message: "Failed to report event", error: error.message });
  }
};
