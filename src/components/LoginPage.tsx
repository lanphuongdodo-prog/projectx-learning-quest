// Project X | Learning Quest - Login Page
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Compass, GraduationCap, ShieldCheck, User, Lock, Hash, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginStudent, loginTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student form state: Full Name + MSHS only (no PIN, no password)
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  // Teacher form state: Username + Password only (no email)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      setError('Vui lòng nhập đầy đủ Họ và tên và Mã số học sinh (MSHS).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginStudent(studentName.trim(), studentId.trim());
    } catch (err: any) {
      setError(
        err.message ||
          'Thông tin chưa khớp với danh sách học sinh của nhà trường. Bạn vui lòng kiểm tra lại họ tên và mã số học sinh nhé!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu giáo viên.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginTeacher(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu giáo viên không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-amber-100/70 via-orange-50/50 to-yellow-100/70 font-['Be_Vietnam_Pro',sans-serif]">
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-500 items-center justify-center text-white shadow-xl shadow-orange-500/20 transform transition hover:scale-105">
            <Compass className="w-9 h-9" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2">
            PROJECT X <span className="text-orange-600">| QUEST</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Trường Tiểu học, THCS & THPT FPT Hậu Giang
          </p>

          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            Lớp 10A • Cổng Học Tập & Quản Lý Dự Án
          </span>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-200 p-6 sm:p-8 space-y-6">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
                activeTab === 'student'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Đăng nhập Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
                activeTab === 'teacher'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Đăng nhập Giáo viên</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* STUDENT FORM: Name + MSHS Only */}
          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên đầy đủ của học sinh: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm font-semibold outline-hidden"
                    required
                    autoFocus
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã số học sinh (MSHS do nhà trường cấp): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Ví dụ: FHG00010"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm font-mono font-bold uppercase outline-hidden"
                    required
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-slate-600">
                💡 Học sinh đăng nhập bằng đúng <strong>Họ tên đầy đủ</strong> và <strong>Mã số học sinh (MSHS)</strong> do nhà trường cung cấp. Không yêu cầu mật khẩu hay mã PIN.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
              >
                <span>{loading ? 'Đang xác thực thông tin...' : 'Vào Hành Trình Học Tập'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* TEACHER FORM: Username + Password Only (No email field) */
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập quản trị viên"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden font-medium"
                    required
                    autoFocus
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                🔒 Khu vực bảo mật dành cho Ban Điều Phối & Giáo viên Phụ trách môn học Project X.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 text-white font-extrabold text-sm shadow-md hover:bg-black transition disabled:opacity-50"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          © 2026 PROJECT X | LEARNING QUEST • Trường Tiểu học, THCS & THPT FPT Hậu Giang
        </p>
      </div>
    </div>
  );
};
