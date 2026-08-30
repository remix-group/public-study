import type { RequestHandler } from "express";
import { prisma } from "@dian-study/infrastructure";
import { hashSessionToken } from "./crypto.js";

export const SESSION_COOKIE = "dian_session";

export function readSessionCookie(header: string | undefined) {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = readSessionCookie(req.headers.cookie);
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const session = await prisma.authSession.findUnique({
      where: { tokenHash: hashSessionToken(token) }, include: { student: true },
    });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.authSession.delete({ where: { id: session.id } });
      return res.status(401).json({ error: "Session expired" });
    }
    res.locals.studentId = session.studentId;
    res.locals.student = { id: session.student.id, name: session.student.name, email: session.student.email, role: session.student.role };
    next();
  } catch (error) { next(error); }
};

export const requireEditor: RequestHandler = (_req, res, next) => {
  if (res.locals.student?.role !== "editor") return res.status(403).json({ error: "Editor role required" });
  next();
};
