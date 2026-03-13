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
    await sendEmail({
      to: email,
      subject: "Welcome to Chatbot",
      html: `<p>Hi, ${username},</p><br>
      <p>Thank you for registering at <strong>Chatbot</strong>. We're excited to have you on board!</p>
      <p>Best regards,<br>
      The Chatbot Team</p>`,
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
