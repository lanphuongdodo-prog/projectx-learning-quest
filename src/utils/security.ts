// Project X | Learning Quest - Security & Rate Limiting Logic

export interface AttemptRecord {
  count: number;
  lastAttemptTime: number;
  lockedUntil: number;
}

export class UnlockCodeRateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private maxAttempts: number;
  private lockoutDurationMs: number;

  constructor(maxAttempts = 5, lockoutDurationSeconds = 30) {
    this.maxAttempts = maxAttempts;
    this.lockoutDurationMs = lockoutDurationSeconds * 1000;
  }

  private getKey(userId: string, questId: string): string {
    return `${userId}:${questId}`;
  }

  public checkRateLimit(userId: string, questId: string, now = Date.now()): {
    allowed: boolean;
    remainingWaitSeconds?: number;
    attemptsLeft?: number;
  } {
    const key = this.getKey(userId, questId);
    const record = this.attempts.get(key);

    if (!record) {
      return { allowed: true, attemptsLeft: this.maxAttempts };
    }

    if (record.lockedUntil > now) {
      const remainingWaitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remainingWaitSeconds, attemptsLeft: 0 };
    }

    // Cooldown expired, reset if lockout has passed
    if (record.lockedUntil > 0 && record.lockedUntil <= now) {
      this.attempts.delete(key);
      return { allowed: true, attemptsLeft: this.maxAttempts };
    }

    const attemptsLeft = Math.max(0, this.maxAttempts - record.count);
    return { allowed: true, attemptsLeft };
  }

  public recordAttempt(userId: string, questId: string, success: boolean, now = Date.now()): {
    success: boolean;
    locked: boolean;
    remainingWaitSeconds?: number;
    attemptsLeft: number;
  } {
    const key = this.getKey(userId, questId);

    if (success) {
      this.attempts.delete(key);
      return { success: true, locked: false, attemptsLeft: this.maxAttempts };
    }

    const record = this.attempts.get(key) || {
      count: 0,
      lastAttemptTime: now,
      lockedUntil: 0,
    };

    record.count += 1;
    record.lastAttemptTime = now;

    if (record.count >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutDurationMs;
      this.attempts.set(key, record);
      return {
        success: false,
        locked: true,
        remainingWaitSeconds: Math.ceil(this.lockoutDurationMs / 1000),
        attemptsLeft: 0,
      };
    }

    this.attempts.set(key, record);
    return {
      success: false,
      locked: false,
      attemptsLeft: this.maxAttempts - record.count,
    };
  }

  public clearRecord(userId: string, questId: string): void {
    this.attempts.delete(this.getKey(userId, questId));
  }
}
