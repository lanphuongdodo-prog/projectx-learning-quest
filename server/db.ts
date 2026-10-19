// Project X | Learning Quest - Persistent JSON Data Store with Auto-seed & Backups
import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  Stage,
  StudentProgress,
  EvidenceSubmission,
  TeacherFeedback,
  PortfolioData,
  NotificationItem,
  FlashcardReviewState,
} from '../src/types/index.ts';
import { hashPassword } from '../src/utils/security.ts';

export interface DatabaseSchema {
  users: User[];
  stages: Stage[];
  progress: Record<string, Record<string, StudentProgress>>; // studentId -> { questId -> StudentProgress }
  evidence: EvidenceSubmission[];
  feedback: TeacherFeedback[];
  portfolios: Record<string, PortfolioData>; // studentId -> PortfolioData
  notifications: NotificationItem[];
  flashcardProgress: Record<string, Record<string, FlashcardReviewState>>; // studentId -> { cardId -> FlashcardReviewState }
  lastUpdated: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const BACKUP_FILE = path.join(DATA_DIR, 'db.backup.json');

// Official Student List of Class 10A from School
const OFFICIAL_10A_ROSTER = [
  { mshs: 'FHG30070', name: 'Lê Văn Quốc An', avatar: '🦊' },
  { mshs: 'FHG30077', name: 'Ngô Quốc An', avatar: '🦁' },
  { mshs: 'FHG30063', name: 'Nguyễn Khánh Băng', avatar: '🐼' },
  { mshs: 'FHG30073', name: 'Đồng Gia Bảo', avatar: '🦄' },
  { mshs: 'FHG30074', name: 'Nguyễn Ngọc Châu', avatar: '🐱' },
  { mshs: 'FHG30054', name: 'Hồ Mạnh Đoàn', avatar: '🐯' },
  { mshs: 'FHG30060', name: 'Phùng Hiểu Đông', avatar: '🐨' },
  { mshs: 'FHG30069', name: 'Đào Nhựt Duy', avatar: '🐵' },
  { mshs: 'FHG30058', name: 'Trần Thị Minh Hân', avatar: '🐰' },
  { mshs: 'FHG30094', name: 'Đặng Gia Hân', avatar: '🦊' },
  { mshs: 'FHG30089', name: 'Lê Vĩnh Khang', avatar: '🐻' },
  { mshs: 'FHG30056', name: 'Nguyễn Đăng Khôi', avatar: '🐸' },
  { mshs: 'FHG30099', name: 'Đỗ Thanh Lộc', avatar: '🐹' },
  { mshs: 'FHG30102', name: 'Nguyễn Gia Minh', avatar: '🦝' },
  { mshs: 'FHG30097', name: 'Lê Tuyết Mỵ', avatar: '🦋' },
  { mshs: 'FHG30075', name: 'Nguyễn Ngọc Ngân', avatar: '🌸' },
  { mshs: 'FHG30080', name: 'Lê Quang Nghị', avatar: '🚀' },
  { mshs: 'FHG30086', name: 'Nguyễn Huỳnh Hoàng Nhân', avatar: '🐬' },
  { mshs: 'FHG30107', name: 'Lý Quốc Nhân', avatar: '🦅' },
  { mshs: 'FHG30067', name: 'Mã Kim Oanh', avatar: '🦚' },
  { mshs: 'FHG30064', name: 'Nguyễn Thanh Phúc', avatar: '🦉' },
  { mshs: 'FHG30053', name: 'Nguyễn Kim Phụng', avatar: '🌻' },
  { mshs: 'FHG30095', name: 'Trang Hữu Tấn', avatar: '🦔' },
  { mshs: 'FHG30061', name: 'Trần Hồng Thắm', avatar: '🌷' },
  { mshs: 'FHG30098', name: 'Trần Phước Thịnh', avatar: '🦭' },
  { mshs: 'FHG30071', name: 'Trần Nguyễn Minh Triết', avatar: '🐺' },
  { mshs: 'FHG30068', name: 'Trương Hiếu Trọng', avatar: '🐆' },
  { mshs: 'FHG30105', name: 'Nguyễn Tuấn', avatar: '🐘' },
  { mshs: 'FHG30084', name: 'Võ Lê Tường Vy', avatar: '🌺' },
  { mshs: 'FHG30091', name: 'Nguyễn Thị Thảo Vy', avatar: '🌼' },
  { mshs: 'FHG30100', name: 'Huỳnh Tấn Xuyên', avatar: '🦘' },
  { mshs: 'FHG30108', name: 'Lê Tấn Lộc', avatar: '🐝' },
];

function generateSeedData(): DatabaseSchema {
  // Hash teacher password "#PdpProX1" securely
  const teacherCreds = hashPassword('#PdpProX1');

  const users: User[] = [
    // Teacher Account (adminpdp / #PdpProX1)
    {
      id: 'teacher-01',
      role: 'teacher',
      displayName: 'Ban Điều Phối Project X (Cô Đỗ Lan Phương)',
      avatar: '👩‍🏫',
      username: 'adminpdp',
      passwordHash: teacherCreds.hash,
      salt: teacherCreds.salt,
      title: 'Giáo viên Chủ nhiệm & Hướng dẫn Project X 10A',
    },
    // 32 Official Grade 10A Students
    ...OFFICIAL_10A_ROSTER.map((stu, idx) => ({
      id: `student-${stu.mshs}`,
      role: 'student' as const,
      displayName: stu.name,
      studentId: stu.mshs,
      className: '10A',
      school: 'Trường Tiểu học, THCS & THPT FPT Hậu Giang',
      avatar: stu.avatar,
      xp: idx === 0 ? 350 : idx === 1 ? 280 : 0,
      level: idx === 0 ? 3 : idx === 1 ? 2 : 1,
      streak: idx === 0 ? 5 : idx === 1 ? 3 : 1,
    })),
  ];

  const nowIso = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  const stages: Stage[] = [
    {
      id: 'stage-1',
      title: 'Giai đoạn 1: Khởi động & Thấu cảm vấn đề (Empathize)',
      description: 'Bước đầu tiên trong hành trình Project X: Khám phá bối cảnh thực tế tại Hậu Giang, thấu cảm người dùng và giải mã nhu cầu cốt lõi.',
      order: 1,
      icon: '🧭',
      colorTheme: 'orange',
      isPublished: true,
      leaderboardPublished: true,
      quests: [
        {
          id: 'quest-1-1',
          stageId: 'stage-1',
          title: 'Chặng 01: La bàn Dự án & Xác định Thách thức',
          summary: 'Làm quen với tư duy thiết kế (Design Thinking) và lựa chọn chủ đề phát triển cho cộng đồng địa phương.',
          storyline: 'Chào mừng bạn đến với Học viện Project X 10A! Chuyến hải trình khởi đầu với tấm bản đồ thấu cảm: hãy quan sát và xác định vấn đề nóng hổi tại địa phương cần được giải quyết.',
          order: 1,
          xpReward: 100, // Teacher configurable
          isDemoContent: true,
          unlockType: 'code',
          unlockCode: 'FPT-X01',
          deadline: nextWeek,
          durationMinutes: 45,
          maxAttempts: 3,
          badgeReward: {
            id: 'first_quest',
            name: 'Bước chân đầu tiên',
            icon: '🚀',
            description: 'Hoàn thành chặng khởi đầu của Project X',
          },
          learningHub: {
            theorySummary: '[NỘI DUNG DEMO] Tư duy Thiết kế (Design Thinking) là phương pháp giải quyết vấn đề lấy con người làm trung tâm. Quy trình gồm 5 giai đoạn: Thấu cảm (Empathize), Xác định vấn đề (Define), Lên ý tưởng (Ideate), Tạo mẫu thử (Prototype), và Thử nghiệm (Test).',
            keyConcepts: [
              {
                term: 'Thấu cảm (Empathize)',
                definition: 'Đặt mình vào góc nhìn của người dùng thực tế để thấu hiểu cảm xúc, khó khăn và mong đợi của họ.',
                example: 'Phỏng vấn các cô chú nông dân trồng khóm Cầu Đúc để hiểu khó khăn trong bảo quản nông sản.',
              },
              {
                term: 'Góc nhìn người dùng (User Insight)',
                definition: 'Sự thật ngầm hiểu sâu sắc về động lực hoặc rào cản tiềm ẩn của người dùng mà họ chưa tự nói ra.',
                example: 'Người dùng không chỉ cần giá rẻ mà cần sự yên tâm về độ tươi sạch và minh bạch nguồn gốc.',
              },
              {
                term: 'Câu hỏi kích hoạt (HMW - How Might We)',
                definition: 'Cú pháp câu hỏi mở gợi mở ý tưởng sáng tạo: "Làm thế nào chúng ta có thể...?"',
                example: 'Làm thế nào chúng ta có thể giúp học sinh THPT Hậu Giang tái chế vỏ trấu thành bao bì thân thiện?',
              },
            ],
            guidelines: [
              '1. Luôn lắng nghe không phán xét khi thực hiện phỏng vấn.',
              '2. Ghi chép chính xác từ ngữ và biểu cảm thật của người đối thoại.',
              '3. Tách biệt giữa hiện tượng bề nổi và nguyên nhân gốc rễ.',
            ],
            externalLinks: [
              {
                title: 'Tài liệu hướng dẫn Design Thinking cho THPT (FPT Edu)',
                url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
              },
            ],
            flashcards: [
              {
                id: 'fc-1-1',
                front: 'Bước đầu tiên trong quy trình Design Thinking là gì?',
                back: 'Thấu cảm (Empathize) - Lắng nghe và quan sát để hiểu sâu sắc người dùng.',
                hint: 'Bắt đầu bằng chữ T hoặc E',
                category: 'Quy trình',
              },
              {
                id: 'fc-1-2',
                front: 'Ý nghĩa của câu hỏi "How Might We" (HMW)?',
                back: 'Chuyển hóa thách thức thành cơ hội giải pháp sáng tạo đầy cảm hứng.',
                hint: 'Làm thế nào chúng ta có thể...',
                category: 'Công cụ',
              },
              {
                id: 'fc-1-3',
                front: 'Empathy Map gồm 4 ô thông tin nào?',
                back: 'Nói (Says), Nghĩ (Thinks), Làm (Does), và Cảm thấy (Feels).',
                hint: '4 hành vi & cảm xúc của con người',
                category: 'Phương pháp',
              },
              {
                id: 'fc-1-4',
                front: 'Mục tiêu chính của môn học Project X tại FPT Hậu Giang là gì?',
                back: 'Phát triển năng lực tự học, làm việc nhóm, tư duy giải quyết vấn đề thực tế và kiến tạo sản phẩm có ích.',
                hint: 'Học qua trải nghiệm dự án',
                category: 'Project X',
              },
            ],
          },
          interactiveGame: {
            type: 'multiple_choice',
            instructions: 'Trả lời đúng trên 50% số câu hỏi (đúng từ 2/3 câu trở lên) để được công nhận hoàn thành chặng!',
            timeLimitSeconds: 600,
            questions: [
              {
                id: 'q1',
                prompt: '[NỘI DUNG DEMO] Thứ tự chuẩn của 5 bước trong mô hình Tư duy Thiết kế (Design Thinking) là gì?',
                type: 'multiple_choice',
                options: [
                  'A. Thấu cảm → Xác định → Lên ý tưởng → Mẫu thử → Thử nghiệm',
                  'B. Lên ý tưởng → Mẫu thử → Thấu cảm → Thử nghiệm → Xác định',
                  'C. Xác định → Lên ý tưởng → Thấu cảm → Mẫu thử → Đánh giá',
                  'D. Mẫu thử → Thử nghiệm → Xác định → Thấu cảm → Báo cáo',
                ],
                correctAnswer: 0,
                explanation: 'Quy trình bắt đầu từ Thấu cảm (Empathize) và kết thúc bằng Thử nghiệm (Test).',
              },
              {
                id: 'q2',
                prompt: '[NỘI DUNG DEMO] Trong phỏng vấn thấu cảm, điều nào sau đây là NÊN làm?',
                type: 'multiple_choice',
                options: [
                  'A. Hỏi câu hỏi đóng chỉ có thể trả lời Có/Không',
                  'B. Hỏi gợi ý sẵn câu trả lời để người phỏng vấn đồng ý nhanh',
                  'C. Lắng nghe chủ động, hỏi "Tại sao?" và khuyến khích họ kể lại câu chuyện thực tế',
                  'D. Tranh luận ngay nếu người phỏng vấn nói sai thông tin',
                ],
                correctAnswer: 2,
                explanation: 'Lắng nghe chân thành và hỏi "Tại sao?" giúp chạm đến insight sâu sắc của người dùng.',
              },
              {
                id: 'q3',
                prompt: '[NỘI DUNG DEMO] Đâu là cú pháp chuẩn của một câu hỏi HMW (How Might We)?',
                type: 'multiple_choice',
                options: [
                  'A. Tại sao mọi người không sử dụng ứng dụng này?',
                  'B. Làm thế nào chúng ta có thể giúp học sinh lớp 10A quản lý thời gian làm dự án hiệu quả hơn?',
                  'C. Dự án này bao giờ hoàn thành?',
                  'D. Bạn có thích ý tưởng của nhóm chúng tôi không?',
                ],
                correctAnswer: 1,
                explanation: 'Cú pháp HMW luôn mở ra tiềm năng giải pháp tích cực cho đối tượng mục tiêu cụ thể.',
              },
            ],
          },
          evidenceRequirement: {
            required: true,
            title: 'Biên bản Phỏng vấn Thấu cảm & Ảnh thực địa',
            description: 'Dán liên kết Google Docs chứa biên bản phỏng vấn hoặc Google Drive chứa ảnh thực tế.',
            allowedTypes: ['google_docs', 'google_drive', 'image'],
            rubricSummary: 'Đầy đủ thông tin đối tượng phỏng vấn, 5 câu hỏi mở và ghi chú insight cụ thể.',
          },
          recoveryConfig: {
            enabled: true,
            title: 'Nhiệm vụ Khôi phục Quyền: Ôn tập Thấu cảm',
            taskType: 'reflection',
            instructions: 'Nếu bị quá hạn, hãy viết đoạn phản tư ngắn (ít nhất 30 từ) về điều em học được khi lắng nghe người khác để được gia hạn 24 giờ.',
            minPassingScore: 70,
            extendedHours: 24,
            maxRecoveryAttempts: 2,
            requiresTeacherApproval: false,
          },
        },
        {
          id: 'quest-1-2',
          stageId: 'stage-1',
          title: 'Chặng 02: Giải mã Insight & Chân dung Đối tượng',
          summary: 'Tổng hợp dữ liệu phỏng vấn, lập Empathy Map và xác định "Nỗi đau" (Pain points) lớn nhất.',
          storyline: 'Sau khi thu thập dữ liệu từ thực địa, bạn đứng trước căn phòng mật mã của Insight. Hãy phân loại dữ liệu để tìm ra chìa khóa thấu cảm!',
          order: 2,
          xpReward: 150,
          isDemoContent: true,
          unlockType: 'code',
          unlockCode: 'INSIGHT2026',
          deadline: tomorrow,
          durationMinutes: 40,
          maxAttempts: 3,
          badgeReward: {
            id: 'crypto_cracker',
            name: 'Bậc thầy Mật mã',
            icon: '🧩',
            description: 'Giải mã thành công thử thách Insight Logic',
          },
          learningHub: {
            theorySummary: '[NỘI DUNG DEMO] Insight không chỉ là thông tin đơn thuần. Insight là nguyên nhân sâu xa đằng sau hành vi của người dùng. Để tìm ra Insight, ta đối chiếu giữa điều họ NÓI và điều họ THỰC SỰ LÀM.',
            keyConcepts: [
              {
                term: 'User Persona (Chân dung người dùng)',
                definition: 'Hồ sơ đại diện hư cấu nhưng dựa trên dữ liệu thật của nhóm đối tượng mục tiêu.',
                example: 'Bạn An - Học sinh lớp 10 FPT Hậu Giang, thích công nghệ nhưng hay bị áp lực deadline.',
              },
              {
                term: 'Pain Point (Nỗi đau)',
                definition: 'Trở ngại, sự thất vọng hoặc khó khăn mà người dùng đang phải chịu đựng.',
                example: 'Mất quá nhiều thời gian tổng hợp file và quên hạn nộp bài trên nhiều nhóm Zalo khác nhau.',
              },
            ],
            guidelines: [
              'Tập trung vào 1 nỗi đau nhức nhối nhất thay vì cố giải quyết 10 vấn đề nhỏ.',
            ],
            flashcards: [
              {
                id: 'fc-1-2-1',
                front: 'Phân biệt giữa Data (Dữ liệu) và Insight?',
                back: 'Data cho biết "Chuyện gì đang xảy ra" (What), còn Insight giải thích "Tại sao người dùng lại làm vậy" (Why).',
                hint: 'What vs Why',
                category: 'Insight',
              },
              {
                id: 'fc-1-2-2',
                front: 'Thành phần quan trọng nhất của User Persona là gì?',
                back: 'Mục tiêu (Goals), Động lực (Motivations) và Nỗi đau (Pain points).',
                hint: 'Điều họ muốn và điều cản trở họ',
                category: 'Persona',
              },
            ],
          },
          interactiveGame: {
            type: 'crypto_puzzle',
            instructions: 'Trả lời đúng trên 50% (đúng 2/2 câu đố) để hoàn thành chặng!',
            timeLimitSeconds: 300,
            questions: [
              {
                id: 'cp1',
                prompt: '[NỘI DUNG DEMO] MẬT MÃ INSIGHT: "Từ khóa 7 chữ cái tiếng Anh mô tả năng lực đặt mình vào hoàn cảnh của người khác, lắng nghe bằng cả trái tim."',
                type: 'crypto_puzzle',
                clue: 'Gợi ý: E _ P _ T _ Y',
                targetAnswer: 'EMPATHY',
                explanation: 'Chính xác! EMPATHY (Thấu cảm) là nền tảng cốt lõi của mọi sáng kiến trong Project X.',
              },
              {
                id: 'cp2',
                prompt: '[NỘI DUNG DEMO] TÌM TỪ KHÓA: "Thuật ngữ chỉ đối tượng đại diện hư cấu được xây dựng từ dữ liệu phỏng vấn người dùng thực tế."',
                type: 'crypto_puzzle',
                clue: 'Gợi ý: P E R _ O _ A (7 chữ cái)',
                targetAnswer: 'PERSONA',
                explanation: 'Chính xác! Persona giúp cả nhóm có chung một hình dung chân thực về người hưởng lợi.',
              },
            ],
          },
          evidenceRequirement: {
            required: true,
            title: 'Bản đồ Thấu cảm (Empathy Map) của nhóm',
            description: 'Dán liên kết Google Slides hoặc Google Drive chứa ảnh sơ đồ Empathy Map 4 góc của nhóm.',
            allowedTypes: ['google_slides', 'google_drive', 'image'],
            rubricSummary: 'Rõ ràng 4 phần: Says, Thinks, Does, Feels và tóm tắt 01 Insight then chốt.',
          },
          recoveryConfig: {
            enabled: true,
            title: 'Nhiệm vụ Khôi phục Quyền: Câu đố Bổ trợ 10A',
            taskType: 'quiz',
            instructions: 'Trả lời đúng 1 câu hỏi cốt lõi về Persona để khôi phục quyền làm bài trong 24 giờ tiếp theo.',
            minPassingScore: 100,
            extendedHours: 24,
            maxRecoveryAttempts: 2,
            requiresTeacherApproval: false,
          },
        },
      ],
    },
    {
      id: 'stage-2',
      title: 'Giai đoạn 2: Định nghĩa & Sáng tạo Ý tưởng (Define & Ideate)',
      description: 'Chuyển hóa góc nhìn thấu cảm thành tuyên bố vấn đề (Point of View) và bùng nổ ý tưởng đột phá.',
      order: 2,
      icon: '💡',
      colorTheme: 'emerald',
      isPublished: true,
      leaderboardPublished: false,
      quests: [
        {
          id: 'quest-2-1',
          stageId: 'stage-2',
          title: 'Chặng 03: Bản đồ Ý tưởng Điên rồ (Crazy 8s & SCAMPER)',
          summary: 'Thực hành các kỹ thuật bão não (Brainstorming) hiện đại để tìm ra 8 giải pháp độc đáo trong 8 phút.',
          storyline: 'Cánh cửa sáng tạo mở ra! Không có ý tưởng nào là ngớ ngẩn trong căn phòng bão não. Hãy giải phóng trí tưởng tượng của bạn.',
          order: 3,
          xpReward: 120,
          isDemoContent: true,
          unlockType: 'code',
          unlockCode: 'IDEATE-X',
          deadline: nextWeek,
          durationMinutes: 30,
          maxAttempts: 3,
          learningHub: {
            theorySummary: '[NỘI DUNG DEMO] Kỹ thuật Crazy 8s là phương pháp vẽ phác thảo 8 ý tưởng khác nhau trong 8 phút nhằm vượt qua rào cản sợ sai và thúc đẩy ý tưởng độc đáo.',
            keyConcepts: [
              {
                term: 'Crazy 8s',
                definition: 'Kỹ thuật gấp giấy làm 8 ô, dành đúng 1 phút cho mỗi ô để phác thảo ý tưởng giải quyết vấn đề.',
              },
              {
                term: 'SCAMPER',
                definition: 'Bộ công cụ biến đổi ý tưởng: Thay thế (Substitute), Kết hợp (Combine), Thích ứng (Adapt), Điều chỉnh (Modify), Sử dụng cho mục đích khác (Put to other uses), Loại bỏ (Eliminate), Đảo ngược (Reverse).',
              },
            ],
            guidelines: ['Ưu tiên số lượng ý tưởng trước, chất lượng đánh giá sau.'],
            flashcards: [
              {
                id: 'fc-2-1-1',
                front: 'Quy tắc vàng khi Brainstorming ý tưởng là gì?',
                back: 'Trì hoãn mọi sự phán xét (Defer judgment) và khuyến khích những ý tưởng táo bạo.',
                hint: 'Không chê bai ý kiến của bạn bè',
                category: 'Kỹ năng',
              },
            ],
          },
          interactiveGame: {
            type: 'multiple_choice',
            instructions: 'Lựa chọn phương án chuẩn xác nhất về kỹ thuật sáng tạo ý tưởng.',
            questions: [
              {
                id: 'q2_1',
                prompt: '[NỘI DUNG DEMO] Trong kỹ thuật SCAMPER, chữ "C" đại diện cho hành động nào?',
                type: 'multiple_choice',
                options: [
                  'A. Copy (Sao chép nguyên văn)',
                  'B. Combine (Kết hợp 2 hoặc nhiều yếu tố lại với nhau)',
                  'C. Cancel (Hủy bỏ dự án)',
                  'D. Create (Tạo ngẫu nhiên)',
                ],
                correctAnswer: 1,
                explanation: 'C = Combine (Kết hợp). Ví dụ: Kết hợp bảng phấn truyền thống với màn hình tương tác cảm ứng.',
              },
            ],
          },
          evidenceRequirement: {
            required: true,
            title: 'Ảnh chụp tờ giấy Crazy 8s của cả nhóm',
            description: 'Dán link Google Drive hoặc ảnh chụp rõ nét 8 ô phác thảo ý tưởng.',
            allowedTypes: ['google_drive', 'image'],
            rubricSummary: 'Đủ 8 ý tưởng khác nhau, có chú thích ngắn gọn.',
          },
          recoveryConfig: {
            enabled: true,
            title: 'Nhiệm vụ Khôi phục Quyền',
            taskType: 'reflection',
            instructions: 'Viết 1 ý tưởng cải tiến trường học FPT Hậu Giang bằng phương pháp Combine.',
            minPassingScore: 70,
            extendedHours: 24,
            maxRecoveryAttempts: 2,
            requiresTeacherApproval: false,
          },
        },
      ],
    },
    {
      id: 'stage-3',
      title: 'Giai đoạn 3: Chế tạo Mẫu & Thử nghiệm (Prototype & Test)',
      description: 'Biến ý tưởng thành sản phẩm mẫu thực tế có thể cầm nắm hoặc trải nghiệm trực tiếp.',
      order: 3,
      icon: '🛠️',
      colorTheme: 'sky',
      isPublished: true,
      leaderboardPublished: false,
      quests: [
        {
          id: 'quest-3-1',
          stageId: 'stage-3',
          title: 'Chặng 05: Xưởng Chế tác Nguyên mẫu (Low-Fi Prototype)',
          summary: 'Xây dựng mô hình giấy, storyboard hoặc bản wireframe thử nghiệm nhanh với chi phí thấp nhất.',
          storyline: 'Chào mừng đến Xưởng Sáng tạo! Hãy biến những dòng ý tưởng trên giấy thành sản phẩm đầu tiên người dùng có thể chạm vào.',
          order: 4,
          xpReward: 150,
          isDemoContent: true,
          unlockType: 'code',
          unlockCode: 'PROTO-FPT',
          deadline: nextWeek,
          durationMinutes: 45,
          maxAttempts: 3,
          learningHub: {
            theorySummary: '[NỘI DUNG DEMO] Nguyên mẫu nhanh (Rapid Prototyping) giúp nhóm nhận phản hồi sớm từ người dùng thực tế mà không tốn nhiều chi phí hay thời gian.',
            keyConcepts: [
              {
                term: 'Low-Fidelity Prototype',
                definition: 'Mẫu thử độ phân giải thấp (bìa carton, giấy vẽ, mô hình đất nặn, sơ đồ que).',
              },
            ],
            guidelines: ['Làm mẫu thử để học hỏi, không phải để khoe sự hoàn hảo.'],
            flashcards: [
              {
                id: 'fc-3-1-1',
                front: 'Châm ngôn nổi tiếng của nguyên mẫu thử nghiệm là gì?',
                back: '"Thất bại sớm để thành công nhanh hơn" (Fail early to succeed sooner).',
                hint: 'Học từ sai sót nhanh nhất',
                category: 'Tư duy',
              },
            ],
          },
          interactiveGame: {
            type: 'multiple_choice',
            instructions: 'Đánh giá các tình huống chế tác mô hình thử nghiệm.',
            questions: [
              {
                id: 'q3_1',
                prompt: '[NỘI DUNG DEMO] Mục đích lớn nhất của việc làm Low-Fi Prototype là gì?',
                type: 'multiple_choice',
                options: [
                  'A. Để đem bán ngay cho người tiêu dùng',
                  'B. Để kiểm tra tính khả thi và thu nhận phản hồi thực tế nhanh nhất với chi phí thấp nhất',
                  'C. Để đạt điểm tối đa môn thủ công mỹ thuật',
                  'D. Để trang trí lớp học',
                ],
                correctAnswer: 1,
                explanation: 'Low-Fi Prototype là công cụ đối thoại với người dùng để học hỏi và điều chỉnh.',
              },
            ],
          },
          recoveryConfig: {
            enabled: true,
            title: 'Khôi phục quyền Chế tác',
            taskType: 'quiz',
            instructions: 'Trả lời câu hỏi về nguyên mẫu để nhận thêm thời gian.',
            minPassingScore: 100,
            extendedHours: 24,
            maxRecoveryAttempts: 2,
            requiresTeacherApproval: false,
          },
        },
      ],
    },
    {
      id: 'stage-4',
      title: 'Giai đoạn 4: Báo cáo & Lan tỏa Giá trị (Pitch & Portfolio)',
      description: 'Hoàn thiện hồ sơ học tập (Learning Portfolio) và thuyết trình dự án trước hội đồng giám khảo.',
      order: 4,
      icon: '🏆',
      colorTheme: 'purple',
      isPublished: true,
      leaderboardPublished: false,
      quests: [
        {
          id: 'quest-4-1',
          stageId: 'stage-4',
          title: 'Chặng 07: Kỹ năng Thuyết trình Pitching & Kể chuyện',
          summary: 'Luyện tập kỹ năng kể chuyện (Storytelling) hấp dẫn để truyền cảm hứng về dự án trong 3 phút.',
          storyline: 'Sân khấu lớn đang chờ đón bạn! Hãy kể lại hành trình vượt khó và giá trị mà dự án mang lại cho quê hương Hậu Giang.',
          order: 5,
          xpReward: 200,
          isDemoContent: true,
          unlockType: 'code',
          unlockCode: 'PITCH-WIN',
          deadline: nextWeek,
          durationMinutes: 45,
          maxAttempts: 3,
          learningHub: {
            theorySummary: '[NỘI DUNG DEMO] Cấu trúc bài Pitching 3 phút: 1. Hook (Gây chú ý) → 2. Problem (Vấn đề) → 3. Solution (Giải pháp) → 4. Impact (Tác động) → 5. Call to action (Kêu gọi hành động).',
            keyConcepts: [
              {
                term: 'Elevator Pitch',
                definition: 'Bài giới thiệu súc tích, thuyết phục trong thời lượng ngắn tương đương đi thang máy (30 - 90 giây).',
              },
            ],
            guidelines: ['Tập trung vào cảm xúc và số liệu thực tế đã khảo sát.'],
            flashcards: [
              {
                id: 'fc-4-1-1',
                front: 'Mở đầu bài thuyết trình hiệu quả nhất là gì?',
                back: 'Một câu chuyện thật, một câu hỏi bất ngờ hoặc một con số thống kê giật mình.',
                hint: 'Hook gây tò mò',
                category: 'Thuyết trình',
              },
            ],
          },
          interactiveGame: {
            type: 'multiple_choice',
            instructions: 'Kiểm tra kỹ năng cấu trúc bài thuyết trình dự án.',
            questions: [
              {
                id: 'q4_1',
                prompt: '[NỘI DUNG DEMO] Thứ tự mạch lạc nhất của một bài thuyết trình Project X là gì?',
                type: 'multiple_choice',
                options: [
                  'A. Giới thiệu bản thân → Đọc thuộc slide → Cảm ơn',
                  'B. Câu chuyện mở màn (Hook) → Vấn đề thực tế → Giải pháp sáng tạo → Minh chứng hiệu quả → Kêu gọi chung tay',
                  'C. Chỉ chiếu video và không nói gì',
                  'D. Giải thích chi tiết mã nguồn kỹ thuật trước khi nói về người dùng',
                ],
                correctAnswer: 1,
                explanation: 'Mô hình Hook - Problem - Solution - Impact là công thức kinh điển chinh phục người nghe.',
              },
            ],
          },
          recoveryConfig: {
            enabled: true,
            title: 'Khôi phục quyền Thuyết trình',
            taskType: 'reflection',
            instructions: 'Viết câu mở đầu (Hook) ấn tượng của bạn cho bài thuyết trình.',
            minPassingScore: 70,
            extendedHours: 24,
            maxRecoveryAttempts: 2,
            requiresTeacherApproval: false,
          },
        },
      ],
    },
  ];

  // Initial student progress for Student 1 (Lê Văn Quốc An)
  const firstStudentId = 'student-FHG30070';
  const progress: Record<string, Record<string, StudentProgress>> = {
    [firstStudentId]: {
      'quest-1-1': {
        questId: 'quest-1-1',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        status: 'completed',
        score: 100,
        highestScore: 100,
        xpEarned: 100,
        highestXp: 100,
        completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        attemptsCount: 1,
        attemptsHistory: [
          {
            attemptNumber: 1,
            date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            correctCount: 3,
            totalQuestions: 3,
            scorePercent: 100,
            xpEarned: 100,
          },
        ],
        recoveryAttempts: 0,
      },
      'quest-1-2': {
        questId: 'quest-1-2',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'in_progress',
        attemptsCount: 0,
        recoveryAttempts: 0,
      },
    },
  };

  const evidence: EvidenceSubmission[] = [
    {
      id: 'evi-01',
      studentId: firstStudentId,
      questId: 'quest-1-1',
      url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      title: 'Biên bản Phỏng vấn Nông dân Hậu Giang về Nông sản',
      description: 'Nhóm đã phỏng vấn 3 bác nông dân tại xã Hỏa Tiến, thành phố Vị Thanh.',
      submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      detectedType: 'google_docs',
      embedUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview',
      status: 'approved',
      teacherFeedback: 'Biên bản ghi chép rất chi tiết, đặt câu hỏi gợi mở tốt. Đã xác nhận đạt yêu cầu chặng 01!',
      teacherScore: 95,
      reviewedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const feedback: TeacherFeedback[] = [
    {
      id: 'fb-01',
      studentId: firstStudentId,
      stageId: 'stage-1',
      teacherName: 'Cô Đỗ Lan Phương',
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      isDraft: false,
      generalNote: 'Quốc An đã thể hiện tinh thần dẫn dắt rất ấn tượng trong Giai đoạn 1. Em biết cách khích lệ các bạn trong nhóm và luôn chủ động phản tư sau mỗi buổi học.',
      strengths: [
        'Kỹ năng lắng nghe thấu cảm người dùng tốt',
        'Tư duy phân tích nguyên nhân gốc rễ sắc sảo',
        'Hoàn thành thử thách đúng tiến độ quy định',
      ],
      areasForGrowth: [
        'Nên tự tin chia sẻ góc nhìn nhiều hơn trong các buổi bão não ý tưởng nhóm',
      ],
      nextGoals: 'Tập trung sáng tạo ít nhất 3 giải pháp độc đáo trong Chặng Crazy 8s của Giai đoạn 2.',
      engagementRating: 5,
    },
  ];

  const portfolios: Record<string, PortfolioData> = {
    [firstStudentId]: {
      studentId: firstStudentId,
      template: 'journey',
      colorTheme: 'orange',
      bio: 'Học sinh lớp 10A FPT Hậu Giang, đam mê giải quyết các bài toán xã hội bằng công nghệ và tư duy đổi mới.',
      motto: 'Mỗi thách thức là một hạt mầm cho giải pháp đột phá!',
      selectedBadges: ['first_quest'],
      selectedEvidences: ['evi-01'],
      reflectionNotes: {
        learned: 'Em học được rằng trước khi vội vã đưa ra giải pháp, việc kiên nhẫn lắng nghe câu chuyện thật của người dùng là điều quan trọng nhất.',
        challenges: 'Lúc đầu phỏng vấn bác nông dân, em khá ngại ngùng nhưng khi chân thành lắng nghe, các bác đã chia sẻ rất nhiệt tình.',
        proudest: 'Cả nhóm đã cùng nhau hoàn thành bản đồ thấu cảm đầu tiên và được cô Phương khen ngợi.',
        futureGoal: 'Cùng nhóm chế tạo thành công một mô hình bao bì sinh học từ phụ phẩm nông nghiệp.',
      },
      stickers: [
        { id: 'stk-1', stickerKey: 'rocket', x: 82, y: 15, scale: 1.2, rotation: 12 },
        { id: 'stk-2', stickerKey: 'star', x: 12, y: 35, scale: 1.0, rotation: -8 },
      ],
      updatedAt: nowIso,
    },
  };

  const notifications: NotificationItem[] = [
    {
      id: 'notif-01',
      studentId: firstStudentId,
      questId: 'quest-1-2',
      type: 'deadline_24h',
      title: 'Nhắc nhở Thời hạn: Chặng 02',
      message: 'Bạn còn 24 giờ để hoàn thành Chặng 02: Giải mã Insight. Hãy quay lại hành trình và chinh phục thử thách nhé!',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      isRead: false,
    },
  ];

  const flashcardProgress: Record<string, Record<string, FlashcardReviewState>> = {
    [firstStudentId]: {
      'fc-1-1': { cardId: 'fc-1-1', state: 'mastered', updatedAt: nowIso },
      'fc-1-2': { cardId: 'fc-1-2', state: 'mastered', updatedAt: nowIso },
      'fc-1-3': { cardId: 'fc-1-3', state: 'need_review', updatedAt: nowIso },
      'fc-1-4': { cardId: 'fc-1-4', state: 'mastered', updatedAt: nowIso },
    },
  };

  return {
    users,
    stages,
    progress,
    evidence,
    feedback,
    portfolios,
    notifications,
    flashcardProgress,
    lastUpdated: nowIso,
  };
}

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = generateSeedData();
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure official 32 students are present
        const hasOfficialStudents = parsed.users && parsed.users.some((u: any) => u.studentId === 'FHG30070');
        if (hasOfficialStudents) {
          this.data = parsed;
          this.isLoaded = true;
          return;
        }
      }

      this.data = generateSeedData();
      this.save();
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading DB file, fallback to seed data:', err);
      this.data = generateSeedData();
      this.save();
    }
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.data.lastUpdated = new Date().toISOString();
      const content = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
      fs.writeFileSync(BACKUP_FILE, content, 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToDefault(): void {
    this.data = generateSeedData();
    this.save();
  }

  /**
   * Import or merge students from Excel/CSV roster without losing progress
   */
  public importStudents(roster: Array<{ mshs: string; name: string }>): {
    success: boolean;
    addedCount: number;
    updatedCount: number;
    errors: string[];
  } {
    const errors: string[] = [];
    const seenMshs = new Set<string>();
    let addedCount = 0;
    let updatedCount = 0;

    const validated: Array<{ mshs: string; name: string }> = [];

    roster.forEach((item, idx) => {
      const cleanMshs = String(item.mshs || '').trim().toUpperCase();
      const cleanName = String(item.name || '').trim().replace(/\s+/g, ' ');

      if (!cleanMshs || !cleanName) {
        errors.push(`Dòng ${idx + 1}: Thiếu MSHS hoặc Họ và tên.`);
        return;
      }

      if (seenMshs.has(cleanMshs)) {
        errors.push(`Dòng ${idx + 1}: Trùng lặp MSHS "${cleanMshs}".`);
        return;
      }
      seenMshs.add(cleanMshs);
      validated.push({ mshs: cleanMshs, name: cleanName });
    });

    if (errors.length > 0) {
      return { success: false, addedCount: 0, updatedCount: 0, errors };
    }

    const avatars = ['🦊', '🦁', '🐼', '🦄', '🐱', '🐯', '🐨', '🐵', '🐰', '🐻', '🐸', '🐹', '🦝', '🦋', '🌸', '🚀'];

    validated.forEach((item, idx) => {
      const existingUser = this.data.users.find(
        (u) => u.role === 'student' && u.studentId?.toUpperCase() === item.mshs
      );

      if (existingUser) {
        // Update name, preserve id, xp, progress
        existingUser.displayName = item.name;
        updatedCount++;
      } else {
        // Add new student
        const newStudent: User = {
          id: `student-${item.mshs}`,
          role: 'student',
          displayName: item.name,
          studentId: item.mshs,
          className: '10A',
          school: 'Trường Tiểu học, THCS & THPT FPT Hậu Giang',
          avatar: avatars[idx % avatars.length],
          xp: 0,
          level: 1,
          streak: 1,
        };
        this.data.users.push(newStudent);
        addedCount++;
      }
    });

    this.save();
    return { success: true, addedCount, updatedCount, errors: [] };
  }
}

export const db = new Database();
