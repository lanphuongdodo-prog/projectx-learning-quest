// Project X | Learning Quest - "Minh chứng của tôi" (URL Evidence Submissions)
import React, { useState, useEffect } from 'react';
import { EvidenceSubmission, EvidenceRequirement } from '../types/index.ts';
import { parseEvidenceUrl, ParsedEvidence } from '../utils/evidenceParser.ts';
import { api } from '../services/api.ts';
import {
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Presentation,
  FolderArchive,
  Video,
  Image as ImageIcon,
  Sparkles,
  Send,
} from 'lucide-react';

interface EvidenceSectionProps {
  questId: string;
  requirement?: EvidenceRequirement;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ questId, requirement }) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceSubmission[]>([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewInfo, setPreviewInfo] = useState<ParsedEvidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEvidence = async () => {
    try {
      const res = await api.getEvidence(questId);
      setEvidenceList(res.evidence);
    } catch (err) {
      console.error('Error fetching evidence:', err);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [questId]);

  // Live URL validation & auto-detection as user types
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (!value.trim()) {
      setPreviewInfo(null);
      return;
    }

    const parsed = parseEvidenceUrl(value);
    setPreviewInfo(parsed);
    if (parsed.isValid && !title.trim() && parsed.titleSuggestion) {
      setTitle(parsed.titleSuggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Vui lòng dán liên kết sản phẩm minh chứng.');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng đặt tên/tiêu đề cho sản phẩm minh chứng.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.submitEvidence({
        questId,
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
      });

      setSuccess(res.message);
      setUrl('');
      setTitle('');
      setDescription('');
      setPreviewInfo(null);
      fetchEvidence();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu minh chứng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Requirement Guidelines Card */}
      {requirement && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-extrabold text-slate-800">
              Yêu cầu Minh chứng: {requirement.title}
            </h4>
          </div>
          <p className="text-xs text-slate-600 mb-2">{requirement.description}</p>
          <div className="text-[11px] font-semibold text-orange-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
            📌 Tiêu chí đánh giá (Rubric): {requirement.rubricSummary}
          </div>
        </div>
      )}

      {/* New Evidence Submission Form */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-6">
        <h4 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-orange-600" />
          <span>Nộp Minh chứng bằng Liên kết (Google Drive, Docs, Slides, Video...)</span>
        </h4>
        <p className="text-xs text-slate-500 mb-5">
          Hệ thống không lưu file trực tiếp để tiết kiệm dung lượng. Hãy chia sẻ link sản phẩm học tập từ Google Drive hoặc các nền tảng trực tuyến.
        </p>

        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dán đường dẫn minh chứng tại đây (URL): <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://docs.google.com/document/d/... hoặc https://drive.google.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm font-medium outline-hidden"
              required
            />
          </div>

          {/* Live Preview Box */}
          {previewInfo && previewInfo.isValid && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-800">
                  {getPlatformIcon(previewInfo.type)}
                  <span>Đã nhận diện: {getPlatformLabel(previewInfo.type)}</span>
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {previewInfo.warningNote && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚠️ {previewInfo.warningNote}
                </p>
              )}

              {/* Embedded Frame if embeddable */}
              {previewInfo.canEmbed && previewInfo.embedUrl && (
                <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-slate-300 bg-white">
                  {previewInfo.type === 'image' ? (
                    <img
                      src={previewInfo.embedUrl}
                      alt="Bản xem trước"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={previewInfo.embedUrl}
                      title="Bản xem trước minh chứng"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên / Tiêu đề sản phẩm: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Báo cáo phỏng vấn thấu cảm nhóm 2"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú / Mô tả ngắn gọn:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Sản phẩm gồm 3 biên bản phỏng vấn thực tế..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Xác nhận Nộp Minh chứng'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Evidences List */}
      <div className="space-y-4">
        <h4 className="text-base font-black text-slate-900">
          Danh sách Minh chứng đã nộp ({evidenceList.length})
        </h4>

        {evidenceList.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Bạn chưa nộp minh chứng nào cho chặng này. Hãy hoàn thành sản phẩm và dán link vào ô phía trên nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                      {getPlatformIcon(item.detectedType)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                      <p className="text-[11px] text-slate-500">
                        Nộp lúc: {new Date(item.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã duyệt đạt {item.teacherScore ? `(${item.teacherScore}đ)` : ''}</span>
                      </span>
                    )}
                    {item.status === 'needs_revision' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Cần chỉnh sửa</span>
                      </span>
                    )}
                    {item.status === 'submitted' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        <span>Đã gửi - Đang chờ GV duyệt</span>
                      </span>
                    )}
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {item.description}
                  </p>
                )}

                {/* Teacher review feedback if available */}
                {item.teacherFeedback && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                    <span className="font-extrabold text-orange-900 block mb-0.5">
                      💬 Nhận xét của Cô Đỗ Lan Phương:
                    </span>
                    <p className="text-slate-700">{item.teacherFeedback}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 truncate max-w-xs">{item.url}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 ml-2"
                  >
                    <span>Mở sản phẩm</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getPlatformIcon(type: string) {
  switch (type) {
    case 'google_docs':
      return <FileText className="w-4 h-4 text-blue-600" />;
    case 'google_sheets':
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    case 'google_slides':
      return <Presentation className="w-4 h-4 text-amber-600" />;
    case 'google_drive':
      return <FolderArchive className="w-4 h-4 text-sky-600" />;
    case 'youtube':
      return <Video className="w-4 h-4 text-red-600" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-purple-600" />;
    default:
      return <LinkIcon className="w-4 h-4 text-slate-600" />;
  }
}

function getPlatformLabel(type: string) {
  switch (type) {
    case 'google_docs':
      return 'Google Docs';
    case 'google_sheets':
      return 'Google Sheets';
    case 'google_slides':
      return 'Google Slides';
    case 'google_drive':
      return 'Google Drive';
    case 'youtube':
      return 'Video YouTube';
    case 'image':
      return 'Hình ảnh trực tiếp';
    default:
      return 'Liên kết ngoài';
  }
}
