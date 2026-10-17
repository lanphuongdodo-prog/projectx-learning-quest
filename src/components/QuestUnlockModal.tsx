// Project X | Learning Quest - Unlock Code Verification Modal
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { KeyRound, Lock, Sparkles, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface QuestUnlockModalProps {
  quest: any;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (questId: string) => void;
}

export const QuestUnlockModal: React.FC<QuestUnlockModalProps> = ({
  quest,
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError(null);
      setSuccessMsg(null);
      setRemainingLockSeconds(null);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (remainingLockSeconds === null || remainingLockSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingLockSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingLockSeconds]);

  if (!isOpen || !quest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã mở khóa do giáo viên cấp.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.unlockQuest(quest.id, code);
      setSuccessMsg(res.message);
      setTimeout(() => {
        onUnlocked(quest.id);
        onClose();
      }, 1500);
    } catch (err: any) {
      const data = err.data;
      if (data?.locked && data?.remainingWaitSeconds) {
        setRemainingLockSeconds(data.remainingWaitSeconds);
        setError(`Bạn đã thử sai 5 lần. Tạm khóa trong ${data.remainingWaitSeconds} giây.`);
      } else {
        setError(err.message || 'Mã mở khóa không chính xác. Hãy kiểm tra lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-orange-600 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
            MỞ KHÓA CHẶNG HỌC TẬP
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {quest.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Chặng này đang bị khóa. Hãy nhập mật mã do giáo viên bộ môn cấp để mở cánh cửa thử thách tiếp theo!
          </p>
        </div>

        {/* Demo Code Helper Box */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Gợi ý mã mẫu (Demo):</span> Chặng 01 là{' '}
            <code className="font-mono bg-white px-1.5 py-0.5 rounded-md font-bold text-orange-700 border border-amber-200">
              FPT-X01
            </code>
            , Chặng 02 là{' '}
            <code className="font-mono bg-white px-1.5 py-0.5 rounded-md font-bold text-orange-700 border border-amber-200">
              INSIGHT2026
            </code>
            . (Giáo viên có thể đổi mã trong trang quản trị).
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 text-sm font-semibold animate-in zoom-in-95">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Lockout countdown notification */}
        {remainingLockSeconds !== null && remainingLockSeconds > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-red-100 text-red-900 flex items-center justify-center gap-2 font-bold text-sm">
            <Clock className="w-4 h-4 animate-spin text-red-700" />
            <span>Mở khóa lại sau {remainingLockSeconds}s...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Nhập mã mở khóa (Code):
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={loading || Boolean(remainingLockSeconds && remainingLockSeconds > 0)}
                placeholder="FPT-X01"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-hidden font-bold text-center tracking-widest text-lg text-slate-800 uppercase disabled:bg-slate-100"
                autoFocus
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition"
            >
              Để sau
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(remainingLockSeconds && remainingLockSeconds > 0)}
              className="flex-1 px-4 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Mở khóa ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
