// Project X | Learning Quest - Personalized Teacher Mentorship Letter
import React, { useState, useEffect } from 'react';
import { TeacherFeedback, Stage } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Award, Star, Sparkles, CheckCircle2, Target, HeartHandshake } from 'lucide-react';

interface TeacherFeedbackLetterProps {
  stages: Stage[];
}

export const TeacherFeedbackLetter: React.FC<TeacherFeedbackLetterProps> = ({ stages }) => {
  const [feedbackList, setFeedbackList] = useState<TeacherFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeedback()
      .then((res) => setFeedbackList(res.feedback))
      .catch((err) => console.error('Error fetching teacher feedback:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5 text-orange-600" />
          <span>Đồng hành & Định hướng</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thư Nhận Xét Từ Giáo Viên
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm">
          Những lời nhận xét, ghi nhận nỗ lực và định hướng phát triển cá nhân dành riêng cho bạn qua từng giai đoạn Project X.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-bold text-slate-500">
          Đang tải thư phản hồi...
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
            💌
          </div>
          <h4 className="text-base font-bold text-slate-800">Chưa có nhận xét công bố</h4>
          <p className="text-xs text-slate-600">
            Giáo viên đang tổng hợp và đánh giá kết quả của bạn. Thư nhận xét sẽ xuất hiện tại đây ngay khi hoàn thành từng giai đoạn!
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {feedbackList.map((fb) => {
            const matchedStage = stages.find((s) => s.id === fb.stageId);
            const stageTitle = matchedStage ? matchedStage.title : 'Giai đoạn học tập';

            return (
              <div
                key={fb.id}
                className="relative overflow-hidden rounded-3xl bg-white border-2 border-amber-200 shadow-lg p-6 sm:p-8 space-y-6"
              >
                {/* Decorative border banner */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-orange-400 via-amber-400 to-rose-400" />

                {/* Top letter meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
                  <div>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-orange-900 uppercase">
                      {stageTitle}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Thư Phản Hồi Cá Nhân
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {fb.teacherName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Ngày gửi: {new Date(fb.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Engagement Stars */}
                <div className="flex items-center gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900">Mức độ tương tác & chủ động:</span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (fb.engagementRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* General Letter Note */}
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/50">
                  <p className="text-sm text-slate-800 leading-relaxed italic">
                    "{fb.generalNote}"
                  </p>
                </div>

                {/* Strengths & Growth Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fb.strengths && fb.strengths.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Điểm mạnh & Tiến bộ nổi bật:</span>
                      </h4>
                      <ul className="text-xs text-emerald-950 space-y-1 list-disc pl-4">
                        {fb.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fb.areasForGrowth && fb.areasForGrowth.length > 0 && (
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
                      <h4 className="text-xs font-black text-sky-900 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span>Điểm cần phát huy thêm:</span>
                      </h4>
                      <ul className="text-xs text-sky-950 space-y-1 list-disc pl-4">
                        {fb.areasForGrowth.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Next Goals */}
                {fb.nextGoals && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs">
                    <span className="font-extrabold text-purple-900 flex items-center gap-1.5 mb-1 uppercase">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Mục tiêu định hướng giai đoạn tiếp theo:</span>
                    </span>
                    <p className="text-purple-950 leading-relaxed font-medium">
                      {fb.nextGoals}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
