import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import Event from "../models/event.model.js";
import { calculateTrustScore } from "../utils/trustScore.js";

// 1. Trust Score
export const getTrustScoreData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return calculateTrustScore(user);
};

// 2. User Dashboard
export const getUserDashboardData = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  let companyData = null;
  if (user.companyId) {
    companyData = await Company.findById(user.companyId).select("name domain").lean();
  }

  const [totalJobsPosted, pendingJobs, liveJobs, totalEvents] = await Promise.all([
    Job.countDocuments({ $or: [{ postedBy: userId }, { companyId: user.companyId }] }),
    Job.countDocuments({ companyId: user.companyId, status: "PENDING" }),
    Job.countDocuments({ companyId: user.companyId, status: "LIVE" }),
    user.companyId ? Event.countDocuments({ primaryHostId: user.companyId }) : 0,
  ]);

  const data = {
    user: {
      email: user.email,
      role: user.role,
      legalName: user.legalName,
      isFaceVerified: user.isFaceVerified,
    },
    company: companyData,
  };

  if (user.role === "EMPLOYEE") {
    data.stats = { totalJobsPosted, liveJobs, totalEvents };
  } else if (user.role === "ADMIN") {
    data.stats = { totalJobsPosted, pendingJobs, liveJobs, totalEvents };
  } else if (user.role === "OWNER") {
    data.stats = { totalJobsPosted, pendingJobs, liveJobs, totalEvents };
    data.companyStats = await getCompanyStatsData(user.companyId);
  }

  return data;
};

// 3. Company Stats
export const getCompanyStatsData = async (companyId) => {
  if (!companyId) throw new Error("User does not belong to a company");

  const company = await Company.findById(companyId).lean();
  if (!company) throw new Error("Company not found");

  const [totalEmployees, totalAdmins, totalJobs, totalEvents] = await Promise.all([
    User.countDocuments({ companyId, role: "EMPLOYEE" }),
    User.countDocuments({ companyId, role: "ADMIN" }),
    Job.countDocuments({ companyId }),
    Event.countDocuments({ primaryHostId: companyId }),
  ]);

  return {
    companyName: company.name,
    totalEmployees,
    totalAdmins,
    totalJobs,
    totalEvents,
  };
};

// 4. Job Dashboard
export const getJobDashboardData = async (companyId) => {
  if (!companyId) throw new Error("User does not belong to a company");

  const jobs = await Job.find({ companyId }).lean();
  
  return {
    liveJobs: jobs.filter(j => j.status === "LIVE"),
    pendingJobs: jobs.filter(j => j.status === "PENDING"),
    reportedJobs: jobs.filter(j => j.status === "REPORTED"),
  };
};

// 5. Event Dashboard
export const getEventDashboardData = async (companyId) => {
  if (!companyId) throw new Error("User does not belong to a company");

  const events = await Event.find({ $or: [{ primaryHostId: companyId }, { coHostId: companyId }] }).lean();

  return {
    pending: events.filter(e => e.collaborationStatus === "PENDING_PARTNER"),
    approved: events.filter(e => e.collaborationStatus === "APPROVED" && e.escrowStatus === "ESCROW_HELD"),
    completed: events.filter(e => e.escrowStatus === "RELEASED"),
  };
};
