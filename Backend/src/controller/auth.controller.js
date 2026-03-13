import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

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
