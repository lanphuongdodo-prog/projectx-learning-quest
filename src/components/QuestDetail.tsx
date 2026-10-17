// Project X | Learning Quest - Single Quest Detail View with Learning Hub & Challenge Tabs
import React, { useState, useEffect } from 'react';
import { Quest, Stage } from '../types/index.ts';
import { api } from '../services/api.ts';
import { FlashcardViewer } from './FlashcardViewer.tsx';
import { InteractiveGameRunner } from './InteractiveGameRunner.tsx';
import { EvidenceSection } from './EvidenceSection.tsx';
import { evaluateDeadline } from '../utils/deadlineHelper.ts';
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  Paperclip,
  Clock,
  Sparkles,
  Trophy,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  X,
} from 'lucide-react';

interface QuestDetailProps {
  questId: string;
  onBackToMap: () => void;
  onRefreshUser: () => void;
}

export const QuestDetail: React.FC<QuestDetailProps> = ({ questId, onBackToMap, onRefreshUser }) => {
  const [questData, setQuestData] = useState<{
    quest: Quest;
    stageTitle: string;
    userProgress: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'learning' | 'game' | 'evidence'>('learning');
  const [isKnowledgeDrawerOpen, setIsKnowledgeDrawerOpen] = useState(false);

  const fetchQuest = async () => {
    setLoading(true);
    try {
      const res = await api.getQuest(questId);
      setQuestData(res);
      // If user has already finished or in_progress, start on game tab
      if (res.userProgress?.status === 'in_progress' || res.userProgress?.status === 'completed') {
        setActiveTab('game');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin chặng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuest();
  }, [questId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Đang tải chặng học tập Project X...</p>
      </div>
    );
  }

  if (error || !questData) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h3 className="text-lg font-black text-slate-800">Không thể truy cập chặng này</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <button
          onClick={onBackToMap}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
        >
          Quay lại bản đồ
        </button>
      </div>
    );
  }

  const { quest, stageTitle, userProgress } = questData;
  const isCompleted = userProgress?.status === 'completed';
  const isOverdue = userProgress?.status === 'overdue';
  const deadlineInfo = evaluateDeadline(quest.deadline);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMap}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bản đồ hành trình</span>
        </button>

        <div className="flex items-center gap-2">
          {deadlineInfo && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${deadlineInfo.badgeColor}`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{deadlineInfo.formattedRemaining}</span>
            </div>
          )}
          <span className="text-xs font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
            +{quest.xpReward} XP
          </span>
        </div>
      </div>

      {/* Quest Header Card */}
      <div className="rounded-3xl bg-white border border-amber-200/90 shadow-md p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase">
            {stageTitle}
          </span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            NỘI DUNG DEMO
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {quest.title}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          {quest.storyline}
        </p>

        {quest.badgeReward && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 mt-1">
            <span className="text-base">{quest.badgeReward.icon}</span>
            <span>Huy hiệu hoàn thành: {quest.badgeReward.name} - {quest.badgeReward.description}</span>
          </div>
        )}
      </div>

      {/* 3 Main Tabs Navigation */}
      <div className="flex border-b border-amber-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('learning')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-black text-xs sm:text-sm transition-all border-b-2 -mb-1 shrink-0 ${
            activeTab === 'learning'
              ? 'border-orange-500 text-orange-700 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Khám phá kiến thức (Learning Hub)</span>
        </button>

        <button
          onClick={() => setActiveTab('game')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-black text-xs sm:text-sm transition-all border-b-2 -mb-1 shrink-0 ${
            activeTab === 'game'
              ? 'border-orange-500 text-orange-700 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>2. Chinh phục thử thách</span>
          {isCompleted && <span className="text-xs text-emerald-600 font-extrabold">✓</span>}
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-black text-xs sm:text-sm transition-all border-b-2 -mb-1 shrink-0 ${
            activeTab === 'evidence'
              ? 'border-orange-500 text-orange-700 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>3. Minh chứng của tôi</span>
        </button>
      </div>

      {/* TAB 1: LEARNING HUB */}
      {activeTab === 'learning' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Theory Summary */}
          <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Nội dung Lý thuyết Cốt lõi</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {quest.learningHub?.theorySummary}
            </p>
          </div>

          {/* Key Concepts Cards */}
          {quest.learningHub?.keyConcepts && quest.learningHub.keyConcepts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span>Khái niệm & Thuật ngữ Quan trọng</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quest.learningHub.keyConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                  >
                    <span className="text-xs font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
                      {item.term}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item.definition}
                    </p>
                    {item.example && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                        💡 Ví dụ: {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Flashcards */}
          {quest.learningHub?.flashcards && quest.learningHub.flashcards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <span>Bộ thẻ Flashcard Ôn tập Tương tác</span>
                </h3>
                <span className="text-xs text-slate-500">Lật thẻ để kiểm tra trí nhớ</span>
              </div>
              <FlashcardViewer cards={quest.learningHub.flashcards} questId={quest.id} />
            </div>
          )}

          {/* Guidelines & External Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quest.learningHub?.guidelines && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quy tắc & Lưu ý:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  {quest.learningHub.guidelines.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

            {quest.learningHub?.externalLinks && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tài liệu Tham khảo Mở rộng:
                </h4>
                <div className="space-y-2">
                  {quest.learningHub.externalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 transition"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA to proceed to game */}
          <div className="text-center pt-4">
            <button
              onClick={() => setActiveTab('game')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Chuyển sang Chinh phục thử thách</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE GAME */}
      {activeTab === 'game' && (
        <div className="animate-in fade-in duration-200">
          <InteractiveGameRunner
            questId={quest.id}
            game={quest.interactiveGame}
            recoveryConfig={quest.recoveryConfig}
            isCompleted={isCompleted}
            isOverdue={isOverdue}
            onGameCompleted={() => {
              fetchQuest();
              onRefreshUser();
            }}
            onOpenKnowledgeHub={() => setIsKnowledgeDrawerOpen(true)}
          />
        </div>
      )}

      {/* TAB 3: EVIDENCE SECTION */}
      {activeTab === 'evidence' && (
        <div className="animate-in fade-in duration-200">
          <EvidenceSection
            questId={quest.id}
            requirement={quest.evidenceRequirement}
          />
        </div>
      )}

      {/* Quick Knowledge Drawer (can be opened without losing quiz state) */}
      {isKnowledgeDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-800 text-base">Xem nhanh Kiến thức nền</h3>
              </div>
              <button
                onClick={() => setIsKnowledgeDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              {quest.learningHub?.theorySummary}
            </p>

            {quest.learningHub?.keyConcepts && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500">Khái niệm cốt lõi:</h4>
                {quest.learningHub.keyConcepts.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-orange-700">{item.term}</span>
                    <p className="text-slate-600">{item.definition}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
