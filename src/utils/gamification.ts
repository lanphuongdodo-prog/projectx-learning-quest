// Project X | Learning Quest - Gamification Progression & Badge Logic

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentProgressXp: number;
  progressPercent: number;
}

export const LEVEL_THRESHOLDS: Array<{ level: number; title: string; minXp: number }> = [
  { level: 1, title: 'Tân binh Khởi hành', minXp: 0 },
  { level: 2, title: 'Nhà Thám hiểm Tập sự', minXp: 150 },
  { level: 3, title: 'Nhà Giải mã Dự án', minXp: 350 },
  { level: 4, title: 'Kỹ sư Ý tưởng FPT', minXp: 650 },
  { level: 5, title: 'Chuyên gia Giải pháp X', minXp: 1050 },
  { level: 6, title: 'Thủ lĩnh Sáng tạo 10A', minXp: 1550 },
  { level: 7, title: 'Bậc thầy Project X', minXp: 2200 },
];

export function calculateLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp || 0);

  let currentTier = LEVEL_THRESHOLDS[0];
  let nextTier = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i].minXp) {
      currentTier = LEVEL_THRESHOLDS[i];
      nextTier = LEVEL_THRESHOLDS[i + 1] || {
        level: currentTier.level + 1,
        title: 'Huyền thoại Dự án',
        minXp: currentTier.minXp + 800,
      };
      break;
    }
  }

  const range = Math.max(1, nextTier.minXp - currentTier.minXp);
  const currentProgressXp = safeXp - currentTier.minXp;
  const progressPercent = Math.min(100, Math.round((currentProgressXp / range) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    minXp: currentTier.minXp,
    nextLevelXp: nextTier.minXp,
    currentProgressXp,
    progressPercent,
  };
}

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'journey' | 'skill' | 'perseverance' | 'portfolio';
}

export const SYSTEM_BADGES: BadgeDefinition[] = [
  {
    id: 'first_quest',
    name: 'Bước chân đầu tiên',
    icon: '🚀',
    description: 'Hoàn thành chặng khám phá đầu tiên của Project X',
    category: 'journey',
  },
  {
    id: 'crypto_cracker',
    name: 'Bậc thầy Mật mã',
    icon: '🧩',
    description: 'Giải mã thành công thử thách câu đố logic',
    category: 'skill',
  },
  {
    id: 'knowledge_seeker',
    name: 'Nhà Khám phá Tri thức',
    icon: '📚',
    description: 'Ôn tập và nắm vững toàn bộ bộ thẻ Flashcard của một chặng',
    category: 'skill',
  },
  {
    id: 'evidence_master',
    name: 'Minh chứng Xuất sắc',
    icon: '📎',
    description: 'Nộp đường dẫn minh chứng được giáo viên đánh giá tích cực',
    category: 'portfolio',
  },
  {
    id: 'phoenix_resilience',
    name: 'Tinh thần Phượng Hoàng',
    icon: '🔥',
    description: 'Hoàn thành nhiệm vụ khôi phục quyền để tiếp tục hành trình',
    category: 'perseverance',
  },
  {
    id: 'creative_designer',
    name: 'Nghệ nhân Portfolio',
    icon: '🎨',
    description: 'Tùy biến Portfolio cá nhân với sticker và thông điệp truyền cảm hứng',
    category: 'portfolio',
  },
];

/**
 * Requirement 5.1: Calculate quest pass condition (> 50% of scored questions or custom threshold)
 * Formula: minCorrectNeeded = Math.floor(totalScoredQuestions / 2) + 1 when threshold is 50%
 * E.g.: 10 -> 6; 8 -> 5; 5 -> 3; 3 -> 2; 2 -> 2.
 */
export function calculateQuestPass(
  correctCount: number,
  totalScoredQuestions: number,
  thresholdPercent = 50
): {
  isPassed: boolean;
  minCorrectNeeded: number;
  accuracyPercent: number;
} {
  const safeTotal = Math.max(1, totalScoredQuestions);
  const minCorrectNeeded =
    thresholdPercent <= 50
      ? Math.floor(safeTotal / 2) + 1
      : Math.max(1, Math.ceil((thresholdPercent / 100) * safeTotal));
  const isPassed = correctCount >= minCorrectNeeded;
  const accuracyPercent = Math.round((correctCount / safeTotal) * 100);

  return {
    isPassed,
    minCorrectNeeded,
    accuracyPercent,
  };
}

/**
 * Requirement 4 & 5.2: Calculate XP earned based on accuracy and quest maxXpReward
 * Supports proportional conversion (accuracy % * maxXpReward) or full XP on pass
 */
export function calculateXpEarned(
  correctCount: number,
  totalScoredQuestions: number,
  maxXpReward: number,
  gradingRule: 'proportional' | 'full_on_pass' = 'proportional'
): number {
  const safeTotal = Math.max(1, totalScoredQuestions);
  const safeMaxXp = Math.max(1, maxXpReward || 100);
  const { isPassed } = calculateQuestPass(correctCount, safeTotal);

  if (!isPassed) {
    // If not passed, can award partial encouragement XP (proportional * 0.5)
    return Math.round((correctCount / safeTotal) * safeMaxXp * 0.5);
  }

  if (gradingRule === 'full_on_pass') {
    return safeMaxXp;
  }

  // Passed: proportional to accuracy
  return Math.round((correctCount / safeTotal) * safeMaxXp);
}


