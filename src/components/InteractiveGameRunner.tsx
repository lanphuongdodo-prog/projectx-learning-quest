// Project X | Learning Quest - Interactive Game Runner (Quiz, Crypto Puzzle, Scenario & Recovery Flow)
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { InteractiveGame, RecoveryConfig, GameQuestion } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  KeyRound,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface InteractiveGameRunnerProps {
  questId: string;
  game: InteractiveGame;
  recoveryConfig?: RecoveryConfig;
  isCompleted?: boolean;
  isOverdue?: boolean;
  onGameCompleted: (res: any) => void;
  onOpenKnowledgeHub: () => void;
}

export const InteractiveGameRunner: React.FC<InteractiveGameRunnerProps> = ({
  questId,
  game,
  recoveryConfig,
  isCompleted = false,
  isOverdue = false,
  onGameCompleted,
  onOpenKnowledgeHub,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Recovery task state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [reflectionNote, setReflectionNote] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const questions = game?.questions || [];
  const currentQuestion: GameQuestion | undefined = questions[currentQIndex];

  const handleSelectOption = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleTextAnswer = (qId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.submitGame(questId, answers);
      setSubmissionResult(res);

      if (res.isPassed) {
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }

      onGameCompleted(res);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi kết quả thử thách');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async () => {
    if (!reflectionNote.trim() || reflectionNote.trim().length < 30) {
      alert('Đoạn phản tư cần ít nhất 30 ký tự để được phê duyệt khôi phục.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await api.submitRecovery(questId, { reflectionNote });
      setRecoverySuccess(res.message);
      setTimeout(() => {
        setShowRecoveryModal(false);
        window.location.reload();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi nhiệm vụ khôi phục');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // If overdue: show clear recovery banner
  if (isOverdue && !isCompleted) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border-2 border-rose-300 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl shadow-inner">
          ⏳
        </div>
        <h3 className="text-xl font-black text-rose-950">
          Chặng này đã hết thời hạn thực hiện!
        </h3>
        <p className="text-sm text-rose-800 max-w-md mx-auto leading-relaxed">
          Đừng nản lòng nhé! Project X đề cao tinh thần chịu trách nhiệm và sửa chữa sai sót. Hãy hoàn thành nhiệm vụ khôi phục quyền để nhận thêm 24 giờ hoàn thành thử thách.
        </p>

        <button
          onClick={() => setShowRecoveryModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-sm shadow-md hover:bg-rose-700 transition"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Kích hoạt Nhiệm vụ Khôi phục Quyền</span>
        </button>

        {/* Recovery Dialog */}
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left space-y-4 shadow-2xl border border-rose-200">
              <h4 className="text-lg font-black text-slate-900">
                {recoveryConfig?.title || 'Nhiệm vụ Khôi phục Quyền'}
              </h4>
              <p className="text-xs text-slate-600">
                {recoveryConfig?.instructions || 'Viết đoạn phản tư ngắn về bài học rút ra khi trễ hạn.'}
              </p>

              {recoverySuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
                  ✓ {recoverySuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đoạn phản tư của bạn (tối thiểu 30 ký tự):
                </label>
                <textarea
                  rows={4}
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  placeholder="Em nhận thấy việc phân bổ thời gian chưa hợp lý vì... Lần này em cam kết sẽ..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleRecoverySubmit}
                  disabled={recoveryLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 disabled:opacity-50"
                >
                  {recoveryLoading ? 'Đang gửi...' : 'Gửi phản tư & Gia hạn 24h'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If already submitted and showing result
  if (submissionResult) {
    const isPassed = submissionResult.isPassed;
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-xl space-y-6 text-center animate-in zoom-in-95">
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-md ${
            isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isPassed ? '🎉' : '💪'}
        </div>

        <div className="space-y-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isPassed ? 'THỬ THÁCH HOÀN THÀNH!' : 'CỐ GẮNG THÊM MỘT CHÚT!'}
          </span>
          <h3 className="text-2xl font-black text-slate-900">
            Kết quả: {submissionResult.scorePercent}% Điểm ({submissionResult.correctCount}/{submissionResult.totalQuestions} câu)
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {submissionResult.message}
          </p>
        </div>

        {/* XP & Badge Award Box */}
        {isPassed && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-sm mx-auto flex items-center justify-center gap-4">
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Phần thưởng đạt được</span>
              <span className="text-lg font-black text-orange-600">+{submissionResult.xpEarned} XP</span>
            </div>
            {submissionResult.badgeEarned && (
              <div className="flex items-center gap-2 pl-4 border-l border-amber-200">
                <span className="text-2xl">{submissionResult.badgeEarned.icon}</span>
                <div className="text-left">
                  <span className="text-xs font-black text-purple-900 block">{submissionResult.badgeEarned.name}</span>
                  <span className="text-[10px] text-purple-700">Huy hiệu mới!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Questions Review */}
        <div className="text-left space-y-3 pt-4 border-t border-slate-100 max-w-xl mx-auto">
          <h4 className="text-xs font-black uppercase text-slate-500">Chi tiết lời giải & Giải thích:</h4>
          {questions.map((q, idx) => {
            const res = submissionResult.results?.[q.id];
            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border text-xs ${
                  res?.isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {res?.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="font-bold text-slate-800">
                    Câu {idx + 1}: {q.prompt}
                  </p>
                </div>
                {res?.explanation && (
                  <p className="text-[11px] text-slate-600 pl-6 mt-1 italic">
                    💡 Giải thích: {res.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setSubmissionResult(null)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-orange-300 bg-orange-50/60 text-orange-800 text-xs font-bold hover:bg-orange-100 transition shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span>{isPassed || isCompleted ? 'Làm lại để cải thiện điểm' : 'Làm lại thử thách'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl">
        <p className="text-sm text-slate-500">Chưa có câu hỏi nào trong trò chơi này.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-amber-200/90 shadow-md p-6 sm:p-8 space-y-6">
      {/* Retrying Banner if already completed */}
      {isCompleted && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-black">✓ Đã vượt chặng:</span>
            <span className="text-emerald-800">
              Bạn đang làm lại để cải thiện điểm. Kết quả cao hơn sẽ được tự động cập nhật vào kỷ lục cá nhân!
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-extrabold text-[10px] uppercase shrink-0">
            Bảo lưu kết quả
          </span>
        </div>
      )}

      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
            Nhiệm vụ {currentQIndex + 1} / {questions.length}
          </span>
          <p className="text-xs text-slate-500 mt-1">{game.instructions}</p>
        </div>

        {/* Quick Knowledge review button */}
        <button
          onClick={onOpenKnowledgeHub}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-orange-700 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition"
          title="Xem nhanh lý thuyết và flashcard mà không mất tiến trình"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Xem lại kiến thức</span>
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentQIndex
                ? 'w-8 bg-orange-500'
                : answers[questions[idx].id] !== undefined
                ? 'w-4 bg-emerald-400'
                : 'w-3 bg-slate-200'
            }`}
            title={`Câu ${idx + 1}`}
          />
        ))}
      </div>

      {/* Question Prompt */}
      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
          {currentQuestion.prompt}
        </h4>

        {/* MULTIPLE CHOICE / SCENARIO TYPE */}
        {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'scenario') && (
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options?.map((opt, optIdx) => {
              const isSelected = answers[currentQuestion.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* CRYPTO PUZZLE TYPE */}
        {currentQuestion.type === 'crypto_puzzle' && (
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>{currentQuestion.clue || 'Giải mã mật mã'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Nhập đáp án giải mã (không dấu hoặc tiếng Anh):
              </label>
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value.toUpperCase())}
                placeholder="Nhập từ khóa (ví dụ: EMPATHY)..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 focus:border-orange-500 font-bold tracking-widest text-center text-lg text-slate-800 uppercase outline-hidden bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation & Submit footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQIndex === 0}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-40"
        >
          Câu trước
        </button>

        {currentQIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-extrabold hover:bg-orange-600 transition"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài & Hoàn thành'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
