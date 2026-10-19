// Project X | Learning Quest - Excel / CSV Student Roster Parser & Validator
import * as XLSX from 'xlsx';

export interface ParsedStudentRow {
  rowIndex: number;
  mshs: string;
  name: string;
  status: 'valid' | 'duplicate_mshs' | 'missing_data';
  errorMessage?: string;
}

export interface ExcelParseResult {
  success: boolean;
  students: Array<{ mshs: string; name: string }>;
  allRows: ParsedStudentRow[];
  totalRows: number;
  validCount: number;
  errorCount: number;
  errors: string[];
  detectedColumns: {
    mshsCol: string;
    nameCol: string;
  };
}

function normalizeHeader(header: string): string {
  return String(header || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into a verified student roster
 */
export async function parseStudentExcelFile(file: File): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, cellText: false });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    return {
      success: false,
      students: [],
      allRows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      errors: ['Tập tin Excel không có trang tính (sheet) nào.'],
      detectedColumns: { mshsCol: '', nameCol: '' },
    };
  }

  // Use the first worksheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to raw rows (2D array)
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
  });

  if (rawData.length === 0) {
    return {
      success: false,
      students: [],
      allRows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      errors: ['Tập tin Excel trống hoặc không có dữ liệu.'],
      detectedColumns: { mshsCol: '', nameCol: '' },
    };
  }

  // Find header row: examine first 5 rows to locate header matching MSHS and Name
  let headerRowIndex = -1;
  let mshsColIndex = -1;
  let nameColIndex = -1;
  let lastNameColIndex = -1; // for split 'Họ và tên đệm'
  let firstNameColIndex = -1; // for split 'Tên'
  let detectedMshsName = '';
  let detectedFullName = '';

  for (let r = 0; r < Math.min(rawData.length, 10); r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;

    let foundMshs = -1;
    let foundName = -1;
    let foundLastName = -1;
    let foundFirstName = -1;

    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || '').trim();
      const norm = normalizeHeader(cellVal);

      // Check MSHS column variations
      if (
        norm === 'mshs' ||
        norm === 'maso' ||
        norm === 'mahocsinh' ||
        norm === 'mahs' ||
        norm === 'masv' ||
        norm === 'studentid' ||
        norm === 'code' ||
        norm === 'id'
      ) {
        foundMshs = c;
        detectedMshsName = cellVal;
      }

      // Check Full Name column variations
      if (
        norm === 'hovaten' ||
        norm === 'hoten' ||
        norm === 'tenhocsinh' ||
        norm === 'fullname' ||
        norm === 'hovatendaydu'
      ) {
        foundName = c;
        detectedFullName = cellVal;
      }

      // Check split name columns (Họ và tên đệm / Tên)
      if (norm === 'ho' || norm === 'hovattendem' || norm === 'hovatendem' || norm === 'hodem') {
        foundLastName = c;
      }
      if (norm === 'ten' || norm === 'firstname') {
        foundFirstName = c;
      }
    }

    if (foundMshs !== -1 && (foundName !== -1 || (foundLastName !== -1 && foundFirstName !== -1))) {
      headerRowIndex = r;
      mshsColIndex = foundMshs;
      nameColIndex = foundName;
      lastNameColIndex = foundLastName;
      firstNameColIndex = foundFirstName;
      break;
    }
  }

  if (headerRowIndex === -1) {
    return {
      success: false,
      students: [],
      allRows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      errors: [
        'Không tìm thấy tiêu đề cột hợp lệ trong file Excel. Vui lòng đảm bảo file có cột chứa "MSHS" (hoặc Mã học sinh) và "Họ và tên" (hoặc Họ tên đầy đủ).',
      ],
      detectedColumns: { mshsCol: '', nameCol: '' },
    };
  }

  const allRows: ParsedStudentRow[] = [];
  const validStudents: Array<{ mshs: string; name: string }> = [];
  const errors: string[] = [];
  const seenMshs = new Map<string, number>();

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;

    // Preserve MSHS as raw string - prevents dropping leading zeros
    const rawMshsVal = row[mshsColIndex];
    const mshs = String(rawMshsVal ?? '').trim().toUpperCase();

    // Get name (either from full name col or merged last+first)
    let name = '';
    if (nameColIndex !== -1) {
      name = String(row[nameColIndex] ?? '').trim().replace(/\s+/g, ' ');
    } else if (lastNameColIndex !== -1 && firstNameColIndex !== -1) {
      const last = String(row[lastNameColIndex] ?? '').trim();
      const first = String(row[firstNameColIndex] ?? '').trim();
      name = `${last} ${first}`.trim().replace(/\s+/g, ' ');
    }

    // Skip empty row at end of sheet
    if (!mshs && !name) {
      continue;
    }

    const fileRowNumber = r + 1;

    // Check missing fields
    if (!mshs || !name) {
      const err = `Dòng ${fileRowNumber}: ${!mshs ? 'Thiếu MSHS. ' : ''}${!name ? 'Thiếu Họ và tên.' : ''}`;
      errors.push(err);
      allRows.push({
        rowIndex: fileRowNumber,
        mshs: mshs || '(Trống)',
        name: name || '(Trống)',
        status: 'missing_data',
        errorMessage: err,
      });
      continue;
    }

    // Check duplicate MSHS within file
    if (seenMshs.has(mshs)) {
      const firstRow = seenMshs.get(mshs)!;
      const err = `Dòng ${fileRowNumber}: Trùng lặp MSHS "${mshs}" (đã xuất hiện ở dòng ${firstRow}).`;
      errors.push(err);
      allRows.push({
        rowIndex: fileRowNumber,
        mshs,
        name,
        status: 'duplicate_mshs',
        errorMessage: err,
      });
      continue;
    }

    seenMshs.set(mshs, fileRowNumber);
    validStudents.push({ mshs, name });
    allRows.push({
      rowIndex: fileRowNumber,
      mshs,
      name,
      status: 'valid',
    });
  }

  if (validStudents.length === 0 && errors.length === 0) {
    return {
      success: false,
      students: [],
      allRows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 1,
      errors: ['Không có dòng dữ liệu học sinh nào trong file.'],
      detectedColumns: {
        mshsCol: detectedMshsName || 'MSHS',
        nameCol: detectedFullName || 'Họ và tên',
      },
    };
  }

  return {
    success: errors.length === 0,
    students: validStudents,
    allRows,
    totalRows: allRows.length,
    validCount: validStudents.length,
    errorCount: errors.length,
    errors,
    detectedColumns: {
      mshsCol: detectedMshsName || 'MSHS',
      nameCol: detectedFullName || 'Họ và tên',
    },
  };
}

/**
 * Generates and downloads a sample Excel template for student roster
 */
export function downloadSampleExcelTemplate(): void {
  const wsData = [
    ['MSHS', 'Họ và tên đầy đủ', 'Ghi chú'],
    ['FHG30070', 'Lê Văn Quốc An', 'Lớp 10A'],
    ['FHG30077', 'Ngô Quốc An', 'Lớp 10A'],
    ['FHG30063', 'Nguyễn Khánh Băng', 'Lớp 10A'],
    ['FHG30073', 'Đồng Gia Bảo', 'Lớp 10A'],
    ['FHG30074', 'Nguyễn Ngọc Châu', 'Lớp 10A'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh10A');
  XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_ProjectX.xlsx');
}
