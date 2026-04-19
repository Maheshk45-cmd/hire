import Job from "../models/job.model.js";
import Event from "../models/event.model.js";

export const getPendingActions = async (req, res) => {
  try {
    const { companyId } = req.user;
    
    if (!companyId) {
      return res.status(400).json({ error: "No company mapped." });
    }

    const [pendingJobs, pendingEvents] = await Promise.all([
      Job.find({ companyId, status: "PENDING" }).lean(),
      Event.find({
        $or: [{ primaryHostId: companyId }, { coHostId: companyId }],
        collaborationStatus: "PENDING_PARTNER"
      }).lean()
    ]);

    res.status(200).json({ pendingJobs, pendingEvents });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
