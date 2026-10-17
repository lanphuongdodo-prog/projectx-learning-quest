// Project X | Learning Quest - Stage & Overall Leaderboard (Safe Public Info)
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, Stage } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Trophy, Medal, Star, Flame, Sparkles, Filter } from 'lucide-react';

interface LeaderboardViewProps {
  stages: Stage[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stages }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>(''); // empty = overall
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(selectedStageId || undefined)
      .then((res) => {
        setLeaderboard(res.leaderboard);
      })
      .catch((err) => console.error('Error fetching leaderboard:', err))
      .finally(() => setLoading(false));
  }, [selectedStageId]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Vinh danh Nỗ lực & Bứt phá</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bảng Xếp Hạng Thành Tích 10A
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm">
          Ghi nhận sự kiên trì, sáng tạo và tiến độ học tập tích cực của từng cá nhân trong hành trình Project X.
        </p>
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStageId('')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
            selectedStageId === ''
              ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
          }`}
        >
          🏆 Toàn hành trình
        </button>

        {stages.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStageId(st.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border shrink-0 ${
              selectedStageId === st.id
                ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
            }`}
          >
            {st.icon} Giai đoạn {st.order}
          </button>
        ))}
      </div>

      {/* Top 3 Podium (Desktop) */}
      {!loading && leaderboard.length >= 3 && selectedStageId === '' && (
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-6 items-end">
          {/* Rank 2 */}
          <div className="bg-white rounded-2xl p-4 text-center border-2 border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-3xl mb-1">{leaderboard[1].avatar}</span>
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center mb-1">
              2
            </span>
            <p className="text-xs font-bold text-slate-800 truncate w-full">{leaderboard[1].displayName}</p>
            <p className="text-[11px] font-black text-orange-600">{leaderboard[1].totalXp} XP</p>
          </div>

          {/* Rank 1 */}
          <div className="bg-linear-to-b from-amber-50 to-white rounded-3xl p-5 text-center border-2 border-amber-300 shadow-lg -translate-y-3 flex flex-col items-center">
            <span className="text-4xl mb-1 animate-bounce">{leaderboard[0].avatar}</span>
            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center mb-1 shadow-sm">
              👑 1
            </span>
            <p className="text-sm font-extrabold text-slate-900 truncate w-full">{leaderboard[0].displayName}</p>
            <p className="text-xs font-black text-orange-600">{leaderboard[0].totalXp} XP</p>
            <span className="text-[10px] text-amber-800 font-semibold mt-1">Dẫn đầu bảng</span>
          </div>

          {/* Rank 3 */}
          <div className="bg-white rounded-2xl p-4 text-center border-2 border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-3xl mb-1">{leaderboard[2].avatar}</span>
            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-900 font-black text-xs flex items-center justify-center mb-1">
              3
            </span>
            <p className="text-xs font-bold text-slate-800 truncate w-full">{leaderboard[2].displayName}</p>
            <p className="text-[11px] font-black text-orange-600">{leaderboard[2].totalXp} XP</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="rounded-3xl bg-white border border-amber-200/90 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-500">
            Đang cập nhật bảng xếp hạng...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Chưa có dữ liệu xếp hạng cho giai đoạn này.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaderboard.map((entry) => {
              const isTop3 = entry.rank <= 3;
              const isCurrent = entry.isCurrentStudent;

              return (
                <div
                  key={entry.studentId}
                  className={`flex items-center justify-between p-4 sm:p-5 transition ${
                    isCurrent
                      ? 'bg-amber-50/80 font-bold border-l-4 border-l-orange-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : entry.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : entry.rank === 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {entry.rank}
                    </div>

                    {/* Avatar & Display Name */}
                    <span className="text-2xl w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {entry.avatar}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {entry.displayName}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Cấp {entry.level} • {entry.completedQuests} chặng hoàn thành
                      </p>
                    </div>
                  </div>

                  {/* XP & Badges */}
                  <div className="text-right">
                    <span className="text-base font-black text-orange-600 block">
                      {entry.totalXp} XP
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      🏅 {entry.badgesCount} huy hiệu
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
