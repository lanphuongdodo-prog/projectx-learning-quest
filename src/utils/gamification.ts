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
