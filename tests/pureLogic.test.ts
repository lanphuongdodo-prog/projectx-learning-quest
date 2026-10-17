import test from 'node:test';
import assert from 'node:assert/strict';
import { UnlockCodeRateLimiter } from '../src/utils/security.ts';
import { parseEvidenceUrl } from '../src/utils/evidenceParser.ts';
import { calculateLevelInfo, LEVEL_THRESHOLDS } from '../src/utils/gamification.ts';
import { evaluateDeadline } from '../src/utils/deadlineHelper.ts';

test('UnlockCodeRateLimiter - enforces max attempts and cooldown lock', () => {
  const limiter = new UnlockCodeRateLimiter(3, 10); // 3 attempts, 10s lockout
  const userId = 'student-01';
  const questId = 'quest-1-1';
  const baseTime = 1000000;

  // Initial check
  const check1 = limiter.checkRateLimit(userId, questId, baseTime);
  assert.equal(check1.allowed, true);
  assert.equal(check1.attemptsLeft, 3);

  // 1st failed attempt
  const res1 = limiter.recordAttempt(userId, questId, false, baseTime);
  assert.equal(res1.success, false);
  assert.equal(res1.locked, false);
  assert.equal(res1.attemptsLeft, 2);

  // 2nd failed attempt
  const res2 = limiter.recordAttempt(userId, questId, false, baseTime + 1000);
  assert.equal(res2.success, false);
  assert.equal(res2.locked, false);
  assert.equal(res2.attemptsLeft, 1);

  // 3rd failed attempt - should lock!
  const res3 = limiter.recordAttempt(userId, questId, false, baseTime + 2000);
  assert.equal(res3.success, false);
  assert.equal(res3.locked, true);
  assert.equal(res3.remainingWaitSeconds, 10);

  // Check rate limit during lock
  const checkDuringLock = limiter.checkRateLimit(userId, questId, baseTime + 5000);
  assert.equal(checkDuringLock.allowed, false);
  assert.equal(checkDuringLock.remainingWaitSeconds, 7);

  // Check after lock expires (10 seconds later)
  const checkAfterLock = limiter.checkRateLimit(userId, questId, baseTime + 13000);
  assert.equal(checkAfterLock.allowed, true);
  assert.equal(checkAfterLock.attemptsLeft, 3);

  // Success resets state
  const resSuccess = limiter.recordAttempt(userId, questId, true, baseTime + 14000);
  assert.equal(resSuccess.success, true);
  assert.equal(resSuccess.locked, false);
});

test('parseEvidenceUrl - recognizes Google Docs, Sheets, Slides, YouTube and Drive', () => {
  // Google Docs
  const doc = parseEvidenceUrl('https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
  assert.equal(doc.isValid, true);
  assert.equal(doc.type, 'google_docs');
  assert.equal(doc.canEmbed, true);
  assert.equal(doc.embedUrl, 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview');

  // Google Sheets
  const sheet = parseEvidenceUrl('https://docs.google.com/spreadsheets/d/1qpyC0X951WYS836TvCXxUFLtlHYhGWWXF/edit#gid=0');
  assert.equal(sheet.isValid, true);
  assert.equal(sheet.type, 'google_sheets');
  assert.equal(sheet.canEmbed, true);
  assert.equal(sheet.embedUrl, 'https://docs.google.com/spreadsheets/d/1qpyC0X951WYS836TvCXxUFLtlHYhGWWXF/preview');

  // Google Slides
  const slide = parseEvidenceUrl('https://docs.google.com/presentation/d/1a2b3c4d5e/edit');
  assert.equal(slide.isValid, true);
  assert.equal(slide.type, 'google_slides');
  assert.equal(slide.canEmbed, true);
  assert.match(slide.embedUrl!, /presentation\/d\/1a2b3c4d5e\/embed/);

  // YouTube
  const yt = parseEvidenceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(yt.isValid, true);
  assert.equal(yt.type, 'youtube');
  assert.equal(yt.canEmbed, true);
  assert.equal(yt.embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

  // Direct image
  const img = parseEvidenceUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3.jpg');
  assert.equal(img.isValid, true);
  assert.equal(img.type, 'image');
  assert.equal(img.canEmbed, true);

  // Invalid or malicious protocols
  const malicious = parseEvidenceUrl('javascript:alert(1)');
  assert.equal(malicious.isValid, false);
});

test('calculateLevelInfo - computes correct tier and progress percentage', () => {
  const lvl1 = calculateLevelInfo(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentProgressXp, 50);
  assert.equal(lvl1.progressPercent, Math.round((50 / 150) * 100));

  const lvl2 = calculateLevelInfo(200);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.minXp, 150);
  assert.equal(lvl2.currentProgressXp, 50);

  const lvlMax = calculateLevelInfo(3000);
  assert.equal(lvlMax.level, 7);
  assert.ok(lvlMax.progressPercent >= 0);
});

test('evaluateDeadline - calculates friendly status and overdue notices', () => {
  const now = new Date('2026-10-17T12:00:00Z').getTime();

  // No deadline
  const noDl = evaluateDeadline(undefined, now);
  assert.equal(noDl.status, 'no_deadline');
  assert.equal(noDl.isOverdue, false);

  // In 5 hours (warning_6h)
  const in5Hours = new Date(now + 5 * 3600 * 1000).toISOString();
  const res5h = evaluateDeadline(in5Hours, now);
  assert.equal(res5h.status, 'warning_6h');
  assert.equal(res5h.isOverdue, false);

  // In 20 hours (warning_24h)
  const in20Hours = new Date(now + 20 * 3600 * 1000).toISOString();
  const res20h = evaluateDeadline(in20Hours, now);
  assert.equal(res20h.status, 'warning_24h');

  // Overdue by 3 hours
  const past3Hours = new Date(now - 3 * 3600 * 1000).toISOString();
  const resOverdue = evaluateDeadline(past3Hours, now);
  assert.equal(resOverdue.status, 'overdue');
  assert.equal(resOverdue.isOverdue, true);
});
