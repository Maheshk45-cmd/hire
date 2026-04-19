import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const signupService = async (email, password) => {
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const newUser = await User.create({
    email,
    password,
  });

  return newUser;
};

export const loginService = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const payload = {
    id: user._id,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || "default_fallback_secret_123";
  // The token expires in 1 day
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });

  return { user, token };
};
