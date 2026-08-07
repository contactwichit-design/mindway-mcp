import { CONFIG } from "../config.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static records = new Map<string, RateLimitRecord>();

  static extractClientIp(forwardedForHeader?: string, reqIp?: string): string {
    if (forwardedForHeader) {
      const ips = forwardedForHeader.split(",").map(s => s.trim());
      if (ips.length > 0 && ips[0]) {
        return ips[0];
      }
    }
    return reqIp || "127.0.0.1";
  }

  static check(ip: string): { allowed: boolean; remaining: number; resetInMs: number } {
    const now = Date.now();
    const record = this.records.get(ip);

    if (!record || now > record.resetTime) {
      this.records.set(ip, { count: 1, resetTime: now + CONFIG.RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: CONFIG.RATE_LIMIT_MAX_REQUESTS - 1, resetInMs: CONFIG.RATE_LIMIT_WINDOW_MS };
    }

    if (record.count >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetInMs: record.resetTime - now };
    }

    record.count++;
    return { allowed: true, remaining: CONFIG.RATE_LIMIT_MAX_REQUESTS - record.count, resetInMs: record.resetTime - now };
  }
}
