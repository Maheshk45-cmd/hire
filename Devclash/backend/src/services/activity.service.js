import Activity from "../models/activity.model.js";

export const logActivity = async ({ userId, companyId, type, message }) => {
  try {
    if (!companyId) return;
    await Activity.create({ userId: userId || null, companyId, type, message });
  } catch (error) {
    console.error("[ACTIVITY LOG ERROR]:", error.message);
  }
};

export const getCompanyFeedData = async (companyId) => {
  if (!companyId) throw new Error("No company linked to request.");
  
  return await Activity.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
};
