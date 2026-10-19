// Project X | Learning Quest - Top Navigation Bar
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { calculateLevelInfo } from '../utils/gamification.ts';
import { api } from '../services/api.ts';
import { NotificationItem } from '../types/index.ts';
import {
  Compass,
  Trophy,
  BookOpen,
  Sparkles,
  LogOut,
  Bell,
  Menu,
  X,
  Flame,
  Award,
  Shield,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenNotifications }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'student') {
      api.getNotifications().then((res) => {
        const unread = res.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, [user, currentTab]);

  if (!user) return null;

  const isStudent = user.role === 'student';
  const levelInfo = isStudent ? calculateLevelInfo(user.xp || 0) : null;

  const studentNavItems = [
    { id: 'map', label: 'Bản đồ Hành trình', icon: Compass },
    { id: 'leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
    { id: 'feedback', label: 'Nhận xét Giáo viên', icon: Award },
    { id: 'portfolio', label: 'My Portfolio', icon: Sparkles },
  ];

  const teacherNavItems = [
    { id: 'teacher-overview', label: 'Tổng quan Lớp 10A', icon: Layers },
    { id: 'teacher-quests', label: 'Quản lý Chặng & Nội dung', icon: BookOpen },
    { id: 'teacher-evidence', label: 'Duyệt Minh chứng', icon: Shield },
    { id: 'teacher-feedback', label: 'Đăng Nhận xét', icon: Award },
    { id: 'leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
  ];

  const navItems = isStudent ? studentNavItems : teacherNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onSelectTab(isStudent ? 'map' : 'teacher-overview')}
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 transform transition hover:scale-105">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  PROJECT X
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  QUEST 10A
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                TH, THCS & THPT FPT Hậu Giang
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-100 text-orange-700 shadow-xs'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-amber-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Badges, XP & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isStudent && levelInfo && (
              <>
                {/* Streak */}
                <div
                  className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-200 text-xs font-bold"
                  title="Chuỗi ngày học tập tích cực"
                >
                  <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{user.streak ?? 0} ngày</span>
                </div>

                {/* XP Pill */}
                <div
                  className="flex items-center space-x-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full border border-amber-300 text-xs font-bold"
                  title={`${user.xp || 0} Điểm kinh nghiệm (Cấp ${levelInfo.level} - ${levelInfo.title})`}
                >
                  <span className="text-sm">⭐</span>
                  <span>{user.xp || 0} XP</span>
                  <span className="text-[10px] bg-amber-200/90 text-amber-900 px-1.5 py-0.2 rounded-full font-extrabold">
                    Lv.{levelInfo.level}
                  </span>
                </div>

                {/* Notifications Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-amber-50 rounded-xl transition"
                  title="Thông báo & Hạn chót"
                  aria-label="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>
              </>
            )}

            {/* User Avatar & Logout */}
            <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-amber-200">
              <div className="flex items-center space-x-2 bg-amber-50/60 p-1 rounded-2xl">
                <span className="text-xl w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center shadow-2xs">
                  {user.avatar || (isStudent ? '🦊' : '👩‍🏫')}
                </span>
                <div className="hidden lg:block text-left pr-2">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isStudent ? `${user.studentId} • Lớp ${user.className}` : 'Giáo viên Project X'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-amber-50 rounded-xl"
              aria-label="Mở danh mục"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-100 text-orange-700'
                    : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
