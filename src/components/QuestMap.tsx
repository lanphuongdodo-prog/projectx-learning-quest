// Project X | Learning Quest - Interactive Adventure Map of Stages & Quests
import React from 'react';
import { Stage } from '../types/index.ts';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface QuestMapProps {
  stages: Stage[];
  onOpenQuest: (questId: string) => void;
  onRequestUnlock: (quest: any) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({ stages, onOpenQuest, onRequestUnlock }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hải trình Khám phá Tri thức</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bản đồ Hành trình Project X
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Vượt qua các chặng thử thách, làm chủ phương pháp Tư duy Thiết kế (Design Thinking) và hoàn thiện dự án sáng tạo của lớp 10A.
        </p>
      </div>

      {/* Stages List or Friendly Empty State */}
      {stages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-3xl text-amber-600 shadow-inner">
            🧭
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            Hành trình học tập đang chuẩn bị
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Hành trình học tập của bạn đang chờ được mở khóa. Hãy quay lại khi giáo viên công bố nội dung mới nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {stages.map((stage, stageIdx) => {
            // Color accents by stage
            const themeStyles = getStageTheme(stage.colorTheme);

            return (
              <div
                key={stage.id}
                className="relative rounded-3xl bg-white border border-amber-200/90 shadow-md p-5 sm:p-7 transition-all duration-200 hover:shadow-lg"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${themeStyles.iconBg}`}
                    >
                      {stage.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${themeStyles.badge}`}
                        >
                          Giai đoạn {stage.order}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mt-1">
                        {stage.title}
                      </h3>
                    </div>
                  </div>

                <p className="text-xs text-slate-500 max-w-sm sm:text-right">
                  {stage.description}
                </p>
              </div>

              {/* Quests Grid in Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-5">
                {stage.quests.map((quest: any) => {
                  const progress = quest.userProgress || {};
                  const isCompleted = progress.status === 'completed';
                  const isUnlocked = progress.unlocked;
                  const isOverdue = progress.status === 'overdue';
                  const deadlineInfo = quest.deadlineInfo;

                  return (
                    <div
                      key={quest.id}
                      className={`relative flex flex-col justify-between rounded-2xl p-5 border-2 transition-all duration-200 ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : isUnlocked
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : isOverdue
                          ? 'bg-rose-50/50 border-rose-300'
                          : 'bg-slate-50/80 border-slate-200 opacity-90'
                      }`}
                    >
                      {/* Top status & XP */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUnlocked
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Chặng {String(quest.order).padStart(2, '0')}
                            </span>

                            {quest.badgeReward && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800"
                                title={`Phần thưởng huy hiệu: ${quest.badgeReward.name}`}
                              >
                                <span>{quest.badgeReward.icon}</span>
                                <span className="hidden sm:inline">{quest.badgeReward.name}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            +{quest.xpReward} XP
                          </span>
                        </div>

                        {/* Title & Storyline */}
                        <h4 className="text-base font-extrabold text-slate-900 mb-1 leading-snug">
                          {quest.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                          {quest.summary}
                        </p>

                        {/* Deadline notice if set */}
                        {deadlineInfo && (
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border mb-3 ${deadlineInfo.badgeColor}`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{deadlineInfo.formattedRemaining}</span>
                          </div>
                        )}
                      </div>

                      {/* Action CTA Button */}
                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        {isCompleted ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Đã hoàn thành ({progress.score || 100}%)</span>
                            </span>
                            <button
                              onClick={() => onOpenQuest(quest.id)}
                              className="px-3 py-1.5 rounded-xl bg-white text-emerald-700 text-xs font-bold border border-emerald-300 hover:bg-emerald-50 transition"
                            >
                              Xem lại
                            </button>
                          </div>
                        ) : isUnlocked ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700">
                              <Unlock className="w-4 h-4 text-orange-600" />
                              <span>Sẵn sàng chinh phục</span>
                            </span>
                            <button
                              onClick={() => onOpenQuest(quest.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-sm hover:from-orange-600 hover:to-amber-600 transition"
                            >
                              <span>Vào chặng</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        ) : isOverdue ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                              <span>Tạm khóa - Cần khôi phục</span>
                            </span>
                            <button
                              onClick={() => onOpenQuest(quest.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                            >
                              Khôi phục quyền
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Cần mã mở khóa</span>
                            </span>
                            <button
                              onClick={() => onRequestUnlock(quest)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Mở khóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
};

function getStageTheme(colorTheme: string) {
  switch (colorTheme) {
    case 'emerald':
      return {
        iconBg: 'bg-emerald-100 text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    case 'sky':
      return {
        iconBg: 'bg-sky-100 text-sky-700',
        badge: 'bg-sky-100 text-sky-800',
      };
    case 'purple':
      return {
        iconBg: 'bg-purple-100 text-purple-700',
        badge: 'bg-purple-100 text-purple-800',
      };
    case 'orange':
    default:
      return {
        iconBg: 'bg-orange-100 text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
      };
  }
}
