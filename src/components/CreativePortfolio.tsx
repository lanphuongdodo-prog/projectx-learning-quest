// Project X | Learning Quest - "My Creative Portfolio" with Stickers, Templates, Journal & PDF Export
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { PortfolioData, StickerPlacement } from '../types/index.ts';
import { EvidenceCard } from './EvidenceCard.tsx';
import { calculateLevelInfo, SYSTEM_BADGES } from '../utils/gamification.ts';
import {
  Sparkles,
  Palette,
  Layout,
  Printer,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  CheckCircle2,
  Heart,
  Quote,
  Star,
  BookOpen,
} from 'lucide-react';

const STICKER_PALETTE = [
  { key: 'rocket', emoji: '🚀', label: 'Tên lửa' },
  { key: 'star', emoji: '⭐', label: 'Ngôi sao' },
  { key: 'bulb', emoji: '💡', label: 'Ý tưởng' },
  { key: 'palette', emoji: '🎨', label: 'Sáng tạo' },
  { key: 'trophy', emoji: '🏆', label: 'Chiến thắng' },
  { key: 'flame', emoji: '🔥', label: 'Nhiệt huyết' },
  { key: 'compass', emoji: '🧭', label: 'La bàn' },
  { key: 'rainbow', emoji: '🌈', label: 'Cầu vồng' },
  { key: 'book', emoji: '📚', label: 'Tri thức' },
  { key: 'fox', emoji: '🦊', label: 'Lanh lợi' },
  { key: 'sun', emoji: '🌻', label: 'Tươi sáng' },
  { key: 'puzzle', emoji: '🧩', label: 'Giải mã' },
];

const TEMPLATES = [
  { id: 'journey', name: 'Hành trình học tập', desc: 'Bố cục chuỗi thử thách theo mốc thời gian' },
  { id: 'creative', name: 'Dấu ấn sáng tạo', desc: 'Bố cục tự do, tôn vinh ý tưởng và sticker' },
  { id: 'growth', name: 'Nhật ký trưởng thành', desc: 'Tập trung vào sự biến đổi tư duy và phản tư' },
  { id: 'story', name: 'Câu chuyện Project X', desc: 'Trình bày dạng bài viết truyền cảm hứng' },
];

const COLOR_THEMES: Record<string, { bg: string; border: string; accent: string; headerBg: string }> = {
  orange: {
    bg: 'bg-amber-50/50',
    border: 'border-orange-200',
    accent: 'text-orange-700',
    headerBg: 'bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500',
  },
  mint: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    headerBg: 'bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-500',
  },
  lavender: {
    bg: 'bg-purple-50/50',
    border: 'border-purple-200',
    accent: 'text-purple-700',
    headerBg: 'bg-linear-to-r from-purple-600 via-indigo-500 to-pink-500',
  },
  sky: {
    bg: 'bg-sky-50/50',
    border: 'border-sky-200',
    accent: 'text-sky-700',
    headerBg: 'bg-linear-to-r from-sky-600 via-blue-500 to-indigo-500',
  },
};

export const CreativePortfolio: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Form states
  const [template, setTemplate] = useState<'journey' | 'creative' | 'quest' | 'growth' | 'story'>('journey');
  const [colorTheme, setColorTheme] = useState('orange');
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState({
    learned: '',
    challenges: '',
    proudest: '',
    futureGoal: '',
  });
  const [stickers, setStickers] = useState<StickerPlacement[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getPortfolio(user.id).then((res) => {
      setData(res);
      const pf: PortfolioData = res.portfolio;
      if (pf) {
        setTemplate(pf.template || 'journey');
        setColorTheme(pf.colorTheme || 'orange');
        setBio(pf.bio || '');
        setMotto(pf.motto || '');
        setReflectionNotes(pf.reflectionNotes || { learned: '', challenges: '', proudest: '', futureGoal: '' });
        setStickers(pf.stickers || []);
      }
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updatePortfolio({
        template,
        colorTheme,
        bio,
        motto,
        reflectionNotes,
        stickers,
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu Portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSticker = (stickerKey: string) => {
    const newSticker: StickerPlacement = {
      id: `stk-${Date.now()}`,
      stickerKey,
      x: 10 + Math.random() * 70, // %
      y: 10 + Math.random() * 70, // %
      scale: 1.0,
      rotation: Math.round((Math.random() - 0.5) * 30),
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">
        Đang tải Portfolio cá nhân...
      </div>
    );
  }

  const student = data.student || user;
  const levelInfo = calculateLevelInfo(student.xp || 0);
  const stages = data.stages || [];
  const progressMap = data.progress || {};
  const evidenceList = data.evidence || [];
  const feedbackList = data.feedback || [];
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.orange;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Controls Toolbar (Hidden in Print) */}
      <div className="print:hidden rounded-3xl bg-white border border-amber-200 shadow-md p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              Không gian Sáng tạo Cá nhân
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Tùy Biến Learning Portfolio
            </h2>
            <p className="text-xs text-slate-500">
              Chọn mẫu, chủ đề màu sắc, gắn sticker trang trí và viết suy ngẫm để ghi lại dấu ấn riêng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 shadow-sm transition"
              title="Xuất file PDF hoặc in hồ sơ học tập"
            >
              <Printer className="w-4 h-4" />
              <span>Xuất PDF / In ấn</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Portfolio'}</span>
            </button>
          </div>
        </div>

        {saveToast && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 animate-in zoom-in-95">
            ✓ Đã lưu thiết kế Portfolio thành công! Bản thiết kế được đồng bộ trên tài khoản của bạn.
          </div>
        )}

        {/* Customization Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
          {/* Template Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Layout className="w-3.5 h-3.5 text-orange-500" />
              <span>Chọn Mẫu Portfolio:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    template === tpl.id
                      ? 'border-orange-500 bg-orange-50/80 font-bold text-orange-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold">{tpl.name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme & Sticker Tray */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-orange-500" />
                <span>Chủ đề Màu sắc:</span>
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'orange', label: 'Cam năng động', color: 'bg-orange-500' },
                  { id: 'mint', label: 'Xanh Mint', color: 'bg-emerald-500' },
                  { id: 'lavender', label: 'Tím Lavender', color: 'bg-purple-500' },
                  { id: 'sky', label: 'Xanh Da Trời', color: 'bg-sky-500' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setColorTheme(th.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                      colorTheme === th.id
                        ? 'border-slate-800 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${th.color}`} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker Tray */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Thư viện Sticker trang trí (Chạm để thêm):</span>
                {stickers.length > 0 && (
                  <button
                    onClick={() => setStickers([])}
                    className="text-[10px] text-rose-600 hover:underline"
                  >
                    Xóa hết sticker ({stickers.length})
                  </button>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {STICKER_PALETTE.map((stk) => (
                  <button
                    key={stk.key}
                    onClick={() => handleAddSticker(stk.key)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:scale-110 active:scale-95 flex items-center justify-center text-lg transition shadow-2xs"
                    title={`Thêm sticker ${stk.label}`}
                  >
                    {stk.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO CANVAS (PRINTABLE / EXPORTABLE) */}
      <div
        id="portfolio-printable-canvas"
        className={`relative rounded-3xl p-6 sm:p-10 border-2 shadow-xl overflow-hidden transition-all duration-300 print:border-none print:shadow-none print:p-0 ${theme.bg} ${theme.border}`}
      >
        {/* Render Floating Stickers */}
        {stickers.map((stk) => {
          const match = STICKER_PALETTE.find((p) => p.key === stk.stickerKey);
          return (
            <div
              key={stk.id}
              className="absolute select-none pointer-events-auto cursor-move group print:opacity-90"
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `rotate(${stk.rotation}deg) scale(${stk.scale})`,
              }}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow-md inline-block transition-transform hover:scale-125">
                {match?.emoji || '⭐'}
              </span>
              <button
                onClick={() => handleRemoveSticker(stk.id)}
                className="hidden group-hover:flex absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white items-center justify-center text-[10px] print:hidden shadow-xs"
                title="Xóa sticker"
              >
                ×
              </button>
            </div>
          );
        })}

        {/* 1. PORTFOLIO COVER / HEADER */}
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative z-10 ${theme.headerBg}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
                HỒ SƠ HỌC TẬP • LEARNING PORTFOLIO
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {student.displayName}
              </h1>
              <p className="text-sm text-white/90 font-medium">
                Lớp {student.className || '10A'} • {student.school || 'Trường TH, THCS & THPT FPT Hậu Giang'}
              </p>
              <p className="text-xs text-white/80">
                Mã học sinh: <span className="font-mono font-bold">{student.studentId}</span> • Niên khóa 2026 - 2027
              </p>
            </div>

            {/* Avatar & Level */}
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-center shrink-0">
              <span className="text-5xl block mb-1">{student.avatar || '🦊'}</span>
              <span className="text-xs font-black bg-white text-slate-800 px-3 py-1 rounded-full shadow-xs">
                Cấp {levelInfo.level} • {student.xp || 0} XP
              </span>
            </div>
          </div>

          {/* Motto / Quote */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase mb-1">
              <Quote className="w-3.5 h-3.5" />
              <span>Châm ngôn cá nhân:</span>
            </div>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="Nhập thông điệp truyền cảm hứng của bạn..."
              className="w-full bg-white/10 hover:bg-white/20 focus:bg-white/30 text-white italic text-sm sm:text-base px-3 py-2 rounded-xl outline-hidden border border-white/20 placeholder-white/50 print:bg-transparent print:border-none print:p-0"
            />
          </div>
        </div>

        {/* 2. BIO & INTRODUCTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative z-10 space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Giới thiệu bản thân & Mục tiêu Project X</span>
          </h3>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Chia sẻ đôi nét về sở thích, mục tiêu khi tham gia môn học Project X..."
            className="w-full text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200 focus:border-orange-500 rounded-xl p-3 outline-hidden print:border-none print:p-0"
          />
        </div>

        {/* 3. JOURNEY MILESTONES & ACHIEVEMENTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative z-10 space-y-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <span>Những Chặng Thử Thách Đã Vượt Qua</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stages.map((st: any) => (
              <div key={st.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <span className="text-base">{st.icon}</span>
                  <span>{st.title}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {st.quests.map((q: any) => {
                    const isDone = progressMap[q.id]?.status === 'completed';
                    return (
                      <div
                        key={q.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                          isDone ? 'bg-emerald-100/70 text-emerald-900 font-semibold' : 'bg-white text-slate-500'
                        }`}
                      >
                        <span className="truncate pr-2">{q.title}</span>
                        {isDone ? (
                          <span className="text-emerald-700 font-bold shrink-0">✓ Hoàn thành</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] shrink-0">Chưa hoàn thành</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Badges Collection */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Bộ Sưu Tập Huy Hiệu Vinh Danh:
            </h4>
            <div className="flex flex-wrap gap-3">
              {SYSTEM_BADGES.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-50/80 border border-amber-200"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">{b.name}</p>
                    <p className="text-[10px] text-slate-500">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. LEARNING REFLECTION JOURNAL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative z-10 space-y-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Dấu Ấn Cá Nhân & Nhật Ký Phản Tư (Reflection)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <label className="block text-xs font-extrabold text-amber-900 uppercase">
                🌱 Điều ý nghĩa nhất em đã học được:
              </label>
              <textarea
                rows={3}
                value={reflectionNotes.learned}
                onChange={(e) => setReflectionNotes({ ...reflectionNotes, learned: e.target.value })}
                placeholder="Bài học về tư duy thiết kế, làm việc nhóm hoặc thấu cảm..."
                className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-amber-200 outline-hidden print:border-none print:p-0"
              />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <label className="block text-xs font-extrabold text-rose-900 uppercase">
                🛡️ Thách thức / Khó khăn em đã vượt qua:
              </label>
              <textarea
                rows={3}
                value={reflectionNotes.challenges}
                onChange={(e) => setReflectionNotes({ ...reflectionNotes, challenges: e.target.value })}
                placeholder="Những rào cản khi khảo sát, bão não ý tưởng hay quản lý deadline..."
                className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-rose-200 outline-hidden print:border-none print:p-0"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <label className="block text-xs font-extrabold text-emerald-900 uppercase">
                ⭐ Khoảnh khắc tự hào nhất trong dự án:
              </label>
              <textarea
                rows={3}
                value={reflectionNotes.proudest}
                onChange={(e) => setReflectionNotes({ ...reflectionNotes, proudest: e.target.value })}
                placeholder="Khi phỏng vấn được người dùng, khi giải pháp nhóm được khen ngợi..."
                className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-200 outline-hidden print:border-none print:p-0"
              />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
              <label className="block text-xs font-extrabold text-purple-900 uppercase">
                🚀 Mục tiêu phát triển tiếp theo của em:
              </label>
              <textarea
                rows={3}
                value={reflectionNotes.futureGoal}
                onChange={(e) => setReflectionNotes({ ...reflectionNotes, futureGoal: e.target.value })}
                placeholder="Kế hoạch thử nghiệm nguyên mẫu hoặc thuyết trình pitching..."
                className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-purple-200 outline-hidden print:border-none print:p-0"
              />
            </div>
          </div>
        </div>

        {/* 5. LINKED EVIDENCE SHOWCASE (CLICKABLE URLS FOR TEACHERS/JUDGES) */}
        {evidenceList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative z-10 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              <span>Sản Phẩm & Minh Chứng Nổi Bật (Đã nộp trực tuyến)</span>
            </h3>

            <div className="space-y-6">
              {evidenceList.map((item: any) => (
                <EvidenceCard key={item.id} evidence={item} />
              ))}
            </div>
          </div>
        )}

        {/* 6. TEACHER'S OFFICIAL FEEDBACK HIGHLIGHT */}
        {feedbackList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative z-10 space-y-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Ghi Nhận Chính Thức Từ Giáo Viên Bộ Môn</span>
            </h3>
            {feedbackList.map((fb: any) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{fb.teacherName}</span>
                  <span className="text-slate-400 font-normal">{new Date(fb.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="italic text-slate-700 leading-relaxed">"{fb.generalNote}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer in print */}
        <div className="mt-8 text-center text-[11px] text-slate-400 pt-4 border-t border-slate-200">
          PROJECT X | LEARNING QUEST • Trường Tiểu học, THCS & THPT FPT Hậu Giang
        </div>
      </div>
    </div>
  );
};
