import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import { logActivity } from "../services/activity.service.js";
import { sendNotification, sendNotificationToAdmins } from "../services/notification.service.js";

// Draft Job
export const draftJob = async (req, res) => {
  try {
    const { title } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.companyId) {
      return res.status(400).json({ error: "User is not linked to a company." });
    }

    const isTrusted = ["OWNER", "ADMIN"].includes(user.role) || user.isTrustedPoster === true;
    const status = isTrusted ? "LIVE" : "PENDING";

    const job = await Job.create({
      title,
      companyId: user.companyId,
      postedBy: user._id,
      status
    });

    await logActivity({
      userId: user._id,
      companyId: user.companyId,
      type: "JOB_CREATED",
      message: `New job '${title}' posted by ${isTrusted ? "Trusted Person" : "Employee"}`,
    });

    if (!isTrusted) {
      await sendNotificationToAdmins(user.companyId, `A new job '${title}' is pending your approval.`);
    }

    res.status(201).json({ message: `Job Drafted. Status: ${status}`, job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Approve Job
export const approveJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({ _id: id, companyId: req.user.companyId });
    if (!job) {
      return res.status(404).json({ error: "Job request not found in your company realm." });
    }

    if (job.status !== "PENDING") {
      return res.status(400).json({ error: "Job is not in PENDING state." });
    }

    job.status = "LIVE";
    await job.save();

    await logActivity({
      userId: req.user.id,
      companyId: req.user.companyId,
      type: "JOB_APPROVED",
      message: `Pending job request for '${job.title}' was formally approved by leadership.`,
    });

    await sendNotification(job.postedBy, `Your job '${job.title}' has been successfully approved to LIVE.`);

    res.status(200).json({ message: "Job Approved to LIVE", job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Report Job
export const reportJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Community members can flag any job
    const job = await Job.findByIdAndUpdate(id, { status: "REPORTED" }, { new: true });
    
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.status(200).json({ message: "Job reported for manual review.", job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
