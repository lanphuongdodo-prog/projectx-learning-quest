// Project X | Learning Quest - Security, Normalization & Rate Limiting Logic
import crypto from 'node:crypto';

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

/**
 * Normalizes full Vietnamese student name:
 * - Trims leading and trailing whitespace
 * - Collapses multiple spaces between words into a single space
 * - Lowercases for comparison
 */
export function normalizeStudentName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Normalizes Student ID (MSHS):
 * - Preserves string representation so leading zeros are never lost
 * - Trims whitespace
 * - Uppercases
 */
export function normalizeMSHS(mshs: string): string {
  if (!mshs) return '';
  return String(mshs).trim().toUpperCase();
}

/**
 * Checks if provided full name and MSHS match a registered student record
 */
export function isStudentAuthMatch(
  inputName: string,
  inputMSHS: string,
  recordName: string,
  recordMSHS: string
): boolean {
  const normInputName = normalizeStudentName(inputName);
  const normRecordName = normalizeStudentName(recordName);
  const normInputMSHS = normalizeMSHS(inputMSHS);
  const normRecordMSHS = normalizeMSHS(recordMSHS);

  return normInputName === normRecordName && normInputMSHS === normRecordMSHS;
}

/**
 * Hash password securely with salt using SHA-256
 */
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}
