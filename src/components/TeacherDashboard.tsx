// Project X | Learning Quest - Teacher Management Dashboard (Stages, Quests, Codes, Review & Feedback)
import React, { useState, useEffect } from 'react';
import { Stage, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { EvidenceCard } from './EvidenceCard.tsx';
import { StudentExcelImporter } from './StudentExcelImporter.tsx';
import {
  Users,
  BookOpen,
  KeyRound,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Award,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Star,
  ExternalLink,
  Edit3,
  Save,
  Plus,
  Lock,
} from 'lucide-react';

interface TeacherDashboardProps {
  stages: Stage[];
  onRefreshStages: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ stages, onRefreshStages }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'students' | 'evidence' | 'feedback' | 'reports'>('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quest Editing Modal
  const [editingQuest, setEditingQuest] = useState<any>(null);
  const [editUnlockCode, setEditUnlockCode] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editXpReward, setEditXpReward] = useState(150);
  const [editPassThreshold, setEditPassThreshold] = useState<number>(50);
  const [editGradingRule, setEditGradingRule] = useState<'proportional' | 'full_on_pass'>('proportional');
  const [questSaving, setQuestSaving] = useState(false);

  // Evidence Review Modal
  const [reviewingEvidence, setReviewingEvidence] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'needs_revision'>('approved');
  const [reviewScore, setReviewScore] = useState<number>(95);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewSaving, setReviewSaving] = useState(false);

  // Teacher Feedback Form
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('stage-1');
  const [fbGeneralNote, setFbGeneralNote] = useState('');
  const [fbStrengths, setFbStrengths] = useState('');
  const [fbGrowth, setFbGrowth] = useState('');
  const [fbNextGoals, setFbNextGoals] = useState('');
  const [fbEngagement, setFbEngagement] = useState<number>(5);
  const [fbIsDraft, setFbIsDraft] = useState(false);
  const [fbSaving, setFbSaving] = useState(false);
  const [fbSuccess, setFbSuccess] = useState<string | null>(null);

  // Excel Importer & Password states
  const [showExcelImporter, setShowExcelImporter] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPasswordErr('Vui lòng nhập mật khẩu cũ và mật khẩu mới.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    setChangingPassword(true);
    setPasswordErr(null);
    setPasswordMsg(null);
    try {
      const res = await api.changeTeacherPassword({ oldPassword, newPassword });
      setPasswordMsg(res.message || 'Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordErr(err.message || 'Mật khẩu cũ không chính xác.');
    } finally {
      setChangingPassword(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, eviRes] = await Promise.all([
        api.getTeacherStudents(),
        api.getEvidence(),
      ]);
      setStudents(stuRes.students);
      setEvidences(eviRes.evidence);
      if (stuRes.students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stuRes.students[0].id);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditQuest = (q: any) => {
    setEditingQuest(q);
    setEditUnlockCode(q.unlockCode || '');
    setEditDeadline(q.deadline ? new Date(q.deadline).toISOString().slice(0, 16) : '');
    setEditTitle(q.title || '');
    setEditSummary(q.summary || '');
    setEditXpReward(q.xpReward !== undefined ? q.xpReward : 100);
    setEditPassThreshold(q.passThreshold !== undefined ? q.passThreshold : 50);
    setEditGradingRule(q.gradingRule || 'proportional');
  };

  const handleSaveQuest = async () => {
    if (!editingQuest) return;
    setQuestSaving(true);
    try {
      await api.updateTeacherQuest(editingQuest.id, {
        unlockCode: editUnlockCode,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
        title: editTitle,
        summary: editSummary,
        xpReward: editXpReward,
        passThreshold: editPassThreshold,
        gradingRule: editGradingRule,
      });
      alert('Đã cập nhật thông tin chặng và cấu hình điểm XP thành công!');
      setEditingQuest(null);
      onRefreshStages();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật chặng');
    } finally {
      setQuestSaving(false);
    }
  };

  const handleSaveReview = async () => {
    if (!reviewingEvidence) return;
    setReviewSaving(true);
    try {
      await api.reviewEvidence(reviewingEvidence.id, {
        status: reviewStatus,
        teacherScore: Number(reviewScore),
        teacherFeedback: reviewFeedback,
      });
      alert('Đã lưu đánh giá minh chứng và gửi thông báo cho học sinh!');
      setReviewingEvidence(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt minh chứng');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleSaveFeedback = async (asDraft: boolean) => {
    if (!selectedStudentId || !selectedStageId || !fbGeneralNote.trim()) {
      alert('Vui lòng chọn học sinh, giai đoạn và nhập nhận xét chung.');
      return;
    }

    setFbSaving(true);
    setFbSuccess(null);
    try {
      await api.submitTeacherFeedback({
        studentId: selectedStudentId,
        stageId: selectedStageId,
        generalNote: fbGeneralNote,
        strengths: fbStrengths.split('\n').filter((s) => s.trim().length > 0),
        areasForGrowth: fbGrowth.split('\n').filter((s) => s.trim().length > 0),
        nextGoals: fbNextGoals,
        engagementRating: fbEngagement,
        isDraft: asDraft,
      });

      setFbSuccess(asDraft ? 'Đã lưu bản nháp nhận xét.' : 'Đã công bố nhận xét cho học sinh!');
      setTimeout(() => setFbSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu nhận xét');
    } finally {
      setFbSaving(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      className: '10A',
      school: 'Trường Tiểu học, THCS & THPT FPT Hậu Giang',
      exportedAt: new Date().toISOString(),
      students,
      evidences,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_ProjectX_Lop10A_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleResetData = async () => {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ cơ sở dữ liệu mẫu cho Lớp 10A? Thao tác này sẽ đặt lại tiến trình về mặc định.')) {
      await api.resetDatabase();
      alert('Đã khôi phục dữ liệu mẫu thành công!');
      fetchData();
      onRefreshStages();
    }
  };

  // Stats calculation
  const totalStudents = students.length;
  const avgXp = totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + (s.xp || 0), 0) / totalStudents) : 0;
  const pendingEvidences = evidences.filter((e) => e.status === 'submitted').length;

  return (
    <div className="space-y-8 pb-20">
      {/* Teacher Dashboard Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Trang Quản Trị Giáo Viên • Lớp 10A
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản Lý Hành Trình Project X
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Theo dõi tiến trình từng học sinh, thiết lập mã mở khóa, điều chỉnh deadline, duyệt link minh chứng và gửi nhận xét đồng hành.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center shrink-0">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-amber-300">{totalStudents}</div>
            <div className="text-[10px] text-slate-300">Học sinh 10A</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-orange-400">{avgXp}</div>
            <div className="text-[10px] text-slate-300">XP Trung bình</div>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{pendingEvidences}</div>
            <div className="text-[10px] text-slate-300">Minh chứng chờ</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-200 gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
        {[
          { id: 'overview', label: '1. Tiến độ Học sinh', icon: Users },
          { id: 'quests', label: '2. Quản lý Chặng & Mã mở khóa', icon: BookOpen },
          { id: 'evidence', label: `3. Duyệt Minh chứng (${pendingEvidences})`, icon: Shield },
          { id: 'feedback', label: '4. Đăng Nhận xét Cá nhân', icon: Award },
          { id: 'reports', label: '5. Báo cáo & Khôi phục', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-extrabold transition-all border-b-2 -mb-1 shrink-0 ${
                isActive
                  ? 'border-orange-500 text-orange-700 bg-orange-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STUDENTS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Toggle Excel Importer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-200">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Nguồn Dữ Liệu Học Sinh Lớp 10A (Nhập từ Excel)</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Đăng nhập học sinh được xác thực trực tiếp dựa trên danh sách này (Họ tên đầy đủ và MSHS).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowExcelImporter(!showExcelImporter)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>{showExcelImporter ? 'Đóng hộp nhập Excel' : 'Nhập học sinh từ Excel'}</span>
            </button>
          </div>

          {/* Excel Importer Box */}
          {showExcelImporter && (
            <StudentExcelImporter
              onSuccess={() => {
                fetchData();
              }}
              existingStudentIds={students.map((s) => s.studentId || '')}
            />
          )}

          <div className="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">
                Danh sách Học sinh Lớp 10A ({students.length})
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Xác thực bằng: Họ và tên đầy đủ + MSHS
              </span>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Mã số HS</th>
                  <th className="px-5 py-3.5">Họ và Tên</th>
                  <th className="px-5 py-3.5">Cấp độ & XP</th>
                  <th className="px-5 py-3.5">Chặng Hoàn Thành</th>
                  <th className="px-5 py-3.5">Minh chứng</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((stu) => {
                  const completedCount = Object.values(stu.progress || {}).filter(
                    (p: any) => p.status === 'completed'
                  ).length;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-mono font-bold text-orange-700">
                        {stu.studentId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{stu.avatar}</span>
                          <span className="font-extrabold text-slate-900">{stu.displayName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-slate-800">{stu.xp || 0} XP</span>
                        <span className="text-[10px] text-slate-400 block">
                          Cấp {stu.levelInfo?.level || 1}: {stu.levelInfo?.title || 'Tân binh'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          ✓ {completedCount} chặng
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">
                        📎 {stu.evidenceCount || 0} link nộp
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentId(stu.id);
                            setActiveTab('feedback');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition border border-orange-200"
                        >
                          Gửi nhận xét
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* TAB 2: QUESTS & UNLOCK CODES */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">
              Cấu hình Mã mở khóa, Deadline & Nội dung từng Chặng
            </h3>
            <span className="text-xs text-slate-500">
              Mã mở khóa được lưu bảo mật trên máy chủ và chỉ xác thực phía backend.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stages.map((stage) => (
              <div key={stage.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <span className="text-xl">{stage.icon}</span>
                    <span>{stage.title}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    Giai đoạn {stage.order}
                  </span>
                </div>

                <div className="space-y-3">
                  {stage.quests.map((q: any) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{q.title}</span>
                          <span className="font-black text-orange-600">+{q.xpReward} XP</span>
                        </div>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{q.summary}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-2 font-mono">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                            MÃ: {q.unlockCode || 'CHƯA ĐẶT'}
                          </span>
                          {q.deadline && (
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-sans text-[10px]">
                              Hạn: {new Date(q.deadline).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenEditQuest(q)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                          <span>Chỉnh sửa mã & deadline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Quest Modal */}
          {editingQuest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 my-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    Cấu hình chặng & Cơ chế điểm thưởng
                  </span>
                  <h4 className="text-lg font-black text-slate-900 mt-1">
                    Thiết lập: {editingQuest.title}
                  </h4>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-700">
                  {/* Tên chặng */}
                  <div>
                    <label className="block mb-1 text-slate-800">Tên chặng học tập:</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-sans text-xs focus:border-orange-500 outline-hidden font-medium"
                      placeholder="Nhập tên chặng..."
                    />
                  </div>

                  {/* Mô tả chặng */}
                  <div>
                    <label className="block mb-1 text-slate-800">Mô tả tóm tắt chặng:</label>
                    <textarea
                      rows={2}
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 font-sans text-xs focus:border-orange-500 outline-hidden font-medium"
                      placeholder="Tóm tắt nội dung thử thách..."
                    />
                  </div>

                  {/* Thông tin số lượng câu hỏi */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-800 block font-bold">Số lượng câu hỏi được tính điểm:</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Mẫu số dùng để tính tỷ lệ chính xác và công nhận hoàn thành chặng.
                      </span>
                    </div>
                    <span className="text-base font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-xl">
                      {editingQuest.interactiveGame?.questions?.length || 0} câu
                    </span>
                  </div>

                  {/* Điểm XP tối đa của chặng */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-800 font-bold">Điểm XP tối đa của chặng (XP Reward):</label>
                      <span className="text-[10px] text-orange-600 font-bold">Gamification XP</span>
                    </div>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={editXpReward}
                      onChange={(e) => setEditXpReward(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-orange-600 focus:border-orange-500 outline-hidden"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 font-normal">
                      💡 Giáo viên có thể đặt linh hoạt theo độ khó (ví dụ: chặng 10 câu đặt 100 XP, chặng 5 câu đặt 50 XP).
                    </p>
                  </div>

                  {/* Ngưỡng điểm để hoàn thành chặng */}
                  <div>
                    <label className="block mb-1 text-slate-800">Ngưỡng điểm để công nhận hoàn thành chặng:</label>
                    <select
                      value={editPassThreshold}
                      onChange={(e) => setEditPassThreshold(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-orange-500 outline-hidden bg-white"
                    >
                      <option value={50}>
                        Đúng trên 50% câu hỏi (Chuẩn: floor(N/2)+1 câu, ví dụ 6/10 câu, 3/5 câu)
                      </option>
                      <option value={60}>Đúng từ 60% tổng số câu hỏi trở lên</option>
                      <option value={70}>Đúng từ 70% tổng số câu hỏi trở lên</option>
                      <option value={80}>Đúng từ 80% tổng số câu hỏi trở lên</option>
                    </select>
                  </div>

                  {/* Quy tắc chấm điểm & quy đổi XP */}
                  <div>
                    <label className="block mb-1 text-slate-800">Quy tắc quy đổi điểm bài làm sang XP:</label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-orange-50/40 transition">
                        <input
                          type="radio"
                          name="gradingRule"
                          value="proportional"
                          checked={editGradingRule === 'proportional'}
                          onChange={() => setEditGradingRule('proportional')}
                          className="mt-0.5 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Quy đổi theo tỷ lệ phần trăm (Khuyên dùng)
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                            XP nhận được = (Số câu đúng / Tổng số câu) × XP tối đa. Ví dụ: đúng 8/10 câu nhận 80% của {editXpReward} XP = {Math.round(0.8 * editXpReward)} XP.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-orange-50/40 transition">
                        <input
                          type="radio"
                          name="gradingRule"
                          value="full_on_pass"
                          checked={editGradingRule === 'full_on_pass'}
                          onChange={() => setEditGradingRule('full_on_pass')}
                          className="mt-0.5 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Nhận trọn vẹn 100% XP khi đạt ngưỡng hoàn thành
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                            Chỉ cần vượt ngưỡng chặng là nhận đủ {editXpReward} XP.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Mã mở khóa & Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="block mb-1 text-slate-800">Mã mở khóa:</label>
                      <input
                        type="text"
                        value={editUnlockCode}
                        onChange={(e) => setEditUnlockCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs tracking-wider uppercase"
                        placeholder="VD: QUEST-10A"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">Thời hạn chót (Deadline):</label>
                      <input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingQuest(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuest}
                    disabled={questSaving}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-md transition disabled:opacity-50"
                  >
                    {questSaving ? 'Đang lưu...' : 'Lưu thiết lập chặng'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVIDENCE REVIEWS */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">
              Duyệt Sản Phẩm Minh Chứng Qua Đường Dẫn ({evidences.length})
            </h3>
            <span className="text-xs text-slate-500">
              Kiểm tra tính hợp lệ của link và chấm điểm theo rubric môn học
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {evidences.map((evi) => {
              const matchedStudent = students.find((s) => s.id === evi.studentId);
              return (
                <EvidenceCard
                  key={evi.id}
                  evidence={evi}
                  showStudentName={true}
                  studentName={matchedStudent ? matchedStudent.displayName : evi.studentId}
                  onReview={(item) => {
                    setReviewingEvidence(item);
                    setReviewStatus(item.status === 'submitted' ? 'approved' : item.status);
                    setReviewScore(item.teacherScore || 95);
                    setReviewFeedback(item.teacherFeedback || '');
                  }}
                />
              );
            })}
          </div>

          {/* Evidence Review Modal */}
          {reviewingEvidence && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
                <h4 className="text-lg font-black text-slate-900">
                  Đánh Giá Minh Chứng: {reviewingEvidence.title}
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-500">Đường dẫn sản phẩm:</span>
                  <a
                    href={reviewingEvidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline block font-mono text-[11px] truncate"
                  >
                    {reviewingEvidence.url} ↗
                  </a>
                </div>

                <div className="space-y-3 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Kết quả đánh giá:</label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                    >
                      <option value="approved">✓ Đạt yêu cầu (Approved)</option>
                      <option value="needs_revision">⚠️ Cần chỉnh sửa lại (Needs Revision)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Điểm đánh giá (thang 100):</label>
                    <input
                      type="number"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                      max={100}
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Lời nhận xét & hướng dẫn cải thiện:</label>
                    <textarea
                      rows={3}
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Ghi nhận xét cụ thể giúp học sinh phát triển..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-normal"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    onClick={() => setReviewingEvidence(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleSaveReview}
                    disabled={reviewSaving}
                    className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-extrabold hover:bg-orange-600 disabled:opacity-50"
                  >
                    {reviewSaving ? 'Đang lưu...' : 'Xác nhận Đánh giá'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERSONAL FEEDBACK COMPOSER */}
      {activeTab === 'feedback' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Đăng Thư Nhận Xét Cá Nhân Cho Từng Học Sinh
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Học sinh chỉ xem được thư nhận xét gửi cho riêng mình. Có thể lưu nháp trước khi công bố chính thức.
            </p>
          </div>

          {fbSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
              ✓ {fbSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Chọn Học sinh 10A:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentId} - {s.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Giai đoạn đánh giá:</label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                {stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    Giai đoạn {st.order}: {st.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Mức độ tương tác & chủ động (1 - 5 sao):</label>
              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFbEngagement(num)}
                    className="p-1 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${num <= fbEngagement ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1">Lời nhận xét tổng quát (Phong cách thư đồng hành):</label>
              <textarea
                rows={3}
                value={fbGeneralNote}
                onChange={(e) => setFbGeneralNote(e.target.value)}
                placeholder="Em đã thể hiện tinh thần dẫn dắt rất ấn tượng trong giai đoạn này..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-normal outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Điểm mạnh / Tiến bộ (mỗi dòng 1 ý):</label>
                <textarea
                  rows={3}
                  value={fbStrengths}
                  onChange={(e) => setFbStrengths(e.target.value)}
                  placeholder="Kỹ năng thấu cảm tốt&#10;Lắng nghe tích cực"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-normal outline-hidden"
                />
              </div>

              <div>
                <label className="block mb-1">Điểm cần cải thiện (mỗi dòng 1 ý):</label>
                <textarea
                  rows={3}
                  value={fbGrowth}
                  onChange={(e) => setFbGrowth(e.target.value)}
                  placeholder="Chủ động chia sẻ nhiều hơn&#10;Quản lý thời gian tốt hơn"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-normal outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Mục tiêu gợi ý cho giai đoạn tiếp theo:</label>
              <input
                type="text"
                value={fbNextGoals}
                onChange={(e) => setFbNextGoals(e.target.value)}
                placeholder="Chuẩn bị tốt mô hình thử nghiệm Low-Fi..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-normal outline-hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSaveFeedback(true)}
              disabled={fbSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Lưu bản nháp
            </button>
            <button
              onClick={() => handleSaveFeedback(false)}
              disabled={fbSaving}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-extrabold hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
            >
              {fbSaving ? 'Đang lưu...' : 'Công bố thư nhận xét'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & SETTINGS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Change Teacher Password */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-600" />
              <span>Đổi Mật Khẩu Quản Trị Giáo Viên</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tài khoản giáo viên hiện tại: <span className="font-mono font-bold text-slate-800">adminpdp</span>. Mật khẩu được băm và lưu trữ an toàn bằng thuật toán mã hóa SHA-256 có Salt.
            </p>

            {passwordMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300">
                ✓ {passwordMsg}
              </div>
            )}
            {passwordErr && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-300">
                ⚠️ {passwordErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại:
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu cũ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới (tối thiểu 6 ký tự):
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="text-right pt-1">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                >
                  {changingPassword ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                </button>
              </div>
            </form>
          </div>

          {/* Export Report Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-500" />
              <span>Xuất Báo Cáo Tiến Độ Lớp 10A</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tải xuống tập tin báo cáo toàn bộ dữ liệu học sinh, điểm XP, số chặng hoàn thành và liên kết minh chứng đã nộp của lớp 10A dưới định dạng JSON/CSV.
            </p>
            <button
              onClick={handleExportReport}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-black transition shadow-sm"
            >
              Tải xuống Báo cáo Lớp 10A
            </button>
          </div>

          {/* Reset Demo / Seed Data Card */}
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-4">
            <h4 className="text-base font-black text-rose-950 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Khôi Phục Danh Sách Học Sinh 10A Mặc Định</span>
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              Đặt lại cơ sở dữ liệu về danh sách 32 học sinh chính thức ban đầu của lớp 10A Trường Tiểu học, THCS & THPT FPT Hậu Giang, các chặng học tập và thư nhận xét của giáo viên.
            </p>
            <button
              onClick={handleResetData}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 transition"
            >
              Đặt lại danh sách 10A chuẩn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
