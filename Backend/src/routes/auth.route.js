import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { register, verifyEmail, login, getMe } from "../controller/auth.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const authRouter = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 * @body { email: string, password: string, name: string }
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST /auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email: string, password: string }
 */
authRouter.post("/login", loginValidator, login);

/**
 * @route GET /auth/verify-email
 * @desc Verify user email
 * @access Public
 * @query { token: string }
 */
authRouter.get("/verify-email", verifyEmail);

/**
 * @route GET /auth/me
 * @desc Get current logged in user
 * @access Private
 */
authRouter.get("/me", authUser, getMe);

export default authRouter;
