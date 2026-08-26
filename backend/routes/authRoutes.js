const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmail, getResetEmailHtml, getOtpEmailHtml } = require("../utils/sendEmail");

const router = express.Router();

// ==========================================
// POST /api/auth/register
// ==========================================
router.post(
  "/register",
  [
    check("name").trim().notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

    

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Send response without password
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// ==========================================
// POST /api/auth/login
// ==========================================
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("LOGIN ROUTE HIT");

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Password incorrect
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // Create JWT token
    // ==========================================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Login successful
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// ==========================================
// POST /api/auth/forgot-password (OTP flow)
// Sends 6-digit OTP to email (10 min expiry)
// ==========================================
router.post(
  "/forgot-password",
  [check("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return success to avoid enumeration
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If an account with that email exists, an OTP has been sent.",
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      user.resetOtp = hashedOtp;
      user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      user.resetOtpVerified = false;
      // Clear old link token if any
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      const html = getOtpEmailHtml({ name: user.name, otp });
      const text = `Hi ${user.name || "there"},\n\nYour ResumeAI password reset OTP is: ${otp}\nIt expires in 10 minutes. Enter this OTP on the reset page to verify and set a new password.\n\nIf you didn't request this, ignore this email.`;

      let emailResult = null;
      try {
        emailResult = await sendEmail({
          to: user.email,
          subject: "Your ResumeAI OTP - Password Reset",
          html,
          text,
        });
      } catch (emailErr) {
        console.error("Forgot-password OTP email failed:", emailErr.message);
      }

      // Never expose OTP in API response – only via email (security)
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent. Please check your inbox (and spam).",
      });
    } catch (error) {
      console.error("Forgot password OTP error:", error);
      return res.status(500).json({ success: false, message: "Server error, please try again later." });
    }
  }
);

// Keep old link-based endpoint for backward compat (if needed)
router.post(
  "/forgot-password-link",
  [check("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();
      const resetUrl = `${frontendBase.replace(/\/$/, "")}/reset-password/${rawToken}`;
      const html = getResetEmailHtml({ name: user.name, resetUrl });
      const text = `Hi ${user.name || "there"},\n\nReset link (expires in 1 hour): ${resetUrl}`;
      try { await sendEmail({ to: user.email, subject: "Reset your ResumeAI password", html, text }); } catch (e) { console.error(e.message); }
      return res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    } catch (e) { console.error(e); return res.status(500).json({ success: false, message: "Server error" }); }
  }
);

// ==========================================
// POST /api/auth/verify-otp
// ==========================================
router.post(
  "/verify-otp",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("otp").trim().isLength({ min: 4, max: 8 }).withMessage("OTP is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const { email, otp } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtp || !user.resetOtpExpires) {
        return res.status(400).json({ success: false, message: "Invalid OTP or email. Please request a new OTP." });
      }
      if (user.resetOtpExpires < new Date()) {
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      }
      const hashedOtp = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
      if (hashedOtp !== user.resetOtp) {
        return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
      }
      user.resetOtpVerified = true;
      await user.save();
      return res.status(200).json({ success: true, message: "OTP verified successfully. You can now reset your password." });
    } catch (e) {
      console.error("Verify OTP error:", e);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ==========================================
// POST /api/auth/reset-password-otp
// Body: { email, otp, password }
// Verifies OTP again and resets password
// ==========================================
router.post(
  "/reset-password-otp",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("otp").trim().notEmpty().withMessage("OTP is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const { email, otp, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtp || !user.resetOtpExpires) {
        return res.status(400).json({ success: false, message: "Invalid request. Please request a new OTP." });
      }
      if (user.resetOtpExpires < new Date()) {
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      }
      const hashedOtp = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
      if (hashedOtp !== user.resetOtp) {
        return res.status(400).json({ success: false, message: "Invalid OTP." });
      }
      // OTP correct -> reset password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpVerified = false;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(200).json({ success: true, message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (e) {
      console.error("Reset password OTP error:", e);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ==========================================
// POST /api/auth/reset-password/:token
// ==========================================
router.post(
  "/reset-password/:token",
  [check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Password reset link is invalid or has expired. Please request a new one.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ success: false, message: "Server error, please try again later." });
    }
  }
);

// ==========================================
// GET /api/auth/me
// Protected route
// ==========================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
module.exports = router;
