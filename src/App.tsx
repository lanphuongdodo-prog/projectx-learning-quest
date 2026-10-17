// Project X | Learning Quest - Main Application Entry Point
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { StudentHeroBanner } from './components/StudentHeroBanner.tsx';
import { QuestMap } from './components/QuestMap.tsx';
import { QuestDetail } from './components/QuestDetail.tsx';
import { QuestUnlockModal } from './components/QuestUnlockModal.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { TeacherFeedbackLetter } from './components/TeacherFeedbackLetter.tsx';
import { CreativePortfolio } from './components/CreativePortfolio.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { api } from './services/api.ts';
import { Stage } from './types/index.ts';

const MainApp: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('map');
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);

  // Modals
  const [unlockModalQuest, setUnlockModalQuest] = useState<any | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchStages = async () => {
    if (!user) return;
    setStagesLoading(true);
    try {
      const res = await api.getStages();
      setStages(res.stages);
    } catch (err) {
      console.error('Error fetching stages:', err);
    } finally {
      setStagesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStages();
      if (user.role === 'teacher') {
        setCurrentTab('teacher-overview');
      } else {
        setCurrentTab('map');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-700">Đang khởi tạo Project X...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const isTeacher = user.role === 'teacher';

  const handleOpenQuest = (questId: string) => {
    setActiveQuestId(questId);
    setCurrentTab('quest-detail');
  };

  const handleBackToMap = () => {
    setActiveQuestId(null);
    setCurrentTab('map');
    fetchStages();
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'quest-detail') {
            setActiveQuestId(null);
          }
          setCurrentTab(tab);
        }}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* STUDENT VIEWS */}
        {!isTeacher && (
          <>
            {currentTab === 'map' && (
              <>
                <StudentHeroBanner user={user} stages={stages} />
                <QuestMap
                  stages={stages}
                  onOpenQuest={handleOpenQuest}
                  onRequestUnlock={(q) => setUnlockModalQuest(q)}
                />
              </>
            )}

            {currentTab === 'quest-detail' && activeQuestId && (
              <QuestDetail
                questId={activeQuestId}
                onBackToMap={handleBackToMap}
                onRefreshUser={refreshUser}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView stages={stages} />
            )}

            {currentTab === 'feedback' && (
              <TeacherFeedbackLetter stages={stages} />
            )}

            {currentTab === 'portfolio' && (
              <CreativePortfolio />
            )}
          </>
        )}

        {/* TEACHER VIEWS */}
        {isTeacher && (
          <>
            {currentTab.startsWith('teacher-') && (
              <TeacherDashboard
                stages={stages}
                onRefreshStages={fetchStages}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView stages={stages} />
            )}
          </>
        )}
      </main>

      {/* Unlock Quest Code Modal */}
      {unlockModalQuest && (
        <QuestUnlockModal
          quest={unlockModalQuest}
          isOpen={Boolean(unlockModalQuest)}
          onClose={() => setUnlockModalQuest(null)}
          onUnlocked={(questId) => {
            fetchStages();
            handleOpenQuest(questId);
          }}
        />
      )}

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectQuest={(questId) => {
          handleOpenQuest(questId);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
