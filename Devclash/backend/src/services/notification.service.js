import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sendNotification = async (userId, message) => {
  try {
    if (!userId) return;
    await Notification.create({ userId, message });
  } catch (error) {
    console.error("[NOTIFY ERROR]:", error.message);
  }
};

export const sendNotificationToAdmins = async (companyId, message) => {
  try {
    if (!companyId) return;
    const admins = await User.find({ companyId, role: { $in: ["ADMIN", "OWNER"] } });
    const bulkEnv = admins.map(admin => Notification.create({ userId: admin._id, message }));
    await Promise.all(bulkEnv);
  } catch (error) {
    console.error("[ADMIN NOTIFY ERROR]:", error.message);
  }
};

export const getUserNotificationsData = async (userId) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
};
