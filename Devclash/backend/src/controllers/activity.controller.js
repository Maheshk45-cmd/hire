import { getCompanyFeedData } from "../services/activity.service.js";

export const getFeed = async (req, res) => {
  try {
    const feed = await getCompanyFeedData(req.user.companyId);
    res.status(200).json(feed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
