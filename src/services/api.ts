// Project X | Learning Quest - API Client Service
import {
  User,
  Stage,
  Quest,
  EvidenceSubmission,
  TeacherFeedback,
  PortfolioData,
  NotificationItem,
  LeaderboardEntry,
} from '../types/index.ts';

const TOKEN_KEY = 'project_x_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || `Lỗi hệ thống (${res.status})`;
    const error: any = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  async login(credentials: {
    role: 'student' | 'teacher';
    studentId?: string;
    pin?: string;
    username?: string;
    password?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
    }
  },

  // Stages & Quests
  async getStages(): Promise<{ stages: Stage[] }> {
    return request<{ stages: Stage[] }>('/api/stages');
  },

  async getQuest(questId: string): Promise<{ quest: Quest; stageTitle: string; userProgress: any }> {
    return request<{ quest: Quest; stageTitle: string; userProgress: any }>(`/api/quests/${questId}`);
  },

  async unlockQuest(questId: string, code: string): Promise<{ success: boolean; message: string; questId: string }> {
    return request<{ success: boolean; message: string; questId: string }>(`/api/quests/${questId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async submitGame(questId: string, answers: Record<string, any>): Promise<any> {
    return request(`/api/quests/${questId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  async submitRecovery(questId: string, payload: { reflectionNote?: string; quizAnswer?: string }): Promise<any> {
    return request(`/api/quests/${questId}/recovery`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Flashcards
  async updateFlashcardStatus(cardId: string, state: string): Promise<any> {
    return request('/api/flashcards/status', {
      method: 'POST',
      body: JSON.stringify({ cardId, state }),
    });
  },

  async getFlashcardProgress(): Promise<any> {
    return request('/api/flashcards/progress');
  },

  // Evidence
  async getEvidence(questId?: string): Promise<{ evidence: EvidenceSubmission[] }> {
    const url = questId ? `/api/evidence?questId=${questId}` : '/api/evidence';
    return request<{ evidence: EvidenceSubmission[] }>(url);
  },

  async submitEvidence(payload: { questId: string; url: string; title: string; description?: string }): Promise<any> {
    return request('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async reviewEvidence(evidenceId: string, payload: { status: string; teacherFeedback?: string; teacherScore?: number }): Promise<any> {
    return request(`/api/evidence/${evidenceId}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Feedback
  async getFeedback(): Promise<{ feedback: TeacherFeedback[] }> {
    return request<{ feedback: TeacherFeedback[] }>('/api/feedback');
  },

  async submitTeacherFeedback(payload: any): Promise<any> {
    return request('/api/teacher/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Portfolio
  async getPortfolio(studentId: string): Promise<any> {
    return request(`/api/portfolio/${studentId}`);
  },

  async updatePortfolio(payload: Partial<PortfolioData>): Promise<any> {
    return request('/api/portfolio', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Leaderboard
  async getLeaderboard(stageId?: string): Promise<{ leaderboard: LeaderboardEntry[] }> {
    const url = stageId ? `/api/leaderboard?stageId=${stageId}` : '/api/leaderboard';
    return request<{ leaderboard: LeaderboardEntry[] }>(url);
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<any> {
    return request(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  // Teacher tools
  async getTeacherStudents(): Promise<{ students: any[] }> {
    return request<{ students: any[] }>('/api/teacher/students');
  },

  async updateTeacherQuest(questId: string, payload: any): Promise<any> {
    return request(`/api/teacher/quests/${questId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetDatabase(): Promise<any> {
    return request('/api/teacher/reset-database', { method: 'POST' });
  },
};
