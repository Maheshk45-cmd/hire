import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    await Otp.deleteMany({ email }); // Clear older pending OTPs
    await Otp.create({ 
       email, 
       otpHash, 
       expiresAt: Date.now() + 10 * 60 * 1000 
    });
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"HireX Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your HireX Verification Code",
        html: `
          <div style="font-family: monospace; background-color: #0D0D0D; color: #FFFFFF; padding: 40px; border-radius: 8px;">
            <h2 style="font-family: sans-serif;">HIREX SYSTEM</h2>
            <p style="color: #AAAAAA;">Your one-time authorization token is:</p>
            <h1 style="color: #FF7A00; font-size: 36px; letter-spacing: 12px; margin: 30px 0;">${otp}</h1>
            <p style="color: #666666; font-size: 12px; text-transform: uppercase;">Token securely expires in 10 minutes. Do not share this key strictly.</p>
          </div>
        `
      });
    } else {
      console.log(`\n\n[MOCK EMAIL SERVER] OTP for ${email} is: ${otp}\n\n`);
    }

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("[OTP Error]", error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp) return res.status(400).json({ error: "No OTP requested or expired" });

    const inputHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (storedOtp.otpHash !== inputHash) return res.status(400).json({ error: "Invalid OTP" });

    await Otp.deleteMany({ email });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user initialized with this protocol." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hr
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"HireX Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "HireX Security: Password Reset Link",
        html: `
          <div style="font-family: monospace; background-color: #0D0D0D; color: #FFFFFF; padding: 40px; border-radius: 8px;">
            <h2 style="font-family: sans-serif;">HIREX SECURITY DIRECTIVE</h2>
            <p style="color: #AAAAAA;">A request to reset your security key was initiated.</p>
            <p>Access the following secure terminal link to execute the reset:</p>
            <a href="${resetUrl}" style="display:inline-block; margin: 20px 0; padding: 15px 30px; background-color: #FF7A00; color: #0D0D0D; text-decoration: none; font-weight: bold; border-radius: 8px; font-family: sans-serif; text-transform: uppercase;">INITIALIZE KEY RESET</a>
            <p style="color: #666666; font-size: 12px; text-transform: uppercase;">Link expires in securely in 60 minutes. If unauthorized, disregard.</p>
          </div>
        `
      });
    } else {
      console.log(`\n\n[MOCK EMAIL SERVER] Reset Link for ${email}:\n${resetUrl}\n\n`);
    }

    res.status(200).json({ message: "Secure reset protocol dispatched." });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    res.status(500).json({ error: "Could not send reset email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Token is invalid or has expired" });

    user.password = password; // pre-save hook will bcrypt it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: "Security Key updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Final Signup (requires earlier valid OTP conceptually in frontend)
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = await User.create({ email, password });
    
    res.status(201).json({
      message: "Account created successfully.",
      userId: newUser._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mock Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      role: user.role,
      companyId: user.companyId,
    };

    const secret = process.env.JWT_SECRET || "default_fallback_secret_123";
    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Mock Digilocker
export const verifyDigilocker = async (req, res) => {
  try {
    const { digilockerToken } = req.body;
    if (!digilockerToken) return res.status(400).json({ error: "Token required" });

    // Mock extraction
    const mockExtractedName = "Verified Name";

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { legalName: mockExtractedName },
      { new: true }
    );

    res.status(200).json({ message: "Digilocker verification successful", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mock Face Verification
export const verifyFace = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isFaceVerified: true },
      { new: true }
    );

    res.status(200).json({ message: "Face verification successful", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
