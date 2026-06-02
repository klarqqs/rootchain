import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "./auth.service.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/api-response.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  role: z.enum(["INVESTOR", "FARMER"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, result, 201);
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
});

authRouter.post("/refresh", validateBody(refreshSchema), async (req, res, next) => {
  try {
    const tokens = await refreshSession(req.body.refreshToken);
    sendSuccess(res, { tokens });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", validateBody(refreshSchema), async (req, res, next) => {
  try {
    await logoutUser(req.body.refreshToken);
    sendSuccess(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { sub } = (req as AuthenticatedRequest).auth;
    const user = await getUserById(sub);
    sendSuccess(res, { user });
  } catch (e) {
    next(e);
  }
});
