import type { Request, RequestHandler } from "express";

type RateLimitEntry = { count: number; resetsAt: number };

function clientKey(req: Request) {
  return `${req.ip}:${String(req.body?.email ?? "").trim().toLowerCase()}`;
}

/** A small in-process limiter for authentication endpoints. Replace with a
 * shared store when the API is deployed with more than one replica. */
export function authRateLimit({ limit = 10, windowMs = 15 * 60_000 } = {}): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();
  return (req, res, next) => {
    const now = Date.now();
    const key = clientKey(req);
    const previous = entries.get(key);
    const current = !previous || previous.resetsAt <= now
      ? { count: 0, resetsAt: now + windowMs }
      : previous;
    current.count += 1;
    entries.set(key, current);
    if (current.count > limit) {
      res.setHeader("Retry-After", String(Math.ceil((current.resetsAt - now) / 1000)));
      return res.status(429).json({ error: "Demasiados intentos. Intenta de nuevo más tarde." });
    }
    if (entries.size > 5_000) {
      for (const [entryKey, entry] of entries) if (entry.resetsAt <= now) entries.delete(entryKey);
    }
    next();
  };
}

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
};
