// Project X | Learning Quest - Creative Portfolio & Student Reflection Space
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { PortfolioData, PortfolioBackgroundItem } from '../types/index.ts';
import { EvidenceCard } from './EvidenceCard.tsx';
import { calculateLevelInfo } from '../utils/gamification.ts';
import {
  Sparkles,
  Palette,
  Save,
  Award,
  CheckCircle2,
  Quote,
  BookOpen,
  Image as ImageIcon,
  ExternalLink,
  Compass,
  Zap,
  BrainCircuit,
  AlertCircle,
} from 'lucide-react';

export const CreativePortfolio: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Backgrounds library from backend
  const [backgrounds, setBackgrounds] = useState<PortfolioBackgroundItem[]>([]);
  const [selectedBgId, setSelectedBgId] = useState<string>('bg-wave');

  // Portfolio inputs
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState({
    nhanThuc: '',
    hanhVi: '',
    cachHoc: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .getPortfolio(user.id)
      .then((res) => {
        setData(res);
        const pf: PortfolioData = res.portfolio;
        const bgs: PortfolioBackgroundItem[] = res.backgrounds || [];
        setBackgrounds(bgs);

        const currentBg = res.student?.portfolioBackgroundId || pf?.backgroundId || (bgs[0]?.id ?? 'bg-wave');
        setSelectedBgId(currentBg);

        if (pf) {
          setBio(pf.bio || '');
          setMotto(pf.motto || '');
          setReflectionNotes({
            nhanThuc: pf.reflectionNotes?.nhanThuc || pf.reflectionNotes?.learned || '',
            hanhVi: pf.reflectionNotes?.hanhVi || pf.reflectionNotes?.challenges || '',
            cachHoc: pf.reflectionNotes?.cachHoc || pf.reflectionNotes?.proudest || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updatePortfolio({
        backgroundId: selectedBgId,
        bio,
        motto,
        reflectionNotes,
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu Portfolio');
    } finally {
      setIsSaving(false);
    }
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

  // Active background object
  const activeBg = backgrounds.find((b) => b.id === selectedBgId) || backgrounds[0];

  // Background style resolver
  const getCanvasBgStyle = (): React.CSSProperties => {
    if (!activeBg) return { backgroundColor: '#f8fafc' };
    if (activeBg.url.startsWith('linear-gradient') || activeBg.url.startsWith('radial-gradient')) {
      return { background: activeBg.url };
    }
    return {
      backgroundImage: `url(${activeBg.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  // Extract completed quests
  const completedQuestsList: any[] = [];
  stages.forEach((st: any) => {
    (st.quests || []).forEach((q: any) => {
      if (progressMap[q.id]?.status === 'completed') {
        completedQuestsList.push({
          ...q,
          stageTitle: st.title,
          progress: progressMap[q.id],
        });
      }
    });
  });

  // Extract earned badges (only from completed quests or milestones)
  const earnedBadges: any[] = [];
  const seenBadgeIds = new Set<string>();

  completedQuestsList.forEach((q) => {
    if (q.badgeReward && !seenBadgeIds.has(q.badgeReward.id)) {
      seenBadgeIds.add(q.badgeReward.id);
      earnedBadges.push(q.badgeReward);
    }
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Top Controls Toolbar */}
      <div className="rounded-3xl bg-white border border-amber-200 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Hồ Sơ Sáng Tạo & Dấu Ấn Cá Nhân</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Không Gian Learning Portfolio Lớp 10A
            </h2>
            <p className="text-xs text-slate-500">
              Lựa chọn hình nền yêu thích từ thư viện nhà trường, ghi nhận 3 phản tư cốt lõi và theo dõi chặng đường phát triển cá nhân.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white text-xs font-black shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Portfolio'}</span>
          </button>
        </div>

        {saveToast && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-300 animate-in zoom-in-95 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thành công hồ sơ Portfolio! Thiết lập hình nền và các đoạn phản tư đã được đồng bộ.</span>
          </div>
        )}

        {/* Background Selector Carousel */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-orange-500" />
            <span>Thư viện hình nền Portfolio (Do giáo viên cung cấp):</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {backgrounds.map((bg) => {
              const isSelected = selectedBgId === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedBgId(bg.id)}
                  className={`group relative rounded-2xl p-2.5 text-left border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/70 shadow-sm ring-2 ring-orange-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-full h-14 rounded-xl mb-2 border border-slate-200/60 shadow-inner flex items-end p-1.5"
                    style={{
                      background: bg.url.startsWith('linear-gradient') ? bg.url : `url(${bg.url}) center/cover`,
                    }}
                  >
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-black shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{bg.name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{bg.description || 'Chủ đề học đường'}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PORTFOLIO CANVAS */}
      <div
        className="relative rounded-3xl p-5 sm:p-10 shadow-xl overflow-hidden transition-all duration-300 border border-slate-200/80"
        style={getCanvasBgStyle()}
      >
        {/* Soft Contrast Veil to guarantee text readability regardless of background */}
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] pointer-events-none rounded-3xl" />

        <div className="relative z-10 space-y-8">
          {/* 1. PORTFOLIO COVER / HEADER CARD */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-md text-slate-900 shadow-lg border border-white/60">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wider">
                  HỒ SƠ HỌC TẬP • PROJECT X QUEST
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {student.displayName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-bold">
                  Lớp {student.className || '10A'} • {student.school || 'Trường TH, THCS & THPT FPT Hậu Giang'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Mã số học sinh: <span className="font-bold text-orange-700">{student.studentId}</span> • Niên khóa 2026 - 2027
                </p>
              </div>

              {/* Avatar & Level Badge */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-3xl text-center shrink-0 min-w-32 shadow-xs">
                <span className="text-5xl block mb-1">{student.avatar || '🦊'}</span>
                <span className="inline-block text-xs font-black bg-orange-600 text-white px-3 py-1 rounded-full shadow-xs">
                  Cấp {levelInfo.level} • {student.xp || 0} XP
                </span>
                <p className="text-[10px] font-bold text-orange-800 mt-1">{levelInfo.title}</p>
              </div>
            </div>

            {/* Motto */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-extrabold uppercase mb-1">
                <Quote className="w-3.5 h-3.5 text-orange-500" />
                <span>Châm ngôn hành trình của em:</span>
              </div>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Ví dụ: Mỗi thách thức là một hạt mầm cho giải pháp đột phá..."
                className="w-full bg-slate-50 focus:bg-white text-slate-800 italic text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* 2. BIO & LEARNING GOAL */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Giới Thiệu Bản Thân & Mục Tiêu Khi Tham Gia Project X</span>
            </h3>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ đôi nét về thế mạnh, sở thích và điều em mong muốn đạt được khi thực hiện dự án cùng các bạn lớp 10A..."
              className="w-full text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-300 focus:border-orange-500 rounded-2xl p-3.5 outline-hidden bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* 3. DẤU ẤN CÁ NHÂN & PHẢN TƯ (3 MANDATORY INDEPENDENT PROMPTS) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-6">
            <div className="border-b pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dấu Ấn Cá Nhân & Phản Tư (Student Reflection)</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Góc Phản Tư & Chuyển Hóa Bản Thân
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hãy dành thời gian tĩnh lặng để tự vấn và trả lời 3 câu hỏi dưới đây một cách chân thật nhất từ trải nghiệm thực tế của chính em.
              </p>
            </div>

            <div className="space-y-5">
              {/* Prompt 1: NHẬN THỨC */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                <label className="block text-xs font-black text-amber-950 uppercase flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>1. NHẬN THỨC — Em hiểu điều gì hơn về mình và về sự thay đổi?</span>
                </label>
                <p className="text-[11px] text-amber-900/80 font-medium">
                  Những góc nhìn, nhận thức mới mẻ mà em đã đúc kết được qua các thử thách, quan sát thực tế hay quá trình thấu cảm người dùng.
                </p>
                <textarea
                  rows={3}
                  value={reflectionNotes.nhanThuc}
                  onChange={(e) => setReflectionNotes({ ...reflectionNotes, nhanThuc: e.target.value })}
                  placeholder="Ghi lại nhận thức mới của em tại đây..."
                  className="w-full text-xs text-slate-800 bg-white p-3 rounded-xl border border-amber-300 focus:border-amber-500 outline-hidden leading-relaxed"
                />
              </div>

              {/* Prompt 2: HÀNH VI */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200/90 space-y-2">
                <label className="block text-xs font-black text-rose-950 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>2. HÀNH VI — Em làm gì khác so với trước đây?</span>
                </label>
                <p className="text-[11px] text-rose-900/80 font-medium">
                  Hành động cụ thể, thói quen tích cực hay kỹ năng mới mà em đã áp dụng trong giao tiếp nhóm, vượt qua trở ngại và làm việc thực tế.
                </p>
                <textarea
                  rows={3}
                  value={reflectionNotes.hanhVi}
                  onChange={(e) => setReflectionNotes({ ...reflectionNotes, hanhVi: e.target.value })}
                  placeholder="Ghi lại sự thay đổi trong hành vi và hành động của em..."
                  className="w-full text-xs text-slate-800 bg-white p-3 rounded-xl border border-rose-300 focus:border-rose-500 outline-hidden leading-relaxed"
                />
              </div>

              {/* Prompt 3: CÁCH HỌC */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                <label className="block text-xs font-black text-emerald-950 uppercase flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  <span>3. CÁCH HỌC — Em học / em thay đổi cách học của bản thân thế nào?</span>
                </label>
                <p className="text-[11px] text-emerald-900/80 font-medium">
                  Phương pháp tự học, cách em tìm kiếm nguồn lực, tiếp nhận phản hồi từ thầy cô, bạn bè và tự định hướng con đường học tập của mình.
                </p>
                <textarea
                  rows={3}
                  value={reflectionNotes.cachHoc}
                  onChange={(e) => setReflectionNotes({ ...reflectionNotes, cachHoc: e.target.value })}
                  placeholder="Ghi lại cách em tiếp cận và thay đổi phương pháp học tập..."
                  className="w-full text-xs text-slate-800 bg-white p-3 rounded-xl border border-emerald-300 focus:border-emerald-500 outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 4. CHẶNG THỬ THÁCH ĐÃ VƯỢT QUA (INITIALLY EMPTY) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span>Chặng Thử Thách Đã Vượt Qua ({completedQuestsList.length})</span>
            </h3>

            {completedQuestsList.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-3xl block">🗺️</span>
                <p className="text-xs font-bold text-slate-700">
                  Chưa có chặng thử thách nào hoàn thành.
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Hãy bắt đầu chinh phục các chặng học tập được công bố để mở khóa thành tích và lưu lại dấu ấn vào hồ sơ của bạn nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {completedQuestsList.map((q: any) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-xs text-slate-900">{q.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{q.summary}</p>
                      <p className="text-[10px] text-emerald-800 font-bold mt-1">
                        Điểm: {q.progress.highestScore || q.progress.score}% • Nhận: +{q.progress.highestXp || q.progress.xpEarned} XP
                      </p>
                    </div>

                    {q.badgeReward && (
                      <span className="text-2xl shrink-0" title={q.badgeReward.name}>
                        {q.badgeReward.icon}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. BỘ SƯU TẬP HUY HIỆU VINH DANH (INITIALLY EMPTY) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Bộ Sưu Tập Huy Hiệu Vinh Danh ({earnedBadges.length})</span>
            </h3>

            {earnedBadges.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <span className="text-3xl block">🎖️</span>
                <p className="text-xs font-bold text-amber-900">
                  Chưa đạt được huy hiệu nào.
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Hãy hoàn thành các chặng thử thách của Project X để mở khóa các huy hiệu vinh danh độc quyền!
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {earnedBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200"
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">{b.name}</p>
                      <p className="text-[10px] text-slate-500">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. SẢN PHẨM & MINH CHỨNG NỔI BẬT */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              <span>Sản Phẩm & Minh Chứng Nổi Bật ({evidenceList.length})</span>
            </h3>

            {evidenceList.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-3xl block">📎</span>
                <p className="text-xs font-bold text-slate-700">
                  Chưa có sản phẩm hoặc minh chứng nào được nộp.
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Các sản phẩm nhóm, tài liệu Google Docs, Slides hay hình ảnh thực địa nộp qua từng chặng sẽ tự động xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {evidenceList.map((item: any) => (
                  <EvidenceCard key={item.id} evidence={item} />
                ))}
              </div>
            )}
          </div>

          {/* 7. TEACHER'S OFFICIAL FEEDBACK HIGHLIGHT */}
          {feedbackList.length > 0 && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-white/60 space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Ghi Nhận Chính Thức Từ Giáo Viên</span>
              </h3>
              {feedbackList.map((fb: any) => (
                <div key={fb.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{fb.teacherName}</span>
                    <span className="text-slate-400 font-normal">{new Date(fb.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="italic text-slate-700 leading-relaxed">"{fb.generalNote}"</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center text-[11px] text-slate-600 font-semibold pt-4">
            PROJECT X | LEARNING QUEST • Trường Tiểu học, THCS & THPT FPT Hậu Giang
          </div>
        </div>
      </div>
    </div>
  );
};
