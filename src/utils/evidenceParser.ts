// Project X | Learning Quest - Evidence Link Parser & Inline Preview Engine
export type EvidencePlatformType =
  | 'google_docs'
  | 'google_sheets'
  | 'google_slides'
  | 'google_drive'
  | 'youtube'
  | 'image'
  | 'generic';

export interface ParsedEvidence {
  isValid: boolean;
  type: EvidencePlatformType;
  titleSuggestion: string;
  embedUrl: string | null;
  canEmbed: boolean;
  requiresExternalOpen: boolean;
  warningNote?: string;
}

export function parseEvidenceUrl(rawUrl: string): ParsedEvidence {
  const trimmed = (rawUrl || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      type: 'generic',
      titleSuggestion: '',
      embedUrl: null,
      canEmbed: false,
      requiresExternalOpen: true,
      warningNote: 'Vui lòng nhập đường dẫn liên kết.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      type: 'generic',
      titleSuggestion: '',
      embedUrl: null,
      canEmbed: false,
      requiresExternalOpen: true,
      warningNote: 'Đường dẫn không hợp lệ. Vui lòng kiểm tra định dạng URL (ví dụ: https://...).',
    };
  }

  // Only allow http and https protocols for safety
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      type: 'generic',
      titleSuggestion: '',
      embedUrl: null,
      canEmbed: false,
      requiresExternalOpen: true,
      warningNote: 'Chỉ chấp nhận giao thức an toàn https:// hoặc http://',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // 1. Google Docs (/edit or /view -> /preview)
  if (hostname.includes('docs.google.com') && pathname.includes('/document/')) {
    const docIdMatch = pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docIdMatch) {
      const docId = docIdMatch[1];
      return {
        isValid: true,
        type: 'google_docs',
        titleSuggestion: 'Tài liệu Google Docs - Báo cáo Project X',
        embedUrl: `https://docs.google.com/document/d/${docId}/preview`,
        canEmbed: true,
        requiresExternalOpen: false,
        warningNote: 'Đảm bảo tài liệu đã được đặt quyền "Bất kỳ ai có liên kết đều có thể xem" trong Google Drive.',
      };
    }
  }

  // 2. Google Sheets (/edit or /view -> /preview)
  if (hostname.includes('docs.google.com') && pathname.includes('/spreadsheets/')) {
    const sheetIdMatch = pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetIdMatch) {
      const sheetId = sheetIdMatch[1];
      return {
        isValid: true,
        type: 'google_sheets',
        titleSuggestion: 'Bảng tính Google Sheets - Kế hoạch & Dữ liệu',
        embedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview`,
        canEmbed: true,
        requiresExternalOpen: false,
        warningNote: 'Đảm bảo bảng tính đã được mở quyền xem cho người có liên kết.',
      };
    }
  }

  // 3. Google Slides (/edit or /view -> /preview)
  if (hostname.includes('docs.google.com') && pathname.includes('/presentation/')) {
    const slideIdMatch = pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slideIdMatch) {
      const slideId = slideIdMatch[1];
      return {
        isValid: true,
        type: 'google_slides',
        titleSuggestion: 'Bài thuyết trình Google Slides - Slide Báo cáo',
        embedUrl: `https://docs.google.com/presentation/d/${slideId}/preview`,
        canEmbed: true,
        requiresExternalOpen: false,
        warningNote: 'Bài thuyết trình sẵn sàng xem trực tiếp trên khung xem trước.',
      };
    }
  }

  // 4. Google Drive Generic File (PDF, Video, Docs, Images) /file/d/{id}/view -> /preview
  if (hostname.includes('drive.google.com')) {
    const fileIdMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || parsed.searchParams.get('id');
    const fileId = Array.isArray(fileIdMatch) ? fileIdMatch[1] : fileIdMatch;
    if (fileId) {
      return {
        isValid: true,
        type: 'google_drive',
        titleSuggestion: 'Tập tin lưu trữ Google Drive (PDF / Tài liệu / Video)',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        canEmbed: true,
        requiresExternalOpen: false,
        warningNote: 'Tập tin Google Drive nhúng trực tiếp qua /preview (yêu cầu quyền xem cho người có liên kết).',
      };
    }

    return {
      isValid: true,
      type: 'google_drive',
      titleSuggestion: 'Thư mục tài nguyên Google Drive',
      embedUrl: null,
      canEmbed: false,
      requiresExternalOpen: true,
      warningNote: 'Thư mục Google Drive nên được mở trong tab mới để xem toàn bộ danh sách tập tin.',
    };
  }

  // 5. YouTube Video
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    let videoId: string | null = null;
    if (hostname.includes('youtu.be')) {
      videoId = pathname.slice(1).split('?')[0];
    } else {
      videoId = parsed.searchParams.get('v');
      if (!videoId && pathname.includes('/embed/')) {
        videoId = pathname.split('/embed/')[1];
      }
    }

    if (videoId) {
      return {
        isValid: true,
        type: 'youtube',
        titleSuggestion: 'Video thuyết trình / Thử nghiệm Project X',
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        canEmbed: true,
        requiresExternalOpen: false,
      };
    }
  }

  // 6. Direct Image (png, jpg, jpeg, webp, gif, svg)
  const isImageFile = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(pathname);
  if (isImageFile) {
    return {
      isValid: true,
      type: 'image',
      titleSuggestion: 'Hình ảnh minh chứng thực tế',
      embedUrl: trimmed,
      canEmbed: true,
      requiresExternalOpen: false,
    };
  }

  // 7. Generic safe web link
  return {
    isValid: true,
    type: 'generic',
    titleSuggestion: `Tài liệu trực tuyến (${hostname})`,
    embedUrl: null,
    canEmbed: false,
    requiresExternalOpen: true,
    warningNote: 'Liên kết ngoài sẽ được mở an toàn trong thẻ trình duyệt mới.',
  };
}
