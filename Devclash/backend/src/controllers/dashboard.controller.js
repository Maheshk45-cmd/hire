import {
  getTrustScoreData,
  getUserDashboardData,
  getCompanyStatsData,
  getJobDashboardData,
  getEventDashboardData
} from "../services/dashboard.service.js";

export const getTrustScore = async (req, res) => {
  try {
    const data = await getTrustScoreData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getDashboardMe = async (req, res) => {
  try {
    const data = await getUserDashboardData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCompanyStats = async (req, res) => {
  try {
    const data = await getCompanyStatsData(req.user.companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobDashboard = async (req, res) => {
  try {
    const data = await getJobDashboardData(req.user.companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getEventDashboard = async (req, res) => {
  try {
    const data = await getEventDashboardData(req.user.companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
