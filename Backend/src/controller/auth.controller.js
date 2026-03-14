import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

/**
 * @desc Register a new user
 * @route POST /auth/register
 * @access Public
 * @body { email: string, password: string, name: string }
 */
export async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or username already in use",
        success: false,
        err: "User already exists",
      });
    }

    const user = new userModel({ username, email, password });

    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
    );

    await sendEmail({
      to: email,
      subject: "Welcome to Askly!",
      html: `<p>Hi, ${username},</p><br>
      <p>Thank you for registering at <strong>Askly</strong>. We're excited to have you on board!</p>
      <p>To get started, please verify your email address by clicking the link below:</p><br>
      <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a><br><br>
      <p>If you did not create an account, please ignore this email.</p><br>
      <p>Best regards,<br>
      The Askly Team</p>`,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @desc Verify user email
 * @route GET /auth/verify-email
 * @access Public
 * @query { token: string }
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    return res.send(`
      <h1>Email Verified</h1>
      <p>Your email has been successfully verified. You can now log in to your account.</p>
    `);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: error.message,
    });
  }
}

/**
 * @desc Login user and return JWT token
 * @route POST /auth/login
 * @access Public
 * @body { email: string, password: string }
 */
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "Incorrect password",
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Email not verified",
        success: false,
        err: "Please verify your email",
      });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });

      return res.json({
        message: "Login successful",
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      err: error.message,
    });
  }
}

/**
 * @desc Get current user info
 * @route GET /auth/me
 * @access Private
 */
export async function getMe(req, res) {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        err: "User not found",
      });
    }

    return res.json({
      message: "User info retrieved successfully",
      success: true,
      user: { user },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      err: error.message,
    });
  }
}
