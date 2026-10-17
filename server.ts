// Project X | Learning Quest - Express Fullstack Server
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { UnlockCodeRateLimiter } from './src/utils/security.ts';
import { parseEvidenceUrl } from './src/utils/evidenceParser.ts';
import { calculateLevelInfo } from './src/utils/gamification.ts';
import { evaluateDeadline } from './src/utils/deadlineHelper.ts';
import { User, StudentProgress, EvidenceSubmission, TeacherFeedback, PortfolioData, NotificationItem } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter instance for unlock codes
const unlockLimiter = new UnlockCodeRateLimiter(5, 30); // 5 attempts, 30s lockout

// In-memory active sessions: token -> userId
const sessions = new Map<string, string>();

// Simple Token Helper
function generateToken(userId: string): string {
  const token = `tok_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessions.set(token, userId);
  return token;
}

// Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const userId = sessions.get(token);
  if (!userId) {
    res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    return;
  }
  const user = db.getData().users.find((u) => u.id === userId);
  if (!user) {
    res.status(401).json({ error: 'Không tìm thấy thông tin tài khoản.' });
    return;
  }
  (req as any).user = user;
  next();
}

function teacherOnly(req: Request, res: Response, next: NextFunction): void {
  const user: User = (req as any).user;
  if (!user || user.role !== 'teacher') {
    res.status(403).json({ error: 'Bạn không có quyền truy cập khu vực giáo viên.' });
    return;
  }
  next();
}

// -------------------------------------------------------------
// 1. AUTH ROUTES
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, studentId, pin, username, password } = req.body;
  const data = db.getData();

  if (role === 'teacher') {
    // Teacher Login: username 'giaovien' and password 'fpt123456'
    if (
      (username === 'giaovien' || username === 'lanphuong.dodo@gmail.com') &&
      password === 'fpt123456'
    ) {
      const teacher = data.users.find((u) => u.role === 'teacher');
      if (teacher) {
        const token = generateToken(teacher.id);
        res.json({ token, user: teacher });
        return;
      }
    }
    res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu giáo viên không chính xác.' });
    return;
  }

  // Student Login: Student ID (e.g. FPT10A01) and PIN (e.g. 1234)
  if (!studentId) {
    res.status(400).json({ error: 'Vui lòng nhập Mã số học sinh (ví dụ: FPT10A01).' });
    return;
  }

  const normalizedId = studentId.trim().toUpperCase();
  const student = data.users.find(
    (u) => u.role === 'student' && u.studentId?.toUpperCase() === normalizedId
  );

  if (!student) {
    res.status(404).json({
      error: `Không tìm thấy mã số học sinh "${normalizedId}" trong danh sách lớp 10A.`,
    });
    return;
  }

  // Default demo pin is 1234 if pin is provided
  if (pin && pin.trim() !== '1234') {
    res.status(401).json({ error: 'Mã PIN không chính xác (mặc định demo là 1234).' });
    return;
  }

  const token = generateToken(student.id);
  res.json({ token, user: student });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const data = db.getData();
  // Fetch fresh user data with latest XP & Level
  const fresh = data.users.find((u) => u.id === user.id) || user;
  res.json({ user: fresh });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// -------------------------------------------------------------
// 2. STAGES & QUESTS ROUTES (SECURITY HARDENED)
// -------------------------------------------------------------

// GET /api/stages - list all stages & quests
app.get('/api/stages', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const data = db.getData();
  const isTeacher = user.role === 'teacher';

  const userProgress = data.progress[user.id] || {};

  // For students: strip secret unlockCodes and quiz answers!
  const sanitizedStages = data.stages.map((stage) => {
    return {
      ...stage,
      quests: stage.quests.map((quest) => {
        const studentProgress: StudentProgress = userProgress[quest.id] || {
          questId: quest.id,
          unlocked: quest.unlockType === 'prerequisite' ? false : false,
          status: 'locked',
          attemptsCount: 0,
          recoveryAttempts: 0,
        };

        // Determine deadline status
        const deadlineInfo = evaluateDeadline(quest.deadline);
        let computedStatus = studentProgress.status;
        if (computedStatus !== 'completed') {
          if (deadlineInfo.isOverdue && computedStatus === 'in_progress') {
            computedStatus = 'overdue';
          }
        }

        const baseQuest = {
          id: quest.id,
          stageId: quest.stageId,
          title: quest.title,
          summary: quest.summary,
          storyline: quest.storyline,
          order: quest.order,
          xpReward: quest.xpReward,
          badgeReward: quest.badgeReward,
          unlockType: quest.unlockType,
          deadline: quest.deadline,
          durationMinutes: quest.durationMinutes,
          maxAttempts: quest.maxAttempts,
          isDemoContent: quest.isDemoContent,
          userProgress: {
            ...studentProgress,
            status: computedStatus,
          },
          deadlineInfo,
        };

        if (isTeacher) {
          // Teacher sees secret unlock codes & answers
          return {
            ...baseQuest,
            unlockCode: quest.unlockCode,
            learningHub: quest.learningHub,
            interactiveGame: quest.interactiveGame,
            evidenceRequirement: quest.evidenceRequirement,
            recoveryConfig: quest.recoveryConfig,
          };
        }

        // Student only gets learningHub & interactiveGame IF quest is UNLOCKED
        if (studentProgress.unlocked) {
          // Strip correct answers from interactiveGame so students cannot inspect client memory!
          const sanitizedGame = {
            ...quest.interactiveGame,
            questions: quest.interactiveGame.questions.map((q) => {
              const { correctAnswer, targetAnswer, ...safeQuestion } = q as any;
              return safeQuestion;
            }),
          };

          return {
            ...baseQuest,
            learningHub: quest.learningHub,
            interactiveGame: sanitizedGame,
            evidenceRequirement: quest.evidenceRequirement,
            recoveryConfig: quest.recoveryConfig,
          };
        }

        // For locked quests: do not include questions or learning materials in response
        return baseQuest;
      }),
    };
  });

  res.json({ stages: sanitizedStages });
});

// POST /api/quests/:questId/unlock - server-side code validation with rate-limiting
app.post('/api/quests/:questId/unlock', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId } = req.params;
  const { code } = req.body;

  if (user.role === 'teacher') {
    res.json({ success: true, message: 'Giáo viên luôn có toàn quyền truy cập.' });
    return;
  }

  const rateCheck = unlockLimiter.checkRateLimit(user.id, questId);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Bạn đã nhập sai mã nhiều lần. Vui lòng chờ ${rateCheck.remainingWaitSeconds} giây trước khi thử lại!`,
      locked: true,
      remainingWaitSeconds: rateCheck.remainingWaitSeconds,
    });
    return;
  }

  const data = db.getData();
  let foundQuest: any = null;
  for (const stage of data.stages) {
    const q = stage.quests.find((item) => item.id === questId);
    if (q) {
      foundQuest = q;
      break;
    }
  }

  if (!foundQuest) {
    res.status(404).json({ error: 'Không tìm thấy chặng yêu cầu.' });
    return;
  }

  const expectedCode = (foundQuest.unlockCode || '').trim().toUpperCase();
  const providedCode = (code || '').trim().toUpperCase();

  if (!providedCode) {
    res.status(400).json({ error: 'Vui lòng nhập mã mở khóa do giáo viên cấp.' });
    return;
  }

  if (expectedCode && providedCode === expectedCode) {
    // Record success
    unlockLimiter.recordAttempt(user.id, questId, true);

    if (!data.progress[user.id]) {
      data.progress[user.id] = {};
    }

    const currentProg = data.progress[user.id][questId] || {
      questId,
      unlocked: false,
      status: 'locked',
      attemptsCount: 0,
      recoveryAttempts: 0,
    };

    currentProg.unlocked = true;
    currentProg.unlockedAt = new Date().toISOString();
    currentProg.status = 'unlocked';
    data.progress[user.id][questId] = currentProg;

    db.save();

    res.json({
      success: true,
      message: `Chúc mừng bạn! Chặng "${foundQuest.title}" đã được mở khóa thành công!`,
      questId,
      unlockedAt: currentProg.unlockedAt,
    });
  } else {
    const attemptResult = unlockLimiter.recordAttempt(user.id, questId, false);
    if (attemptResult.locked) {
      res.status(429).json({
        error: `Bạn đã nhập sai 5 lần. Hệ thống tạm khóa mở chặng trong ${attemptResult.remainingWaitSeconds} giây để bảo vệ an toàn.`,
        locked: true,
        remainingWaitSeconds: attemptResult.remainingWaitSeconds,
      });
    } else {
      res.status(400).json({
        error: `Mã mở khóa không chính xác. Bạn còn ${attemptResult.attemptsLeft} lượt thử.`,
        locked: false,
        attemptsLeft: attemptResult.attemptsLeft,
      });
    }
  }
});

// GET /api/quests/:questId - get single quest full details
app.get('/api/quests/:questId', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId } = req.params;
  const data = db.getData();

  let targetQuest: any = null;
  let stageTitle = '';
  for (const s of data.stages) {
    const q = s.quests.find((item) => item.id === questId);
    if (q) {
      targetQuest = q;
      stageTitle = s.title;
      break;
    }
  }

  if (!targetQuest) {
    res.status(404).json({ error: 'Không tìm thấy chặng này.' });
    return;
  }

  const userProgress = (data.progress[user.id] && data.progress[user.id][questId]) || {
    questId,
    unlocked: false,
    status: 'locked',
    attemptsCount: 0,
    recoveryAttempts: 0,
  };

  if (user.role !== 'teacher' && !userProgress.unlocked) {
    res.status(403).json({
      error: 'Chặng này chưa được mở khóa. Hãy nhập mã mở khóa để truy cập nội dung.',
      isLocked: true,
    });
    return;
  }

  // Sanitize game questions for student (hide correct answers)
  const isTeacher = user.role === 'teacher';
  const game = {
    ...targetQuest.interactiveGame,
    questions: targetQuest.interactiveGame.questions.map((q: any) => {
      if (isTeacher) return q;
      const { correctAnswer, targetAnswer, ...safe } = q;
      return safe;
    }),
  };

  res.json({
    quest: {
      ...targetQuest,
      interactiveGame: game,
      unlockCode: isTeacher ? targetQuest.unlockCode : undefined,
    },
    stageTitle,
    userProgress,
  });
});

// POST /api/quests/:questId/submit - submit game answers, calculate score & XP
app.post('/api/quests/:questId/submit', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId } = req.params;
  const { answers } = req.body; // e.g. { q1: 0, q2: 2, cp1: 'EMPATHY' }
  const data = db.getData();

  let targetQuest: any = null;
  for (const s of data.stages) {
    const q = s.quests.find((item) => item.id === questId);
    if (q) {
      targetQuest = q;
      break;
    }
  }

  if (!targetQuest) {
    res.status(404).json({ error: 'Không tìm thấy chặng này.' });
    return;
  }

  const questions = targetQuest.interactiveGame.questions;
  let correctCount = 0;
  const results: Record<string, { isCorrect: boolean; explanation?: string; yourAnswer: any }> = {};

  for (const q of questions) {
    const studentAns = answers ? answers[q.id] : undefined;
    let isCorrect = false;

    if (q.type === 'multiple_choice' || q.type === 'scenario') {
      isCorrect = Number(studentAns) === Number(q.correctAnswer);
    } else if (q.type === 'crypto_puzzle' || q.type === 'fill_blank') {
      const normalizedStudent = (studentAns || '').toString().trim().toUpperCase();
      const normalizedTarget = (q.targetAnswer || '').trim().toUpperCase();
      isCorrect = normalizedStudent === normalizedTarget;
    } else {
      isCorrect = true; // default true for open items
    }

    if (isCorrect) correctCount++;
    results[q.id] = {
      isCorrect,
      explanation: q.explanation,
      yourAnswer: studentAns,
    };
  }

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const isPassed = scorePercent >= 60; // 60% passing score

  if (!data.progress[user.id]) {
    data.progress[user.id] = {};
  }

  const prog = data.progress[user.id][questId] || {
    questId,
    unlocked: true,
    status: 'in_progress',
    attemptsCount: 0,
    recoveryAttempts: 0,
  };

  prog.attemptsCount += 1;
  prog.score = scorePercent;

  let xpEarned = 0;
  let newBadgeEarned = null;

  if (isPassed) {
    prog.status = 'completed';
    prog.completedAt = new Date().toISOString();
    xpEarned = targetQuest.xpReward || 150;
    prog.xpEarned = xpEarned;

    // Update student total XP & Level
    const studentUser = data.users.find((u) => u.id === user.id);
    if (studentUser) {
      studentUser.xp = (studentUser.xp || 0) + xpEarned;
      const levelInfo = calculateLevelInfo(studentUser.xp);
      studentUser.level = levelInfo.level;
    }

    if (targetQuest.badgeReward) {
      newBadgeEarned = targetQuest.badgeReward;
    }
  } else {
    prog.status = 'in_progress';
  }

  data.progress[user.id][questId] = prog;
  db.save();

  res.json({
    success: true,
    isPassed,
    scorePercent,
    correctCount,
    totalQuestions,
    xpEarned,
    badgeEarned: newBadgeEarned,
    results,
    message: isPassed
      ? `Tuyệt vời! Bạn đã vượt qua chặng với ${scorePercent}% điểm số và nhận ${xpEarned} XP!`
      : `Bạn đạt ${scorePercent}%. Hãy xem lại kiến thức nền và thử lại nhé!`,
  });
});

// POST /api/quests/:questId/recovery - submit recovery task if overdue
app.post('/api/quests/:questId/recovery', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId } = req.params;
  const { reflectionNote, quizAnswer } = req.body;
  const data = db.getData();

  let targetQuest: any = null;
  for (const s of data.stages) {
    const q = s.quests.find((item) => item.id === questId);
    if (q) {
      targetQuest = q;
      break;
    }
  }

  if (!targetQuest) {
    res.status(404).json({ error: 'Không tìm thấy chặng này.' });
    return;
  }

  if (!data.progress[user.id]) {
    data.progress[user.id] = {};
  }

  const prog = data.progress[user.id][questId] || {
    questId,
    unlocked: true,
    status: 'overdue',
    attemptsCount: 0,
    recoveryAttempts: 0,
  };

  const recoveryConfig = targetQuest.recoveryConfig;
  if (!recoveryConfig || !recoveryConfig.enabled) {
    res.status(400).json({ error: 'Chặng này không có nhiệm vụ khôi phục quyền.' });
    return;
  }

  // Recovery evaluation
  let passed = false;
  if (recoveryConfig.taskType === 'reflection') {
    if (reflectionNote && reflectionNote.trim().length >= 30) {
      passed = true;
    } else {
      res.status(400).json({ error: 'Đoạn phản tư cần tối thiểu 30 ký tự để được phê duyệt khôi phục.' });
      return;
    }
  } else {
    // quiz
    passed = true;
  }

  if (passed) {
    prog.recoveryAttempts += 1;
    prog.status = 'in_progress';
    // Extend deadline by recoveryConfig.extendedHours
    const extendedHours = recoveryConfig.extendedHours || 24;
    const newDeadline = new Date(Date.now() + extendedHours * 3600 * 1000).toISOString();
    prog.deadlineOverridden = newDeadline;

    if (!prog.recoveryHistory) prog.recoveryHistory = [];
    prog.recoveryHistory.push({
      date: new Date().toISOString(),
      taskType: recoveryConfig.taskType,
      score: 100,
      status: 'completed',
    });

    data.progress[user.id][questId] = prog;
    db.save();

    res.json({
      success: true,
      message: `Khôi phục quyền thành công! Bạn đã được gia hạn thêm ${extendedHours} giờ để hoàn thành chặng.`,
      newDeadline,
    });
  }
});

// -------------------------------------------------------------
// 3. FLASHCARDS PROGRESS
// -------------------------------------------------------------

// POST /api/flashcards/status
app.post('/api/flashcards/status', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { cardId, state } = req.body;
  const data = db.getData();

  if (!cardId || !state) {
    res.status(400).json({ error: 'Thiếu cardId hoặc state' });
    return;
  }

  if (!data.flashcardProgress[user.id]) {
    data.flashcardProgress[user.id] = {};
  }

  data.flashcardProgress[user.id][cardId] = {
    cardId,
    state,
    updatedAt: new Date().toISOString(),
  };

  db.save();
  res.json({ success: true, progress: data.flashcardProgress[user.id] });
});

// GET /api/flashcards/progress
app.get('/api/flashcards/progress', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const data = db.getData();
  const progress = data.flashcardProgress[user.id] || {};
  res.json({ progress });
});

// -------------------------------------------------------------
// 4. EVIDENCE SUBMISSION ("MINH CHỨNG CỦA TÔI" QUA URL)
// -------------------------------------------------------------

// GET /api/evidence
app.get('/api/evidence', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId } = req.query;
  const data = db.getData();

  let list = data.evidence;
  if (user.role === 'student') {
    // Student only sees their own evidence!
    list = list.filter((e) => e.studentId === user.id);
  }

  if (questId) {
    list = list.filter((e) => e.questId === questId);
  }

  res.json({ evidence: list });
});

// POST /api/evidence - submit URL evidence
app.post('/api/evidence', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { questId, url, title, description } = req.body;

  if (!url || !title) {
    res.status(400).json({ error: 'Vui lòng cung cấp tiêu đề và đường dẫn liên kết minh chứng.' });
    return;
  }

  // Parse & validate URL
  const parsed = parseEvidenceUrl(url);
  if (!parsed.isValid) {
    res.status(400).json({ error: parsed.warningNote || 'Đường dẫn không hợp lệ.' });
    return;
  }

  const data = db.getData();
  const newEvidence: EvidenceSubmission = {
    id: `evi-${Date.now()}`,
    studentId: user.id,
    questId,
    url: url.trim(),
    title: title.trim(),
    description: (description || '').trim(),
    submittedAt: new Date().toISOString(),
    detectedType: parsed.type,
    embedUrl: parsed.embedUrl,
    status: 'submitted',
  };

  data.evidence.push(newEvidence);
  db.save();

  res.json({
    success: true,
    evidence: newEvidence,
    parsedInfo: parsed,
    message: 'Minh chứng đã được lưu thành công và sẵn sàng để giáo viên xem xét!',
  });
});

// PUT /api/evidence/:id/review (Teacher only)
app.put('/api/evidence/:id/review', authMiddleware, teacherOnly, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, teacherFeedback, teacherScore } = req.body;
  const data = db.getData();

  const item = data.evidence.find((e) => e.id === id);
  if (!item) {
    res.status(404).json({ error: 'Không tìm thấy minh chứng này.' });
    return;
  }

  item.status = status || item.status;
  item.teacherFeedback = teacherFeedback;
  item.teacherScore = teacherScore;
  item.reviewedAt = new Date().toISOString();

  // Create notification for student
  data.notifications.push({
    id: `notif-${Date.now()}`,
    studentId: item.studentId,
    questId: item.questId,
    type: 'feedback_posted',
    title: 'Minh chứng của bạn đã được giáo viên đánh giá',
    message: `Cô Đỗ Lan Phương đã nhận xét minh chứng "${item.title}". Trạng thái: ${item.status === 'approved' ? 'Đã duyệt đạt' : 'Cần chỉnh sửa'}.`,
    createdAt: new Date().toISOString(),
    isRead: false,
  });

  db.save();
  res.json({ success: true, evidence: item });
});

// -------------------------------------------------------------
// 5. PERSONAL TEACHER FEEDBACK (BY STAGE)
// -------------------------------------------------------------

// GET /api/feedback
app.get('/api/feedback', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const data = db.getData();

  if (user.role === 'teacher') {
    res.json({ feedback: data.feedback });
    return;
  }

  // Student only sees published feedback for themselves!
  const studentFeedback = data.feedback.filter(
    (f) => f.studentId === user.id && !f.isDraft
  );
  res.json({ feedback: studentFeedback });
});

// POST /api/teacher/feedback (Teacher only)
app.post('/api/teacher/feedback', authMiddleware, teacherOnly, (req: Request, res: Response) => {
  const teacher: User = (req as any).user;
  const { studentId, stageId, generalNote, strengths, areasForGrowth, nextGoals, engagementRating, isDraft } = req.body;

  if (!studentId || !stageId || !generalNote) {
    res.status(400).json({ error: 'Vui lòng điền đầy đủ học sinh, giai đoạn và nội dung nhận xét.' });
    return;
  }

  const data = db.getData();
  let existing = data.feedback.find((f) => f.studentId === studentId && f.stageId === stageId);

  if (existing) {
    existing.generalNote = generalNote;
    existing.strengths = strengths || [];
    existing.areasForGrowth = areasForGrowth || [];
    existing.nextGoals = nextGoals || '';
    existing.engagementRating = engagementRating || 5;
    existing.isDraft = Boolean(isDraft);
    existing.updatedAt = new Date().toISOString();
  } else {
    existing = {
      id: `fb-${Date.now()}`,
      studentId,
      stageId,
      teacherName: teacher.displayName,
      updatedAt: new Date().toISOString(),
      isDraft: Boolean(isDraft),
      generalNote,
      strengths: strengths || [],
      areasForGrowth: areasForGrowth || [],
      nextGoals: nextGoals || '',
      engagementRating: engagementRating || 5,
    };
    data.feedback.push(existing);
  }

  // If published, notify student
  if (!isDraft) {
    data.notifications.push({
      id: `notif-${Date.now()}`,
      studentId,
      type: 'feedback_posted',
      title: 'Nhận xét cá nhân mới từ giáo viên',
      message: `${teacher.displayName} vừa công bố thư nhận xét và định hướng phát triển cá nhân cho bạn.`,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  db.save();
  res.json({ success: true, feedback: existing });
});

// -------------------------------------------------------------
// 6. PORTFOLIO (MY CREATIVE PORTFOLIO)
// -------------------------------------------------------------

// GET /api/portfolio/:studentId
app.get('/api/portfolio/:studentId', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { studentId } = req.params;

  // Student can only see their own portfolio unless teacher
  if (user.role === 'student' && user.id !== studentId) {
    res.status(403).json({ error: 'Bạn chỉ có quyền xem Portfolio của chính mình.' });
    return;
  }

  const data = db.getData();
  const student = data.users.find((u) => u.id === studentId);
  if (!student) {
    res.status(404).json({ error: 'Không tìm thấy học sinh.' });
    return;
  }

  const portfolio = data.portfolios[studentId] || {
    studentId,
    template: 'journey',
    colorTheme: 'orange',
    bio: 'Học sinh lớp 10A FPT Hậu Giang, hào hứng chinh phục hành trình Project X.',
    motto: 'Học qua trải nghiệm - Sáng tạo vì cộng đồng!',
    selectedBadges: [],
    selectedEvidences: [],
    reflectionNotes: {
      learned: '',
      challenges: '',
      proudest: '',
      futureGoal: '',
    },
    stickers: [],
    updatedAt: new Date().toISOString(),
  };

  const studentProgress = data.progress[studentId] || {};
  const studentEvidences = data.evidence.filter((e) => e.studentId === studentId);
  const studentFeedbacks = data.feedback.filter((f) => f.studentId === studentId && !f.isDraft);

  res.json({
    student,
    portfolio,
    progress: studentProgress,
    evidence: studentEvidences,
    feedback: studentFeedbacks,
    stages: data.stages,
  });
});

// PUT /api/portfolio
app.put('/api/portfolio', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  if (user.role !== 'student') {
    res.status(403).json({ error: 'Chỉ học sinh mới có thể chỉnh sửa Portfolio cá nhân.' });
    return;
  }

  const { template, colorTheme, bio, motto, selectedBadges, selectedEvidences, reflectionNotes, stickers } = req.body;
  const data = db.getData();

  const current: PortfolioData = {
    studentId: user.id,
    template: template || 'journey',
    colorTheme: colorTheme || 'orange',
    bio: (bio || '').trim(),
    motto: (motto || '').trim(),
    selectedBadges: selectedBadges || [],
    selectedEvidences: selectedEvidences || [],
    reflectionNotes: reflectionNotes || {
      learned: '',
      challenges: '',
      proudest: '',
      futureGoal: '',
    },
    stickers: stickers || [],
    updatedAt: new Date().toISOString(),
  };

  data.portfolios[user.id] = current;
  db.save();

  res.json({ success: true, portfolio: current });
});

// -------------------------------------------------------------
// 7. LEADERBOARD (STAGE & OVERALL)
// -------------------------------------------------------------

// GET /api/leaderboard
app.get('/api/leaderboard', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { stageId } = req.query;
  const data = db.getData();

  const students = data.users.filter((u) => u.role === 'student');

  const leaderboard = students.map((s) => {
    const studentProg = data.progress[s.id] || {};
    let completedQuestsCount = 0;
    let stageXp = 0;

    for (const [qId, prog] of Object.entries(studentProg)) {
      if (prog.status === 'completed') {
        completedQuestsCount++;
        // If filtering by stage
        if (stageId) {
          const questInStage = data.stages
            .find((st) => st.id === stageId)
            ?.quests.some((q) => q.id === qId);
          if (questInStage) {
            stageXp += prog.xpEarned || 0;
          }
        }
      }
    }

    const totalXp = stageId ? stageXp : s.xp || 0;
    const levelInfo = calculateLevelInfo(s.xp || 0);

    return {
      studentId: s.id,
      displayName: s.displayName,
      avatar: s.avatar,
      totalXp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      completedQuests: completedQuestsCount,
      badgesCount: (data.portfolios[s.id]?.selectedBadges || []).length + 1,
      isCurrentStudent: s.id === user.id,
    };
  });

  // Sort by totalXp descending
  leaderboard.sort((a, b) => b.totalXp - a.totalXp);

  // Assign ranks
  const ranked = leaderboard.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));

  res.json({ leaderboard: ranked });
});

// -------------------------------------------------------------
// 8. NOTIFICATIONS
// -------------------------------------------------------------

// GET /api/notifications
app.get('/api/notifications', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const data = db.getData();

  const userNotifs = data.notifications
    .filter((n) => n.studentId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ notifications: userNotifs });
});

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;
  const data = db.getData();

  const item = data.notifications.find((n) => n.id === id && n.studentId === user.id);
  if (item) {
    item.isRead = true;
    db.save();
  }

  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. TEACHER MANAGEMENT
// -------------------------------------------------------------

// GET /api/teacher/students - list all students with stats
app.get('/api/teacher/students', authMiddleware, teacherOnly, (req: Request, res: Response) => {
  const data = db.getData();
  const students = data.users.filter((u) => u.role === 'student');

  const detailed = students.map((s) => {
    const prog = data.progress[s.id] || {};
    const evidences = data.evidence.filter((e) => e.studentId === s.id);
    const feedbackList = data.feedback.filter((f) => f.studentId === s.id);
    const levelInfo = calculateLevelInfo(s.xp || 0);

    return {
      ...s,
      levelInfo,
      progress: prog,
      evidenceCount: evidences.length,
      feedbackCount: feedbackList.length,
    };
  });

  res.json({ students: detailed });
});

// POST /api/teacher/quests/:questId - edit quest unlock code, deadline, questions
app.post('/api/teacher/quests/:questId', authMiddleware, teacherOnly, (req: Request, res: Response) => {
  const { questId } = req.params;
  const { unlockCode, deadline, title, summary, xpReward } = req.body;
  const data = db.getData();

  let foundQuest: any = null;
  for (const stage of data.stages) {
    const q = stage.quests.find((item) => item.id === questId);
    if (q) {
      foundQuest = q;
      break;
    }
  }

  if (!foundQuest) {
    res.status(404).json({ error: 'Không tìm thấy chặng này.' });
    return;
  }

  if (unlockCode !== undefined) foundQuest.unlockCode = unlockCode.trim().toUpperCase();
  if (deadline !== undefined) foundQuest.deadline = deadline;
  if (title !== undefined) foundQuest.title = title.trim();
  if (summary !== undefined) foundQuest.summary = summary.trim();
  if (xpReward !== undefined) foundQuest.xpReward = Number(xpReward);

  db.save();
  res.json({ success: true, quest: foundQuest });
});

// POST /api/teacher/reset-database
app.post('/api/teacher/reset-database', authMiddleware, teacherOnly, (req: Request, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu mẫu thành công.' });
});

// -------------------------------------------------------------
// VITE CLIENT MOUNTING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PROJECT X | LEARNING QUEST Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
