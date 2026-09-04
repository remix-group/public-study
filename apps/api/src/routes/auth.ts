import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";
import { AuthenticationError, EmailConflictError, loginStudent, registerStudent, revokeSession } from "../auth/service.js";
import { readSessionCookie, requireAuth, SESSION_COOKIE } from "../auth/middleware.js";

export const authRouter: ExpressRouter = Router();
const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(10).max(128) });
const registerSchema = credentialsSchema.extend({ name: z.string().trim().min(2).max(80) });
const secureCookie = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === "true"
  : process.env.NODE_ENV === "production";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: secureCookie, path: "/" };

authRouter.post("/register", async (req, res, next) => {
  try {
    const result = await registerStudent(registerSchema.parse(req.body));
    res.cookie(SESSION_COOKIE, result.token, { ...cookieOptions, expires: result.expiresAt });
    res.status(201).json({ student: result.student });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof EmailConflictError) return res.status(409).json({ error: error.message });
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const result = await loginStudent(credentialsSchema.parse(req.body));
    res.cookie(SESSION_COOKIE, result.token, { ...cookieOptions, expires: result.expiresAt });
    res.json({ student: result.student });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    if (error instanceof AuthenticationError) return res.status(401).json({ error: error.message });
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    await revokeSession(readSessionCookie(req.headers.cookie));
    res.clearCookie(SESSION_COOKIE, cookieOptions).status(204).end();
  } catch (error) { next(error); }
});

authRouter.get("/me", requireAuth, (_req, res) => res.json({ student: res.locals.student }));
