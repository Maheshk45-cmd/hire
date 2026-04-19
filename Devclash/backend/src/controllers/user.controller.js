import { verifyIdentityService, verifyFaceService, getUserStatusService } from "../services/user.service.js";

export const verifyIdentity = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await verifyIdentityService(userId);

    res.status(200).json({
      message: "Identity verified successfully (MOCK)",
      verification_status: updatedUser.verification_status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyFace = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await verifyFaceService(userId);

    res.status(200).json({
      message: "Face verified successfully (MOCK)",
      verification_status: updatedUser.verification_status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await getUserStatusService(userId);

    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
