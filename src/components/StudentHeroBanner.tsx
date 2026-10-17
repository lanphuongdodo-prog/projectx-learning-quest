// Project X | Learning Quest - Student Hero Banner & Level Progress
import React from 'react';
import { User, Stage } from '../types/index.ts';
import { calculateLevelInfo } from '../utils/gamification.ts';
import { Sparkles, Trophy, CheckCircle2, Flame, MapPin } from 'lucide-react';

interface StudentHeroBannerProps {
  user: User;
  stages: Stage[];
}

export const StudentHeroBanner: React.FC<StudentHeroBannerProps> = ({ user, stages }) => {
  const levelInfo = calculateLevelInfo(user.xp || 0);

  // Calculate overall stats
  let totalQuests = 0;
  let completedQuests = 0;

  stages.forEach((stage) => {
    stage.quests.forEach((q) => {
      totalQuests++;
      if ((q as any).userProgress?.status === 'completed') {
        completedQuests++;
      }
    });
  });

  const completionPercent = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 mb-8">
      {/* Decorative Background Elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-yellow-300/20 blur-xl pointer-events-none" />
      <div className="absolute top-4 right-8 text-6xl opacity-20 select-none hidden md:block">
        🚀
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: User Welcome & Level Badge */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Học viện Sáng tạo FPT Hậu Giang • Lớp {user.className || '10A'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào {user.displayName}! 👋
          </h1>

          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Hành trình Project X đang chờ đón bạn. Khám phá các chặng thử thách, thu thập kinh nghiệm (XP) và kiến tạo giải pháp thực tế cho quê hương Hậu Giang!
          </p>

          {/* Level Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-white/90">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="text-base">👑</span> Cấp {levelInfo.level}: {levelInfo.title}
              </span>
              <span>
                {user.xp || 0} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-3 p-0.5 backdrop-blur-xs">
              <div
                className="bg-linear-to-r from-yellow-300 to-white h-2 rounded-full transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-white/80 mt-1 italic">
              Còn {Math.max(0, levelInfo.nextLevelXp - (user.xp || 0))} XP nữa để đạt cấp tiếp theo!
            </p>
          </div>
        </div>

        {/* Right: Quick Stat Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full lg:w-auto shrink-0">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-center border border-white/20 shadow-xs">
            <div className="w-8 h-8 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-1.5 text-yellow-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black">{completedQuests}/{totalQuests}</div>
            <div className="text-[11px] font-medium text-white/85">Chặng hoàn thành</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-center border border-white/20 shadow-xs">
            <div className="w-8 h-8 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-1.5 text-yellow-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black">{completionPercent}%</div>
            <div className="text-[11px] font-medium text-white/85">Tiến độ chung</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-center border border-white/20 shadow-xs">
            <div className="w-8 h-8 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-1.5 text-rose-200">
              <Flame className="w-5 h-5 fill-rose-300" />
            </div>
            <div className="text-xl sm:text-2xl font-black">{user.streak || 1}</div>
            <div className="text-[11px] font-medium text-white/85">Ngày liên tiếp</div>
          </div>
        </div>
      </div>
    </div>
  );
};
