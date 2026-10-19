import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UnlockCodeRateLimiter,
  normalizeStudentName,
  normalizeMSHS,
  isStudentAuthMatch,
  hashPassword,
  verifyPassword,
} from '../src/utils/security.ts';
import { parseEvidenceUrl } from '../src/utils/evidenceParser.ts';
import {
  calculateLevelInfo,
  calculateQuestPass,
  calculateXpEarned,
} from '../src/utils/gamification.ts';
import { evaluateDeadline } from '../src/utils/deadlineHelper.ts';
import { calculateStreakAfterActivity } from '../src/utils/streakHelper.ts';

test('Student Name & MSHS Normalization and Auth Matching', () => {
  // Whitespace and case normalization
  assert.equal(normalizeStudentName('  Lê   Văn   Quốc An  '), 'lê văn quốc an');
  assert.equal(normalizeMSHS('  fhg30070  '), 'FHG30070');

  // Match test
  const recordName = 'Lê Văn Quốc An';
  const recordMSHS = 'FHG30070';

  // 1. Correct name and MSHS (even with extra spaces / mixed case)
  assert.equal(isStudentAuthMatch('lê  văn quốc an', 'fhg30070', recordName, recordMSHS), true);
  assert.equal(isStudentAuthMatch('LÊ VĂN QUỐC AN', 'FHG30070', recordName, recordMSHS), true);

  // 2. Correct MSHS but wrong name -> reject
  assert.equal(isStudentAuthMatch('Ngô Quốc An', 'FHG30070', recordName, recordMSHS), false);

  // 3. Correct name but wrong MSHS -> reject
  assert.equal(isStudentAuthMatch('Lê Văn Quốc An', 'FHG30077', recordName, recordMSHS), false);

  // 4. Missing fields
  assert.equal(isStudentAuthMatch('', 'FHG30070', recordName, recordMSHS), false);
  assert.equal(isStudentAuthMatch('Lê Văn Quốc An', '', recordName, recordMSHS), false);
});

test('Password Hashing and Verification (Teacher adminpdp / #PdpProX1)', () => {
  const password = '#PdpProX1';
  const { hash, salt } = hashPassword(password);

  // Hash must not equal plain text
  assert.notEqual(hash, password);
  assert.ok(hash.length > 20);

  // Verification
  assert.equal(verifyPassword('#PdpProX1', hash, salt), true);
  assert.equal(verifyPassword('WrongPass', hash, salt), false);
  assert.equal(verifyPassword('', hash, salt), false);
});

test('Quest Pass Condition (> 50% required)', () => {
  // 10 questions: floor(10/2) + 1 = 6.
  assert.equal(calculateQuestPass(5, 10).isPassed, false);
  assert.equal(calculateQuestPass(6, 10).isPassed, true);
  assert.equal(calculateQuestPass(6, 10).minCorrectNeeded, 6);

  // 8 questions: floor(8/2) + 1 = 5.
  assert.equal(calculateQuestPass(4, 8).isPassed, false);
  assert.equal(calculateQuestPass(5, 8).isPassed, true);

  // 5 questions: floor(5/2) + 1 = 3.
  assert.equal(calculateQuestPass(2, 5).isPassed, false);
  assert.equal(calculateQuestPass(3, 5).isPassed, true);

  // 3 questions: floor(3/2) + 1 = 2.
  assert.equal(calculateQuestPass(1, 3).isPassed, false);
  assert.equal(calculateQuestPass(2, 3).isPassed, true);

  // 2 questions: floor(2/2) + 1 = 2.
  assert.equal(calculateQuestPass(1, 2).isPassed, false);
  assert.equal(calculateQuestPass(2, 2).isPassed, true);

  // Custom threshold tests (e.g. 70%)
  assert.equal(calculateQuestPass(6, 10, 70).isPassed, false); // 6 < 7
  assert.equal(calculateQuestPass(7, 10, 70).isPassed, true);

  // Proportional XP calculation
  assert.equal(calculateXpEarned(6, 10, 100, 'proportional'), 60);
  assert.equal(calculateXpEarned(8, 10, 100, 'proportional'), 80);
  assert.equal(calculateXpEarned(10, 10, 100, 'proportional'), 100);
  assert.equal(calculateXpEarned(3, 5, 50, 'proportional'), 30);
  assert.equal(calculateXpEarned(5, 5, 50, 'proportional'), 50);

  // Full on pass rule
  assert.equal(calculateXpEarned(6, 10, 100, 'full_on_pass'), 100);
});

test('parseEvidenceUrl - recognizes Google Docs, Sheets, Slides, Drive and formats preview embeds', () => {
  // Google Docs (/edit -> /preview)
  const doc = parseEvidenceUrl('https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
  assert.equal(doc.isValid, true);
  assert.equal(doc.type, 'google_docs');
  assert.equal(doc.canEmbed, true);
  assert.equal(doc.embedUrl, 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview');

  // Google Sheets (/edit -> /preview)
  const sheet = parseEvidenceUrl('https://docs.google.com/spreadsheets/d/1qpyC0X951WYS836TvCXxUFLtlHYhGWWXF/edit#gid=0');
  assert.equal(sheet.isValid, true);
  assert.equal(sheet.type, 'google_sheets');
  assert.equal(sheet.canEmbed, true);
  assert.equal(sheet.embedUrl, 'https://docs.google.com/spreadsheets/d/1qpyC0X951WYS836TvCXxUFLtlHYhGWWXF/preview');

  // Google Slides (/edit -> /preview)
  const slide = parseEvidenceUrl('https://docs.google.com/presentation/d/1a2b3c4d5e/edit');
  assert.equal(slide.isValid, true);
  assert.equal(slide.type, 'google_slides');
  assert.equal(slide.canEmbed, true);
  assert.equal(slide.embedUrl, 'https://docs.google.com/presentation/d/1a2b3c4d5e/preview');

  // Google Drive File (/view -> /preview)
  const drive = parseEvidenceUrl('https://drive.google.com/file/d/1xYz890abcdef/view?usp=sharing');
  assert.equal(drive.isValid, true);
  assert.equal(drive.type, 'google_drive');
  assert.equal(drive.canEmbed, true);
  assert.equal(drive.embedUrl, 'https://drive.google.com/file/d/1xYz890abcdef/preview');

  // YouTube
  const yt = parseEvidenceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(yt.isValid, true);
  assert.equal(yt.type, 'youtube');
  assert.equal(yt.canEmbed, true);
  assert.equal(yt.embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('UnlockCodeRateLimiter - enforces max attempts and cooldown lock', () => {
  const limiter = new UnlockCodeRateLimiter(3, 10);
  const userId = 'student-01';
  const questId = 'quest-1-1';
  const baseTime = 1000000;

  assert.equal(limiter.checkRateLimit(userId, questId, baseTime).allowed, true);

  limiter.recordAttempt(userId, questId, false, baseTime);
  limiter.recordAttempt(userId, questId, false, baseTime + 1000);
  const res3 = limiter.recordAttempt(userId, questId, false, baseTime + 2000);

  assert.equal(res3.locked, true);
  assert.equal(limiter.checkRateLimit(userId, questId, baseTime + 5000).allowed, false);
  assert.equal(limiter.checkRateLimit(userId, questId, baseTime + 13000).allowed, true);
});

test('Student MSHS preserves leading zeros and rejects empty fields', () => {
  assert.equal(normalizeMSHS('00123'), '00123');
  assert.equal(normalizeMSHS('  00456  '), '00456');
  assert.equal(normalizeMSHS('FHG30070'), 'FHG30070');

  // MSHS with leading zeros matches exactly
  assert.equal(isStudentAuthMatch('Nguyễn Văn A', '00123', 'Nguyễn Văn A', '00123'), true);
  assert.equal(isStudentAuthMatch('Nguyễn Văn A', '123', 'Nguyễn Văn A', '00123'), false); // Leading zero mismatch rejected
});

test('calculateStreakAfterActivity - enforces daily streak, prevents multi-increment, and resets on skipped days', () => {
  // Initial user: streak 0, totalActiveDays 0, activeDates []
  let user: { streak?: number; totalActiveDays?: number; activeDates?: string[] } = {
    streak: 0,
    totalActiveDays: 0,
    activeDates: [],
  };

  // Day 1: 2026-10-18 -> streak becomes 1, totalActiveDays 1
  let res = calculateStreakAfterActivity(user, '2026-10-18');
  assert.equal(res.currentStreak, 1);
  assert.equal(res.totalActiveDays, 1);
  assert.equal(res.isNewActiveDay, true);
  assert.equal(res.streakIncremented, true);
  user = { streak: res.currentStreak, totalActiveDays: res.totalActiveDays, activeDates: res.activeDates };

  // Second activity on Day 1: streak must NOT increment again
  res = calculateStreakAfterActivity(user, '2026-10-18');
  assert.equal(res.currentStreak, 1);
  assert.equal(res.totalActiveDays, 1);
  assert.equal(res.isNewActiveDay, false);
  assert.equal(res.streakIncremented, false);

  // Day 2 (Consecutive: 2026-10-19) -> streak becomes 2, totalActiveDays 2
  res = calculateStreakAfterActivity(user, '2026-10-19');
  assert.equal(res.currentStreak, 2);
  assert.equal(res.totalActiveDays, 2);
  assert.equal(res.isNewActiveDay, true);
  assert.equal(res.streakIncremented, true);
  user = { streak: res.currentStreak, totalActiveDays: res.totalActiveDays, activeDates: res.activeDates };

  // Skipped day 2026-10-20, next activity on 2026-10-21 -> streak resets to 1, totalActiveDays 3
  res = calculateStreakAfterActivity(user, '2026-10-21');
  assert.equal(res.currentStreak, 1);
  assert.equal(res.totalActiveDays, 3);
  assert.equal(res.isNewActiveDay, true);
  assert.equal(res.streakIncremented, true);
});

