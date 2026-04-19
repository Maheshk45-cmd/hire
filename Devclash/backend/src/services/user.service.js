import User from "../models/user.model.js";

// Helper strictly for business logic to evaluate status
const evaluateVerificationStatus = (user) => {
  if (user.is_identity_verified && user.is_face_verified) {
    user.verification_status = "VERIFIED";
  }
  return user;
};

export const verifyIdentityService = async (userId) => {
  let user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.is_identity_verified = true;
  user = evaluateVerificationStatus(user);

  await user.save();
  return user;
};

export const verifyFaceService = async (userId) => {
  let user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.is_face_verified = true;
  user = evaluateVerificationStatus(user);

  await user.save();
  return user;
};

export const getUserStatusService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  return {
    is_identity_verified: user.is_identity_verified,
    is_face_verified: user.is_face_verified,
    verification_status: user.verification_status,
  };
};
