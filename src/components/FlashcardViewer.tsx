// Project X | Learning Quest - Interactive Flashcard Study Hub with 3-State Mastery
import React, { useState, useEffect } from 'react';
import { Flashcard, FlashcardMastery } from '../types/index.ts';
import { api } from '../services/api.ts';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface FlashcardViewerProps {
  cards: Flashcard[];
  questId: string;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, questId }) => {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryMap, setMasteryMap] = useState<Record<string, FlashcardMastery>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'need_review'>('all');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    // Fetch stored flashcard progress
    api.getFlashcardProgress().then((res) => {
      const prog = res.progress || {};
      const map: Record<string, FlashcardMastery> = {};
      Object.values(prog).forEach((item: any) => {
        map[item.cardId] = item.state;
      });
      setMasteryMap(map);
    }).catch(() => {});
  }, [questId]);

  useEffect(() => {
    if (filterMode === 'need_review') {
      const filtered = cards.filter(
        (c) => masteryMap[c.id] === 'need_review' || masteryMap[c.id] === 'unseen' || !masteryMap[c.id]
      );
      setDeck(filtered.length > 0 ? filtered : cards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setDeck(cards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [filterMode, cards, masteryMap]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200">
        <p className="text-sm text-slate-500">Chưa có flashcard nào cho chặng này.</p>
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];
  const currentMastery = masteryMap[currentCard?.id] || 'unseen';

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleSetMastery = async (state: FlashcardMastery) => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    setMasteryMap((prev) => ({ ...prev, [cardId]: state }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);

    try {
      await api.updateFlashcardStatus(cardId, state);
    } catch (err) {
      console.error('Error saving flashcard state:', err);
    }

    // Auto advance if mastered
    if (state === 'mastered' && currentIndex < deck.length - 1) {
      setTimeout(() => handleNext(), 300);
    }
  };

  // Calculate mastery stats
  const masteredCount = cards.filter((c) => masteryMap[c.id] === 'mastered').length;
  const reviewCount = cards.filter((c) => masteryMap[c.id] === 'need_review').length;

  return (
    <div className="space-y-6">
      {/* Header controls & stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" />
          <span className="font-extrabold text-sm text-slate-800">
            Thẻ {currentIndex + 1} / {deck.length}
          </span>
          {currentCard?.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-orange-800 border border-amber-200">
              {currentCard.category}
            </span>
          )}
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            ✓ Đã thuộc: {masteredCount}/{cards.length}
          </span>
          {reviewCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              ⚡ Cần ôn: {reviewCount}
            </span>
          )}
        </div>

        {/* Shuffle & Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-slate-700 text-xs font-bold hover:bg-amber-100 transition"
            title="Đảo thẻ ngẫu nhiên"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trộn thẻ</span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'all' ? 'need_review' : 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              filterMode === 'need_review'
                ? 'bg-orange-500 text-white border-orange-600'
                : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {filterMode === 'need_review' ? 'Đang lọc: Thẻ chưa nhớ' : 'Chỉ xem thẻ cần ôn'}
          </button>
        </div>
      </div>

      {/* Main Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[260px] sm:min-h-[300px] w-full cursor-pointer select-none perspective-1000 group"
      >
        <div
          className={`relative w-full h-full min-h-[260px] sm:min-h-[300px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg border-2 ${
            isFlipped
              ? 'bg-linear-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border-orange-400'
              : 'bg-white border-amber-300 hover:border-orange-400 hover:shadow-xl'
          }`}
        >
          {/* Card Top Label */}
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
            <span className="uppercase tracking-wider">
              {isFlipped ? '💡 Câu trả lời / Giải thích' : '❓ Câu hỏi / Khái niệm'}
            </span>
            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 text-[11px]">
              <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              <span>Chạm để lật thẻ</span>
            </span>
          </div>

          {/* Card Content */}
          <div className="py-6 text-center my-auto">
            {!isFlipped ? (
              <div className="space-y-3">
                <p className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                  {currentCard?.front}
                </p>
                {currentCard?.hint && (
                  <p className="text-xs text-slate-500 italic flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gợi ý: {currentCard.hint}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <p className="text-base sm:text-xl font-bold text-orange-950 leading-relaxed">
                  {currentCard?.back}
                </p>
              </div>
            )}
          </div>

          {/* Card Bottom status reminder */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
            <span>Thẻ {currentIndex + 1} của {deck.length}</span>
            {currentMastery === 'mastered' && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã nắm vững
              </span>
            )}
            {currentMastery === 'need_review' && (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Cần ôn tập lại
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Self-Assessment Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 shadow-2xs transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thẻ trước</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 shadow-2xs transition"
          >
            <span>Thẻ tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Self-Assessment Buttons */}
        <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
          <button
            onClick={() => handleSetMastery('unseen')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
              currentMastery === 'unseen'
                ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Chưa nhớ
          </button>

          <button
            onClick={() => handleSetMastery('need_review')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
              currentMastery === 'need_review'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            ⚡ Cần ôn tập
          </button>

          <button
            onClick={() => handleSetMastery('mastered')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
              currentMastery === 'mastered'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            ✓ Đã nắm vững
          </button>
        </div>
      </div>
    </div>
  );
};
