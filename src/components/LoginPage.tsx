// Project X | Learning Quest - Login Page with Student & Teacher Portals + Quick Demo Accounts
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Compass, GraduationCap, ShieldCheck, Sparkles, KeyRound, User, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginStudent, loginTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student form
  const [studentId, setStudentId] = useState('FPT10A01');
  const [pin, setPin] = useState('1234');

  // Teacher form
  const [username, setUsername] = useState('giaovien');
  const [password, setPassword] = useState('fpt123456');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginStudent(studentId, pin);
    } catch (err: any) {
      setError(err.message || 'Mã số học sinh hoặc mã PIN không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginTeacher(username, password);
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu giáo viên không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudent = async (id: string) => {
    setStudentId(id);
    setPin('1234');
    setLoading(true);
    setError(null);
    try {
      await loginStudent(id, '1234');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTeacher = async () => {
    setUsername('giaovien');
    setPassword('fpt123456');
    setLoading(true);
    setError(null);
    try {
      await loginTeacher('giaovien', 'fpt123456');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-amber-100/60 via-orange-50/40 to-yellow-100/60 font-['Be_Vietnam_Pro',sans-serif]">
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

          <span className="inline-block px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold uppercase tracking-wider">
            Lớp 10A • Thế giới Học tập Gamification
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
              <span>Học sinh</span>
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
              <span>Giáo viên</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-300">
              ⚠️ {error}
            </div>
          )}

          {/* STUDENT FORM */}
          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã số học sinh (do nhà trường cấp):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: FPT10A01"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm font-mono font-bold uppercase outline-hidden"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã PIN xác thực (mặc định demo: 1234):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden font-mono"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
              >
                <span>{loading ? 'Đang đăng nhập...' : 'Bắt đầu Hành trình'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Login Student Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 text-center">
                  ⚡ Chọn nhanh tài khoản học sinh mẫu lớp 10A:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'FPT10A01', name: 'Nguyễn Minh Trí' },
                    { id: 'FPT10A02', name: 'Trần Lê Bảo Ngọc' },
                    { id: 'FPT10A03', name: 'Lê Hoàng Nam' },
                    { id: 'FPT10A04', name: 'Phạm Thảo Vy' },
                  ].map((stu) => (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => handleQuickStudent(stu.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 text-left transition truncate"
                    >
                      <span className="font-bold block truncate">{stu.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{stu.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* TEACHER FORM */
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập hoặc Email giáo viên:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="giaovien hoặc lanphuong.dodo@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu giáo viên:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="fpt123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 text-white font-extrabold text-sm shadow-md hover:bg-black transition disabled:opacity-50"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleQuickTeacher}
                  className="w-full py-2 rounded-xl bg-amber-50 text-orange-700 text-xs font-bold hover:bg-amber-100 transition border border-amber-200"
                >
                  ⚡ Đăng nhập nhanh tài khoản Giáo viên (Cô Đỗ Lan Phương)
                </button>
              </div>
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
