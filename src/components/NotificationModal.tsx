// Project X | Learning Quest - Notification & Deadline Center Modal
import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Bell, Clock, CheckCircle2, Award, Sparkles, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuest?: (questId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectQuest,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getNotifications()
        .then((res) => setNotifications(res.notifications))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-amber-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="font-black text-slate-900 text-base">Trung tâm Thông báo & Hạn chót</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-3 space-y-3 flex-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Bạn không có thông báo mới nào.</div>
          ) : (
            notifications.map((n) => {
              const isDeadline = n.type.startsWith('deadline');
              const isOverdue = n.type === 'overdue';

              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition text-xs space-y-1.5 cursor-pointer ${
                    !n.isRead
                      ? isOverdue
                        ? 'bg-rose-50 border-rose-200'
                        : isDeadline
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-orange-50/50 border-orange-200'
                      : 'bg-white border-slate-100 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      {isOverdue ? (
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                      ) : isDeadline ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Award className="w-3.5 h-3.5 text-orange-600" />
                      )}
                      <span>{n.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed font-medium">{n.message}</p>

                  {n.questId && onSelectQuest && (
                    <div className="pt-1 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuest(n.questId!);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-orange-600 hover:underline"
                      >
                        Đến chặng thử thách ngay →
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
