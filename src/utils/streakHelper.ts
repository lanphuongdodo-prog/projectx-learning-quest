// Project X | Learning Quest - Streak Calculation Helper (Asia/Ho_Chi_Minh timezone)
import { User } from '../types/index.ts';

/**
 * Returns current date string in 'YYYY-MM-DD' formatted for Vietnam (Asia/Ho_Chi_Minh)
 */
export function getVietnamDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // e.g. "2026-10-19"
}

/**
 * Calculates calendar day difference between two 'YYYY-MM-DD' strings
 */
export function getCalendarDayDiff(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

export interface StreakUpdateResult {
  currentStreak: number;
  totalActiveDays: number;
  activeDates: string[];
  isNewActiveDay: boolean;
  streakIncremented: boolean;
}

/**
 * Processes a valid study activity and returns updated streak & active days stats.
 * Rules (Requirement 3):
 * 1. Only counts when student performs a valid study action (quiz, evidence, flashcard).
 * 2. Max 1 streak day per calendar day (Asia/Ho_Chi_Minh).
 * 3. Logging in without activity does NOT increment streak.
 * 4. First active day: streak goes from 0 to 1.
 * 5. Consecutive next day (diff == 1): streak increases by 1.
 * 6. Missed a day (diff > 1): streak broken, resets to 1 upon return.
 * 7. History of active dates stored to prevent duplicates.
 */
export function calculateStreakAfterActivity(
  user: {
    streak?: number;
    totalActiveDays?: number;
    activeDates?: string[];
  },
  todayStr: string = getVietnamDateString()
): StreakUpdateResult {
  const activeDates = Array.isArray(user.activeDates) ? [...user.activeDates] : [];
  let currentStreak = typeof user.streak === 'number' ? user.streak : 0;
  let totalActiveDays = typeof user.totalActiveDays === 'number' ? user.totalActiveDays : 0;

  // Check if today is already recorded as an active study day
  if (activeDates.includes(todayStr)) {
    return {
      currentStreak,
      totalActiveDays,
      activeDates,
      isNewActiveDay: false,
      streakIncremented: false,
    };
  }

  // Find the most recent active date before today
  const sortedDates = [...activeDates].sort();
  const lastActiveDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  if (!lastActiveDate) {
    // First ever study activity
    currentStreak = 1;
  } else {
    const diff = getCalendarDayDiff(lastActiveDate, todayStr);
    if (diff === 1) {
      // Consecutive day!
      currentStreak = currentStreak + 1;
    } else if (diff > 1) {
      // Broken streak: reset to 1
      currentStreak = 1;
    } else {
      // diff <= 0 (e.g., date in past or out of order), keep currentStreak or set to 1
      if (currentStreak === 0) currentStreak = 1;
    }
  }

  totalActiveDays += 1;
  activeDates.push(todayStr);
  activeDates.sort();

  return {
    currentStreak,
    totalActiveDays,
    activeDates,
    isNewActiveDay: true,
    streakIncremented: true,
  };
}
