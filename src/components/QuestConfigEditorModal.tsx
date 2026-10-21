// Project X | Learning Quest - Comprehensive Stage & Quest Configuration Editor Modal for Teachers
import React, { useState } from 'react';
import {
  Quest,
  GameQuestion,
  Flashcard,
  KeyConcept,
  GameType,
} from '../types/index.ts';
import {
  X,
  Save,
  BookOpen,
  Layers,
  Gamepad2,
  Award,
  KeyRound,
  Eye,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Clock,
  RotateCw,
  AlertCircle,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface QuestConfigEditorModalProps {
  quest: Quest;
  stageTitle: string;
  onClose: () => void;
  onSave: (updatedQuest: Partial<Quest>) => Promise<void>;
  onRefresh: () => void;
}

export const QuestConfigEditorModal: React.FC<QuestConfigEditorModalProps> = ({
  quest,
  stageTitle,
  onClose,
  onSave,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'content' | 'flashcards' | 'game' | 'scoring' | 'conditions' | 'preview'
  >('content');

  // General details
  const [title, setTitle] = useState(quest.title || '');
  const [summary, setSummary] = useState(quest.summary || '');
  const [storyline, setStoryline] = useState(quest.storyline || '');
  const [status, setStatus] = useState<'published' | 'draft'>(quest.status || 'published');

  // 1. Learning Hub
  const [theorySummary, setTheorySummary] = useState(
    quest.learningHub?.theorySummary || ''
  );
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>(
    quest.learningHub?.keyConcepts || []
  );
  const [guidelines, setGuidelines] = useState<string[]>(
    quest.learningHub?.guidelines || []
  );
  const [externalLinks, setExternalLinks] = useState<Array<{ title: string; url: string }>>(
    quest.learningHub?.externalLinks || []
  );

  // 2. Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    quest.learningHub?.flashcards || []
  );
  const [previewFlippedCardId, setPreviewFlippedCardId] = useState<string | null>(null);

  // 3. Game & Questions
  const [gameTitle, setGameTitle] = useState(
    quest.interactiveGame?.instructions
      ? quest.title
      : 'Thử thách giải mã chặng'
  );
  const [gameInstructions, setGameInstructions] = useState(
    quest.interactiveGame?.instructions || 'Trả lời đúng các câu hỏi để hoàn thành chặng và tích lũy XP.'
  );
  const [questions, setQuestions] = useState<GameQuestion[]>(
    quest.interactiveGame?.questions || []
  );

  // 4. Scoring & Threshold
  const [xpReward, setXpReward] = useState<number>(quest.xpReward || 100);
  const [passThreshold, setPassThreshold] = useState<number>(quest.passThreshold ?? 50);
  const [gradingRule, setGradingRule] = useState<'proportional' | 'full_on_pass'>(
    quest.gradingRule || 'proportional'
  );

  // 5. Conditions & Unlock
  const [unlockType, setUnlockType] = useState<'code' | 'prerequisite' | 'time' | 'both'>(
    quest.unlockType || 'code'
  );
  const [unlockCode, setUnlockCode] = useState(quest.unlockCode || '');
  const [deadline, setDeadline] = useState(
    quest.deadline ? new Date(quest.deadline).toISOString().slice(0, 16) : ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(quest.durationMinutes || 30);
  const [maxAttempts, setMaxAttempts] = useState<number>(quest.maxAttempts || 3);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // --- HANDLERS: KEY CONCEPTS ---
  const handleAddConcept = () => {
    setKeyConcepts([
      ...keyConcepts,
      {
        term: 'Thuật ngữ mới',
        definition: 'Mô tả và định nghĩa thuật ngữ...',
        example: 'Ví dụ thực tế minh họa...',
      },
    ]);
  };

  const handleUpdateConcept = (idx: number, field: keyof KeyConcept, value: string) => {
    const updated = [...keyConcepts];
    updated[idx] = { ...updated[idx], [field]: value };
    setKeyConcepts(updated);
  };

  const handleDeleteConcept = (idx: number) => {
    setKeyConcepts(keyConcepts.filter((_, i) => i !== idx));
  };

  // --- HANDLERS: GUIDELINES ---
  const handleAddGuideline = () => {
    setGuidelines([...guidelines, 'Bước tiếp theo trong quy trình...']);
  };

  const handleUpdateGuideline = (idx: number, value: string) => {
    const updated = [...guidelines];
    updated[idx] = value;
    setGuidelines(updated);
  };

  const handleDeleteGuideline = (idx: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== idx));
  };

  // --- HANDLERS: EXTERNAL LINKS ---
  const handleAddLink = () => {
    setExternalLinks([...externalLinks, { title: 'Tài liệu tham khảo', url: 'https://' }]);
  };

  const handleUpdateLink = (idx: number, field: 'title' | 'url', value: string) => {
    const updated = [...externalLinks];
    updated[idx] = { ...updated[idx], [field]: value };
    setExternalLinks(updated);
  };

  const handleDeleteLink = (idx: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== idx));
  };

  // --- HANDLERS: FLASHCARDS ---
  const handleAddFlashcard = () => {
    const newCard: Flashcard = {
      id: `fc-${Date.now()}-${flashcards.length + 1}`,
      front: 'Câu hỏi hoặc thuật ngữ mặt trước',
      back: 'Đáp án, định nghĩa hoặc lời giải thích mặt sau',
      category: 'Khái niệm',
    };
    setFlashcards([...flashcards, newCard]);
  };

  const handleUpdateFlashcard = (idx: number, field: keyof Flashcard, value: string) => {
    const updated = [...flashcards];
    updated[idx] = { ...updated[idx], [field]: value };
    setFlashcards(updated);
  };

  const handleDuplicateFlashcard = (idx: number) => {
    const original = flashcards[idx];
    const cloned: Flashcard = {
      ...original,
      id: `fc-${Date.now()}-${flashcards.length + 1}`,
      front: `${original.front} (Bản sao)`,
    };
    const updated = [...flashcards];
    updated.splice(idx + 1, 0, cloned);
    setFlashcards(updated);
  };

  const handleDeleteFlashcard = (idx: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== idx));
  };

  // --- HANDLERS: QUESTIONS ---
  const handleAddQuestion = (type: GameType = 'multiple_choice') => {
    const newQ: GameQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      prompt: 'Nội dung câu hỏi mới...',
      type,
      options:
        type === 'scenario'
          ? ['Đúng', 'Sai']
          : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: type === 'scenario' ? 'Đúng' : 'Phương án A',
      explanation: 'Giải thích chi tiết tại sao đáp án này chính xác...',
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<GameQuestion>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const q = questions[qIdx];
    const opts = q.options ? [...q.options] : [];
    opts.push(`Phương án ${String.fromCharCode(65 + opts.length)}`);
    handleUpdateQuestion(qIdx, { options: opts });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const q = questions[qIdx];
    if (!q.options) return;
    const opts = [...q.options];
    const oldVal = opts[optIdx];
    opts[optIdx] = val;
    // update correctAnswer if it matched the old value
    const newCorrect = q.correctAnswer === oldVal ? val : q.correctAnswer;
    handleUpdateQuestion(qIdx, { options: opts, correctAnswer: newCorrect });
  };

  const handleDeleteOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    if (!q.options || q.options.length <= 2) {
      alert('Câu hỏi trắc nghiệm cần có tối thiểu 2 phương án.');
      return;
    }
    const opts = q.options.filter((_, i) => i !== optIdx);
    handleUpdateQuestion(qIdx, {
      options: opts,
      correctAnswer: opts.includes(String(q.correctAnswer)) ? q.correctAnswer : opts[0],
    });
  };

  const handleDuplicateQuestion = (idx: number) => {
    const original = questions[idx];
    const cloned: GameQuestion = {
      ...original,
      id: `q-${Date.now()}-${questions.length + 1}`,
      prompt: `${original.prompt} (Bản sao)`,
      options: original.options ? [...original.options] : undefined,
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, cloned);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // --- SAVE OPERATION ---
  const handleSave = async (publishImmediate?: boolean) => {
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const finalStatus = publishImmediate !== undefined ? (publishImmediate ? 'published' : 'draft') : status;
      const payload: Partial<Quest> = {
        title: title.trim(),
        summary: summary.trim(),
        storyline: storyline.trim() || summary.trim(),
        status: finalStatus,
        xpReward,
        passThreshold,
        gradingRule,
        unlockType,
        unlockCode: unlockCode.trim().toUpperCase(),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        durationMinutes,
        maxAttempts,
        learningHub: {
          theorySummary: theorySummary.trim(),
          keyConcepts,
          guidelines,
          externalLinks,
          flashcards,
        },
        interactiveGame: {
          type: 'multiple_choice',
          instructions: gameInstructions.trim(),
          questions,
        },
      };

      await onSave(payload);
      setSaveSuccessMsg('Đã lưu thành công toàn bộ cấu hình chặng học tập!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu chặng');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'content', label: '1. Kiến thức & Học liệu', icon: BookOpen },
    { id: 'flashcards', label: `2. Flashcards (${flashcards.length})`, icon: Layers },
    { id: 'game', label: `3. Game & Câu hỏi (${questions.length})`, icon: Gamepad2 },
    { id: 'scoring', label: '4. Điểm XP & Chấm điểm', icon: Award },
    { id: 'conditions', label: '5. Điều kiện hoàn thành', icon: KeyRound },
    { id: 'preview', label: '6. Xem trước & Xuất bản', icon: Eye },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 my-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {stageTitle}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status === 'published' ? '✓ Đang công bố' : '🔒 Bản nháp'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Cấu hình Chặng: {title || 'Chặng mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập toàn diện kiến thức, flashcards, bộ câu hỏi tương tác và cơ chế cộng điểm XP cho học sinh lớp 10A.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu chặng'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 overflow-x-auto bg-slate-50/30 text-xs font-bold">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 -mb-[1px] shrink-0 ${
                  isActive
                    ? 'border-orange-500 text-orange-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: KIẾN THỨC & HỌC LIỆU */}
          {activeTab === 'content' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">
                    Tên chặng học tập: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Chặng 01: La bàn Dự án & Xác định Thách thức"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:border-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">
                    Tóm tắt mục tiêu chặng:
                  </label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="VD: Làm quen với tư duy thiết kế và tìm hiểu bài toán thực tế..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 focus:border-orange-500 outline-hidden"
                  />
                </div>
              </div>

              {/* 1.1 Nội dung Lý thuyết Cốt lõi */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>Nội dung Lý thuyết Cốt lõi (Theory Summary)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Hiển thị trong Learning Hub học sinh</span>
                </div>
                <textarea
                  rows={4}
                  value={theorySummary}
                  onChange={(e) => setTheorySummary(e.target.value)}
                  placeholder="Nhập phần tóm tắt lý thuyết, bối cảnh thực tế tại Hậu Giang, trọng tâm kiến thức của chặng..."
                  className="w-full p-3.5 rounded-xl border border-amber-200 bg-white font-medium text-slate-800 leading-relaxed focus:border-orange-500 outline-hidden"
                />
              </div>

              {/* 1.2 Khái niệm & Thuật ngữ Quan trọng */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Khái niệm & Thuật ngữ Quan trọng ({keyConcepts.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Giúp học sinh nắm vững các khái niệm trọng tâm</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddConcept}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition border border-indigo-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm khái niệm</span>
                  </button>
                </div>

                {keyConcepts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-500 font-medium">
                    Chưa có khái niệm nào. Bấm <strong>"+ Thêm khái niệm"</strong> để bổ sung thuật ngữ cho học sinh.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {keyConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            value={concept.term}
                            onChange={(e) => handleUpdateConcept(idx, 'term', e.target.value)}
                            placeholder="Tên thuật ngữ (VD: User Persona)"
                            className="font-extrabold text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden text-xs w-full sm:w-1/3"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteConcept(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Xóa khái niệm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={concept.definition}
                          onChange={(e) => handleUpdateConcept(idx, 'definition', e.target.value)}
                          placeholder="Định nghĩa khái niệm..."
                          className="w-full p-2.5 rounded-lg border border-slate-200 font-medium text-slate-700 focus:border-indigo-500 outline-hidden"
                        />

                        <input
                          type="text"
                          value={concept.example || ''}
                          onChange={(e) => handleUpdateConcept(idx, 'example', e.target.value)}
                          placeholder="Ví dụ minh họa thực tế (VD: Chân dung bác nông dân trồng khóm Cầu Đúc...)"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 italic focus:border-indigo-500 outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1.3 Quy trình / Hướng dẫn các bước */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                    <span>Quy trình & Các bước Thực hiện ({guidelines.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddGuideline}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm bước</span>
                  </button>
                </div>

                {guidelines.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-slate-50 text-slate-400">
                    Chưa có bước hướng dẫn nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {guidelines.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => handleUpdateGuideline(idx, e.target.value)}
                          placeholder="Mô tả bước thực hiện..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteGuideline(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1.4 Tài liệu & Liên kết ngoài */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Tài liệu & Video Tham khảo ({externalLinks.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm link</span>
                  </button>
                </div>

                {externalLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleUpdateLink(idx, 'title', e.target.value)}
                      placeholder="Tiêu đề tài liệu / video"
                      className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div>
                  <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" />
                    <span>Bộ thẻ Flashcard Ôn tập ({flashcards.length} thẻ)</span>
                  </h4>
                  <p className="text-[11px] text-amber-900/80">
                    Học sinh lật thẻ tương tác để củng cố thuật ngữ và kiến thức cốt lõi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFlashcard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-sm transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm thẻ mới</span>
                </button>
              </div>

              {flashcards.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                  <span className="text-3xl block">🃏</span>
                  <p className="text-sm font-bold text-slate-700">Chưa có flashcard nào cho chặng này.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thầy cô bấm "+ Thêm thẻ mới" để tạo các thẻ câu hỏi và câu trả lời tương tác.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddFlashcard}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold"
                  >
                    + Tạo thẻ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {flashcards.map((card, idx) => {
                    const isFlipped = previewFlippedCardId === card.id;
                    return (
                      <div
                        key={card.id || idx}
                        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={card.category || 'Khái niệm'}
                              onChange={(e) => handleUpdateFlashcard(idx, 'category', e.target.value)}
                              placeholder="Danh mục / Phân loại"
                              className="px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-bold text-slate-700 border-none outline-hidden"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewFlippedCardId(isFlipped ? null : card.id)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
                            >
                              <RotateCw className="w-3 h-3 text-orange-600" />
                              <span>{isFlipped ? 'Xem mặt trước' : 'Lật thử mặt sau'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateFlashcard(idx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                              title="Sao chép thẻ"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFlashcard(idx)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              title="Xóa thẻ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Front & Back editor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                              <span>Mặt trước (Câu hỏi / Thuật ngữ / Gợi nhớ):</span>
                            </label>
                            <textarea
                              rows={3}
                              value={card.front}
                              onChange={(e) => handleUpdateFlashcard(idx, 'front', e.target.value)}
                              placeholder="Nhập nội dung mặt trước..."
                              className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:border-orange-500 outline-hidden"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                              <span>Mặt sau (Câu trả lời / Định nghĩa / Giải thích):</span>
                            </label>
                            <textarea
                              rows={3}
                              value={card.back}
                              onChange={(e) => handleUpdateFlashcard(idx, 'back', e.target.value)}
                              placeholder="Nhập nội dung mặt sau..."
                              className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-orange-500 outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Interactive Flip Preview Banner */}
                        {isFlipped && (
                          <div className="p-3 bg-linear-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-200 text-slate-800 text-xs font-semibold animate-in fade-in">
                            <span className="font-bold text-orange-700">Mặt sau hiển thị: </span>
                            <span>{card.back}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GAME & CÂU HỎI */}
          {activeTab === 'game' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-orange-600" />
                      <span>Cấu hình Game Thử Thách & Bộ Câu Hỏi</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hệ thống tự động chấm điểm bài làm và tính XP theo quy tắc đã thiết lập.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Trắc nghiệm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('scenario')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Đúng/Sai</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Hướng dẫn làm bài:
                    </label>
                    <input
                      type="text"
                      value={gameInstructions}
                      onChange={(e) => setGameInstructions(e.target.value)}
                      placeholder="Hướng dẫn học sinh trước khi bắt đầu..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Thời lượng ước tính (phút):
                    </label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {questions.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                  <span className="text-3xl block">🎮</span>
                  <p className="text-sm font-bold text-slate-700">Chưa có câu hỏi nào trong game này.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thầy cô bấm <strong>"+ Thêm Trắc nghiệm"</strong> hoặc <strong>"+ Thêm Đúng/Sai"</strong> để tạo câu hỏi cho chặng.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4"
                    >
                      {/* Question Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                            C{qIdx + 1}
                          </span>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              handleUpdateQuestion(qIdx, {
                                type: e.target.value as any,
                                options:
                                  e.target.value === 'scenario'
                                    ? ['Đúng', 'Sai']
                                    : q.options || ['Phương án A', 'Phương án B'],
                                correctAnswer:
                                  e.target.value === 'scenario' ? 'Đúng' : q.options?.[0] || '',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                          >
                            <option value="multiple_choice">Trắc nghiệm 1 đáp án</option>
                            <option value="scenario">Đúng / Sai</option>
                            <option value="fill_blank">Điền từ khuyết</option>
                            <option value="crypto_puzzle">Giải mã / Câu đố logic</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(qIdx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                            title="Sao chép câu hỏi"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qIdx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Prompt */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Nội dung câu hỏi: <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={q.prompt}
                          onChange={(e) => handleUpdateQuestion(qIdx, { prompt: e.target.value })}
                          placeholder="Nhập nội dung câu hỏi hoặc tình huống thực tế..."
                          className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:border-orange-500 outline-hidden"
                        />
                      </div>

                      {/* Options & Correct Answer for Choices */}
                      {(q.type === 'multiple_choice' || q.type === 'scenario') && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-slate-700">
                              Các phương án lựa chọn (Chọn đáp án đúng bằng nút radio tròn):
                            </label>
                            {q.type === 'multiple_choice' && (
                              <button
                                type="button"
                                onClick={() => handleAddOption(qIdx)}
                                className="text-orange-600 font-bold hover:underline text-[11px]"
                              >
                                + Thêm phương án
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {(q.options || []).map((opt, optIdx) => {
                              const isCorrect = String(q.correctAnswer) === String(opt);
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                                    isCorrect
                                      ? 'border-emerald-400 bg-emerald-50/60'
                                      : 'border-slate-200 bg-slate-50/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${q.id || qIdx}`}
                                    checked={isCorrect}
                                    onChange={() =>
                                      handleUpdateQuestion(qIdx, { correctAnswer: opt })
                                    }
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                    title="Đặt làm đáp án đúng"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleUpdateOption(qIdx, optIdx, e.target.value)
                                    }
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-xs"
                                  />
                                  {isCorrect && (
                                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase px-2 py-0.5 rounded-md bg-emerald-100">
                                      Đáp án đúng
                                    </span>
                                  )}
                                  {q.type === 'multiple_choice' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOption(qIdx, optIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition"
                                      title="Xóa phương án này"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Fill blank or crypto puzzle */}
                      {(q.type === 'fill_blank' || q.type === 'crypto_puzzle') && (
                        <div className="space-y-2">
                          <label className="block text-[11px] font-extrabold text-slate-700">
                            Đáp án chính xác (Học sinh nhập đúng từ này):
                          </label>
                          <input
                            type="text"
                            value={String(q.correctAnswer || '')}
                            onChange={(e) =>
                              handleUpdateQuestion(qIdx, { correctAnswer: e.target.value })
                            }
                            placeholder="Nhập từ khóa chính xác..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono uppercase text-slate-900"
                          />
                        </div>
                      )}

                      {/* Explanation / Feedback */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Giải thích đáp án hoặc phản hồi sau khi trả lời:
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(qIdx, { explanation: e.target.value })
                          }
                          placeholder="Giải thích lý do câu này đúng để học sinh hiểu sâu hơn..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ĐIỂM XP & CHẤM ĐIỂM */}
          {activeTab === 'scoring' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-600" />
                  <span>Quy Tắc Tính Điểm & Cơ Chế Cộng XP</span>
                </h4>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Thiết lập điểm XP tối đa mà học sinh có thể đạt được khi hoàn thành chặng này và điều kiện vượt ngưỡng.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">
                      Điểm XP tối đa của chặng:
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={xpReward}
                      onChange={(e) => setXpReward(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-base font-black text-orange-600 focus:border-orange-500 outline-hidden"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Điểm thưởng cộng vào tổng XP của học sinh khi làm bài.
                    </p>
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1">
                      Ngưỡng tỷ lệ trả lời đúng để hoàn thành chặng:
                    </label>
                    <select
                      value={passThreshold}
                      onChange={(e) => setPassThreshold(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white font-bold text-slate-800 focus:border-orange-500 outline-hidden"
                    >
                      <option value={50}>Đúng trên 50% (&gt;50%) - Mặc định chuẩn</option>
                      <option value={60}>Đúng từ 60%</option>
                      <option value={70}>Đúng từ 70%</option>
                      <option value={80}>Đúng từ 80% (Thử thách nâng cao)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Học sinh phải đạt ngưỡng này mới được ghi nhận chặng hoàn thành.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block font-black text-slate-800 mb-1">
                    Cách quy đổi kết quả bài làm sang XP:
                  </label>
                  <select
                    value={gradingRule}
                    onChange={(e) => setGradingRule(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white font-semibold text-slate-800 focus:border-orange-500 outline-hidden"
                  >
                    <option value="proportional">
                      Quy đổi theo tỷ lệ phần trăm câu đúng (Ví dụ: đúng 80% nhận 80% của {xpReward} XP = {Math.round(xpReward * 0.8)} XP)
                    </option>
                    <option value="full_on_pass">
                      Nhận trọn vẹn 100% XP ({xpReward} XP) khi vượt ngưỡng đạt chặng
                    </option>
                  </select>
                </div>
              </div>

              {/* Retry & Repeated Submissions Rule Note */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600">
                <span className="font-bold text-slate-800">Quy tắc làm lại và bảo toàn XP:</span>
                <p className="text-[11px] leading-relaxed">
                  Khi học sinh làm lại chặng, hệ thống cập nhật kết quả cao nhất và lưu lịch sử từng lần làm bài. Điểm XP không cộng dồn vô hạn mà ghi nhận theo điểm cao nhất để bảo đảm công bằng trong bảng xếp hạng lớp 10A.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ĐIỀU KIỆN HOÀN THÀNH */}
          {activeTab === 'conditions' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <span>Điều Kiện Mở Khóa Chặng (Unlock Condition)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Loại hình mở khóa:
                    </label>
                    <select
                      value={unlockType}
                      onChange={(e) => setUnlockType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      <option value="code">Mật mã do giáo viên cấp (Code)</option>
                      <option value="prerequisite">Phải hoàn thành chặng trước đó</option>
                      <option value="both">Cả hai (Mật mã + Chặng trước)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mã mở khóa (Secret Unlock Code):
                    </label>
                    <input
                      type="text"
                      value={unlockCode}
                      onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                      placeholder="VD: QUEST-10A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase text-slate-900 focus:border-orange-500 outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Chỉ giáo viên biết mã này; học sinh cần nhập đúng mã mới mở chặng.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hạn chót hoàn thành (Deadline):</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-sans text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số lần làm lại tối đa:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: XEM TRƯỚC & XUẤT BẢN */}
          {activeTab === 'preview' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-600" />
                  <span>Trạng Thái Xuất Bản Chặng</span>
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {status === 'published' ? '🟢 Đã Công Bố (Published)' : '🟡 Bản Nháp (Draft)'}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {status === 'published'
                          ? 'Chặng đang xuất hiện trong Bản đồ hành trình học tập của học sinh lớp 10A.'
                          : 'Chặng đang ở chế độ riêng tư, chỉ giáo viên thấy để chuẩn bị nội dung.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('draft');
                          handleSave(false);
                        }}
                        className={`px-4 py-2 rounded-xl font-bold transition ${
                          status === 'draft'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Lưu bản nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('published');
                          handleSave(true);
                        }}
                        className={`px-4 py-2 rounded-xl font-bold transition ${
                          status === 'published'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        Xuất bản ngay
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200">
                    <span className="text-xl font-black text-orange-600">{xpReward} XP</span>
                    <span className="block text-[10px] text-orange-800 font-bold mt-0.5">Phần thưởng tối đa</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                    <span className="text-xl font-black text-indigo-600">{keyConcepts.length}</span>
                    <span className="block text-[10px] text-indigo-800 font-bold mt-0.5">Thuật ngữ cốt lõi</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-xl font-black text-amber-700">{flashcards.length}</span>
                    <span className="block text-[10px] text-amber-900 font-bold mt-0.5">Thẻ Flashcard</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xl font-black text-emerald-700">{questions.length}</span>
                    <span className="block text-[10px] text-emerald-900 font-bold mt-0.5">Câu hỏi thử thách</span>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="pt-2">
                  <h5 className="font-extrabold text-slate-700 mb-2">Xem trước thẻ chặng trên Bản đồ:</h5>
                  <div className="p-5 rounded-2xl border-2 border-orange-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{title || 'Tên chặng'}</span>
                      <span className="font-black text-orange-600">+{xpReward} XP</span>
                    </div>
                    <p className="text-slate-500 text-xs">{summary || 'Tóm tắt nội dung...'}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                        MÃ: {unlockCode || 'CHƯA ĐẶT'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        Ngưỡng đạt: &gt;{passThreshold}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            💡 Thầy cô có thể lưu từng phần hoặc chuyển tab thoải mái mà không bị mất dữ liệu.
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi Chặng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
