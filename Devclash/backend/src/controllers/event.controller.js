import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import Company from "../models/company.model.js";
import { logActivity } from "../services/activity.service.js";
import { sendNotificationToAdmins } from "../services/notification.service.js";

// @route   POST /api/events/create
// @desc    Create a new event, manage collab status
// @access  Private (ADMIN/OWNER/EMPLOYEE)
export const createEvent = async (req, res) => {
  try {
    const { title, description, ticketPrice, coHostId, splitPercentage, eventStartDate, eventEndDate } = req.body;
    
    // The main host is the company of the user creating the event
    const primaryHostId = req.user.companyId;

    if (!primaryHostId) {
      return res.status(400).json({ success: false, message: "User must belong to a company to host events." });
    }

    const isEmployee = req.user.role === "EMPLOYEE";
    
    let initialStatus = "LIVE";
    if (isEmployee) {
      initialStatus = "PENDING_APPROVAL";
    } else if (coHostId) {
      initialStatus = "PENDING_COLLAB";
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
      postedBy: req.user.id,
      eventStatus: initialStatus,
      paymentStatus: "HELD_IN_ESCROW"
    });

    await newEvent.save();

    if (isEmployee) {
      await logActivity({
        userId: req.user.id,
        companyId: req.user.companyId,
        type: "EVENT_SUBMITTED_FOR_REVIEW",
        message: `Event '${title}' has been drafted and submitted strictly for Admin Verification.`
      });
      await sendNotificationToAdmins(primaryHostId, `Employee drafted event '${title}' requires your admin verification.`);
    } else {
      await logActivity({
        userId: req.user.id,
        companyId: req.user.companyId,
        type: "EVENT_CREATED",
        message: coHostId ? `A new collaboration blueprint for '${title}' was forwarded to requested Co-Host.` : `Event '${title}' securely verified and published natively.`
      });
      if (coHostId) await sendNotificationToAdmins(coHostId, `Event collaboration request received for '${title}'.`);
    }

    let responseMessage = "Event created and is now LIVE.";
    if (isEmployee) responseMessage = "Event submitted successfully awaiting final admin verification.";
    else if (coHostId) responseMessage = "Event created and pending co-host approval.";

    res.status(201).json({
      success: true,
      message: responseMessage,
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

// @route   GET /api/events/pending-approvals
// @desc    Get all events pending admin verification
// @access  Private (ADMIN/OWNER)
export const getPendingApprovals = async (req, res) => {
  try {
    const userCompanyId = req.user.companyId;

    const pendingEvents = await Event.find({
      primaryHostId: userCompanyId,
      eventStatus: "PENDING_APPROVAL"
    }).populate("postedBy", "name email");

    res.status(200).json({
      success: true,
      data: pendingEvents
    });
  } catch (error) {
    console.error("Get Pending Approvals Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve pending approvals", error: error.message });
  }
};

// @route   POST /api/events/:id/approve
// @desc    Approve an employee's pending event
// @access  Private (ADMIN/OWNER)
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user.companyId;

    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.primaryHostId.toString() !== userCompanyId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized company access." });
    }

    if (event.eventStatus !== "PENDING_APPROVAL") {
      return res.status(400).json({ success: false, message: "Event is not pending approval." });
    }

    event.eventStatus = event.coHostId ? "PENDING_COLLAB" : "LIVE";
    await event.save();

    await logActivity({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: "EVENT_APPROVED",
      message: `Employee draft '${event.title}' was formally approved and shifted to active sequence.`
    });

    res.status(200).json({
      success: true,
      message: "Event approved successfully.",
      data: event
    });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ success: false, message: "Failed to approve event", error: error.message });
  }
};

// @route   POST /api/events/:id/reject
// @desc    Reject and delete an employee's pending event
// @access  Private (ADMIN/OWNER)
export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanyId = req.user.companyId;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.primaryHostId.toString() !== userCompanyId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized company access." });
    }

    if (event.eventStatus !== "PENDING_APPROVAL") {
      return res.status(400).json({ success: false, message: "Event is not pending approval." });
    }

    // Since it was just a draft, we can confidently delete the record entirely to save DB bloat
    await Event.findByIdAndDelete(id);

    await logActivity({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: "EVENT_REJECTED",
      message: `Employee draft '${event.title}' was reviewed and ultimately rejected natively.`
    });

    res.status(200).json({
      success: true,
      message: `Event draft rejected and successfully destroyed.`
    });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ success: false, message: "Failed to reject event", error: error.message });
  }
};
