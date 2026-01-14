import type { NextFunction, Request, Response } from "express";

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  trustProxy?: boolean;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export const createRateLimiter = ({
  windowMs,
  max,
  trustProxy = false
}: RateLimitOptions) => {
  const hits = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const key =
      trustProxy && typeof forwardedFor === "string" && forwardedFor.length > 0
        ? forwardedFor.split(",")[0].trim()
        : req.ip || "unknown";
    const now = Date.now();
    const existing = hits.get(key);

    if (!existing || now > existing.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      existing.count += 1;
      hits.set(key, existing);
    }

    const entry = hits.get(key);
    if (!entry) {
      next();
      return;
    }

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("X-RateLimit-Limit", max.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(entry.resetAt / 1000).toString()
    );

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      res.status(429).json({
        error: "rate_limit_exceeded",
        retryAfterSeconds
      });
      return;
    }

    next();
  };
};
