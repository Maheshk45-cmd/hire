import { getUserNotificationsData } from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotificationsData(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
