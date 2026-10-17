// Project X | Learning Quest - Deadline & Reminder Status Calculator

export type DeadlineStatus =
  | 'no_deadline'
  | 'normal'
  | 'warning_48h'
  | 'warning_24h'
  | 'warning_6h'
  | 'overdue';

export interface DeadlineInfo {
  status: DeadlineStatus;
  hoursRemaining: number;
  formattedRemaining: string;
  isOverdue: boolean;
  friendlyMessage: string;
  badgeColor: string;
}

export function evaluateDeadline(deadlineStr?: string, now = Date.now()): DeadlineInfo {
  if (!deadlineStr) {
    return {
      status: 'no_deadline',
      hoursRemaining: Infinity,
      formattedRemaining: 'Không giới hạn thời gian',
      isOverdue: false,
      friendlyMessage: 'Chặng học tập tự do, bạn hãy hoàn thành theo tiến độ phù hợp nhé!',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  const deadlineTime = new Date(deadlineStr).getTime();
  const diffMs = deadlineTime - now;
  const hoursRemaining = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    const overdueHours = Math.abs(Math.round(hoursRemaining));
    return {
      status: 'overdue',
      hoursRemaining,
      formattedRemaining: `Đã quá hạn ${overdueHours} giờ`,
      isOverdue: true,
      friendlyMessage: 'Chặng đã hết thời gian. Đừng lo lắng! Hãy kích hoạt Nhiệm vụ khôi phục quyền để tiếp tục nhé.',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    };
  }

  if (hoursRemaining <= 6) {
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);
    return {
      status: 'warning_6h',
      hoursRemaining,
      formattedRemaining: `Còn ${hours}h ${minutes}m`,
      isOverdue: false,
      friendlyMessage: `Thời hạn chỉ còn ${hours} giờ! Hãy dành một chút thời gian để hoàn thành thử thách nào!`,
      badgeColor: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
    };
  }

  if (hoursRemaining <= 24) {
    const hours = Math.round(hoursRemaining);
    return {
      status: 'warning_24h',
      hoursRemaining,
      formattedRemaining: `Còn ${hours} giờ`,
      isOverdue: false,
      friendlyMessage: `Bạn còn ${hours} giờ để hoàn thành nhiệm vụ. Hãy quay lại hành trình và chinh phục thử thách nhé!`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }

  if (hoursRemaining <= 48) {
    const hours = Math.round(hoursRemaining);
    return {
      status: 'warning_48h',
      hoursRemaining,
      formattedRemaining: `Còn ${hours} giờ (2 ngày)`,
      isOverdue: false,
      friendlyMessage: 'Thời hạn sắp tới trong 2 ngày nữa. Lên kế hoạch chinh phục ngay hôm nay nhé!',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
  }

  const days = Math.round(hoursRemaining / 24);
  return {
    status: 'normal',
    hoursRemaining,
    formattedRemaining: `Còn ${days} ngày`,
    isOverdue: false,
    friendlyMessage: `Hạn chót còn ${days} ngày. Tiến độ đang rất tốt!`,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };
}
