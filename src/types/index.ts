// Project X | Learning Quest - Shared Data Types

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  role: UserRole;
  displayName: string;
  avatar: string;
  // Student specific
  studentId?: string; // e.g. FHG30070
  className?: string; // 10A
  school?: string; // TH, THCS & THPT FPT Hậu Giang
  xp?: number;
  level?: number;
  streak?: number;
  totalActiveDays?: number;
  activeDates?: string[]; // array of YYYY-MM-DD
  portfolioBackgroundId?: string;
  // Teacher specific
  username?: string;
  passwordHash?: string;
  salt?: string;
  title?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
}

export type FlashcardMastery = 'unseen' | 'need_review' | 'mastered';

export interface FlashcardReviewState {
  cardId: string;
  state: FlashcardMastery;
  updatedAt: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
  example?: string;
}

export interface LearningHub {
  theorySummary: string;
  keyConcepts: KeyConcept[];
  guidelines: string[];
  externalLinks?: Array<{ title: string; url: string }>;
  flashcards: Flashcard[];
}

export type GameType =
  | 'multiple_choice'
  | 'pairing'
  | 'sequence'
  | 'fill_blank'
  | 'crypto_puzzle'
  | 'scenario';

export interface GameQuestion {
  id: string;
  prompt: string;
  type: GameType;
  options?: string[];
  // For multiple_choice & scenario
  correctAnswer?: string | number;
  explanation?: string;
  // For pairing
  pairs?: Array<{ left: string; right: string }>;
  // For sequence
  correctSequence?: string[];
  // For fill_blank & crypto_puzzle
  hint?: string;
  clue?: string;
  cipherText?: string;
  targetAnswer?: string; // Case-insensitive compare on server
}

export interface InteractiveGame {
  type: GameType;
  instructions: string;
  timeLimitSeconds?: number;
  questions: GameQuestion[];
}

export interface EvidenceRequirement {
  required: boolean;
  title: string;
  description: string;
  allowedTypes: string[];
  rubricSummary: string;
}

export interface RecoveryConfig {
  enabled: boolean;
  title: string;
  taskType: 'quiz' | 'reflection' | 'plan';
  instructions: string;
  minPassingScore: number;
  extendedHours: number;
  maxRecoveryAttempts: number;
  requiresTeacherApproval: boolean;
  questions?: Array<{
    id: string;
    prompt: string;
    type: 'multiple_choice' | 'reflection';
    options?: string[];
    correctAnswer?: string;
  }>;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export type QuestStatus =
  | 'locked'
  | 'unlocked'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'recovery_needed'
  | 'pending_review';

export interface Quest {
  id: string;
  stageId: string;
  title: string;
  summary: string;
  storyline: string;
  order: number;
  xpReward: number;
  badgeReward?: Badge;
  unlockType: 'code' | 'prerequisite' | 'time' | 'both';
  unlockCode?: string; // ONLY available on server; stripped when sending to student if locked!
  prerequisiteQuestId?: string;
  deadline?: string;
  durationMinutes?: number;
  maxAttempts?: number;
  isDemoContent: boolean; // Must clearly indicate "NỘI DUNG DEMO"
  learningHub: LearningHub;
  interactiveGame: InteractiveGame;
  evidenceRequirement?: EvidenceRequirement;
  recoveryConfig: RecoveryConfig;
  passThreshold?: number; // e.g. 50 (meaning > 50%), 60, 70
  gradingRule?: 'proportional' | 'full_on_pass';
  status?: 'draft' | 'published';
  instructions?: string;
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  colorTheme: string;
  isPublished: boolean;
  status?: 'draft' | 'published' | 'archived';
  startDate?: string;
  endDate?: string;
  leaderboardPublished: boolean;
  quests: Quest[];
}

export interface AttemptHistoryItem {
  attemptNumber: number;
  date: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  xpEarned: number;
}

export interface StudentProgress {
  questId: string;
  unlocked: boolean;
  unlockedAt?: string;
  status: QuestStatus;
  score?: number; // Latest score
  highestScore?: number; // Highest score achieved
  xpEarned?: number; // Latest XP
  highestXp?: number; // Highest XP recorded
  completedAt?: string;
  attemptsCount: number;
  attemptsHistory?: AttemptHistoryItem[];
  recoveryAttempts: number;
  deadlineOverridden?: string;
  recoveryHistory?: Array<{
    date: string;
    taskType: string;
    score: number;
    status: 'completed' | 'approved';
  }>;
}

export interface EvidenceSubmission {
  id: string;
  studentId: string;
  questId: string;
  url: string;
  title: string;
  description: string;
  submittedAt: string;
  detectedType: 'google_docs' | 'google_sheets' | 'google_slides' | 'google_drive' | 'youtube' | 'image' | 'generic';
  embedUrl: string | null;
  status: 'submitted' | 'needs_revision' | 'approved';
  teacherFeedback?: string;
  teacherScore?: number;
  reviewedAt?: string;
}

export interface TeacherFeedback {
  id: string;
  studentId: string;
  stageId: string;
  teacherName: string;
  updatedAt: string;
  isDraft: boolean;
  generalNote: string;
  strengths: string[];
  areasForGrowth: string[];
  nextGoals: string;
  engagementRating: number; // 1-5
}

export interface StickerPlacement {
  id: string;
  stickerKey: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface PortfolioBackgroundItem {
  id: string;
  name: string;
  description?: string;
  url: string; // image URL or CSS background string
  thumbnailUrl?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
}

export interface PortfolioData {
  studentId: string;
  backgroundId?: string;
  themeBackground?: string; // resolved background url/style
  colorTheme?: string;
  bio?: string;
  motto?: string;
  selectedBadges?: string[];
  selectedEvidences?: string[];
  reflectionNotes: {
    // 3 Required Prompts for Dấu ấn cá nhân & phản tư:
    nhanThuc?: string; // NHẬN THỨC — em HIỂU điều gì hơn về mình & về thay đổi?
    hanhVi?: string;   // HÀNH VI — em LÀM gì khác so với trước?
    cachHoc?: string;  // CÁCH HỌC — em HỌC / em thay đổi bản thân thế nào?
    // Backward compatibility
    learned?: string;
    challenges?: string;
    proudest?: string;
    futureGoal?: string;
  };
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  studentId: string;
  questId?: string;
  type: 'deadline_48h' | 'deadline_24h' | 'deadline_6h' | 'overdue' | 'recovery_ready' | 'feedback_posted' | 'badge_earned';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string; // for internal comparison
  displayName: string;
  avatar: string;
  totalXp: number;
  level: number;
  completedQuests: number;
  badgesCount: number;
  isCurrentStudent?: boolean;
}
