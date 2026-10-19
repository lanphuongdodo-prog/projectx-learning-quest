// Project X | Learning Quest - Inline Evidence Embed Card Component
import React from 'react';
import { EvidenceSubmission } from '../types/index.ts';
import { parseEvidenceUrl } from '../utils/evidenceParser.ts';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Presentation,
  FolderArchive,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceSubmission;
  showStudentName?: boolean;
  studentName?: string;
  onReview?: (evidence: EvidenceSubmission) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  showStudentName = false,
  studentName,
  onReview,
}) => {
  const parsed = parseEvidenceUrl(evidence.url);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow">
      {/* 1. Card Header: Icon, Title, Student Name, Timestamp & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
            {getPlatformIcon(parsed.type)}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-slate-900 leading-snug">
              {evidence.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {showStudentName && studentName && (
                <span className="font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  Học sinh: {studentName}
                </span>
              )}
              <span className="font-medium text-slate-600">
                {getPlatformLabel(parsed.type)}
              </span>
              <span>•</span>
              <span>
                {new Date(evidence.submittedAt).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {evidence.status === 'approved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã duyệt đạt {evidence.teacherScore ? `(${evidence.teacherScore}đ)` : ''}</span>
            </span>
          )}
          {evidence.status === 'needs_revision' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cần chỉnh sửa</span>
            </span>
          )}
          {evidence.status === 'submitted' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Chờ giáo viên duyệt</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Optional Student Description */}
      {evidence.description && (
        <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
          <span className="font-bold text-slate-500 block mb-0.5 text-[11px] uppercase tracking-wider">
            Ghi chú nộp bài của học sinh:
          </span>
          {evidence.description}
        </p>
      )}

      {/* 3. Teacher Feedback Box if reviewed */}
      {evidence.teacherFeedback && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-black text-orange-950">
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
            <span>Nhận xét đánh giá của Giáo viên Hướng dẫn:</span>
          </div>
          <p className="text-slate-800 font-medium pl-5">{evidence.teacherFeedback}</p>
        </div>
      )}

      {/* 4. INLINE EMBED (Khung nhúng trực tiếp ngay trong card, không qua popup) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
          <span className="flex items-center gap-1 text-slate-600">
            <Eye className="w-3.5 h-3.5 text-orange-500" />
            <span>Xem trực tiếp sản phẩm / minh chứng:</span>
          </span>
          <span className="text-[10px] text-slate-400">Cuộn xem nội dung trong khung</span>
        </div>

        <div className="relative w-full rounded-[8px] overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
          {parsed.canEmbed && parsed.embedUrl ? (
            parsed.type === 'image' ? (
              <div className="w-full h-[380px] flex items-center justify-center p-2 bg-slate-900/5">
                <img
                  src={parsed.embedUrl}
                  alt={evidence.title}
                  className="max-h-full max-w-full object-contain rounded-[8px]"
                  loading="lazy"
                />
              </div>
            ) : (
              <iframe
                src={parsed.embedUrl}
                title={evidence.title}
                className="w-full h-[380px] bg-white border-0"
                style={{ borderRadius: '8px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-[180px] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-orange-600 flex items-center justify-center mb-2">
                <ExternalLink className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 mb-1">
                Liên kết không hỗ trợ nhúng trực tiếp hoặc là thư mục chia sẻ
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mb-3">
                Bạn có thể nhấn vào nút "Mở liên kết trong tab mới" bên dưới để xem toàn bộ tài liệu.
              </p>
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition shadow-sm"
              >
                <span>Mở tài liệu ngoài</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer: Link URL and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] truncate max-w-md">
          <LinkIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{evidence.url}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onReview && (
            <button
              type="button"
              onClick={() => onReview(evidence)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-extrabold text-xs hover:bg-orange-100 transition border border-orange-200"
            >
              Chấm điểm & Nhận xét
            </button>
          )}

          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs"
            title="Mở liên kết gốc trong tab mới"
          >
            <span>Mở tab mới</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

function getPlatformIcon(type: string) {
  switch (type) {
    case 'google_docs':
      return <FileText className="w-5 h-5 text-blue-600" />;
    case 'google_sheets':
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    case 'google_slides':
      return <Presentation className="w-5 h-5 text-amber-600" />;
    case 'google_drive':
      return <FolderArchive className="w-5 h-5 text-sky-600" />;
    case 'youtube':
      return <Video className="w-5 h-5 text-red-600" />;
    case 'image':
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    default:
      return <LinkIcon className="w-5 h-5 text-slate-600" />;
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
      return 'Google Drive (PDF/File)';
    case 'youtube':
      return 'Video YouTube';
    case 'image':
      return 'Hình ảnh';
    default:
      return 'Liên kết ngoài';
  }
}
