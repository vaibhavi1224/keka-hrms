
// Simple client-side rate limiting for sensitive operations
interface RateLimitRule {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, rule: RateLimitRule): boolean {
    const now = Date.now();
    const windowStart = now - rule.windowMs;
    
    // Get existing attempts for this key
    const keyAttempts = this.attempts.get(key) || [];
    
    // Filter out attempts outside the current window
    const recentAttempts = keyAttempts.filter(time => time > windowStart);
    
    // Check if within rate limit
    if (recentAttempts.length >= rule.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Predefined rate limit rules
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  LEAVE_APPLICATION: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 applications per hour
  SEARCH: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 searches per minute
} as const;
