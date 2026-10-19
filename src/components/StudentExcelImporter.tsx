// Project X | Learning Quest - Excel / CSV Student Roster Importer
import React, { useState, useRef } from 'react';
import {
  parseStudentExcelFile,
  downloadSampleExcelTemplate,
  ExcelParseResult,
} from '../utils/excelParser.ts';
import { api } from '../services/api.ts';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

interface StudentExcelImporterProps {
  onSuccess: () => void;
  existingStudentIds?: string[];
}

export const StudentExcelImporter: React.FC<StudentExcelImporterProps> = ({
  onSuccess,
  existingStudentIds = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setParseResult(null);
    setServerError(null);
    setImportSuccessMsg(null);

    try {
      const result = await parseStudentExcelFile(file);
      setParseResult(result);
    } catch (err: any) {
      setServerError(`Không thể đọc file: ${err.message || 'Lỗi định dạng tập tin'}`);
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || !parseResult.success || parseResult.students.length === 0) return;

    setImporting(true);
    setServerError(null);
    try {
      const res = await api.importStudents(parseResult.students);
      setImportSuccessMsg(res.message);
      setParseResult(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
    } catch (err: any) {
      setServerError(err.message || 'Lỗi khi nhập dữ liệu vào cơ sở dữ liệu.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFileName(null);
    setParseResult(null);
    setServerError(null);
    setImportSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-md p-6 space-y-6">
      {/* Importer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Nhập Danh Sách Học Sinh Từ File Excel</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động nhận diện cột MSHS và Họ và tên, bảo toàn chuỗi mã và giữ nguyên tiến độ học tập của học sinh cũ.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleExcelTemplate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Tải file Excel mẫu</span>
        </button>
      </div>

      {/* Success Notification */}
      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
          <button onClick={() => setImportSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Server Error Notification */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Không thể nhập danh sách:</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* File Upload Drop Area */}
      {!parseResult && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-amber-300 hover:border-orange-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-6 text-center transition space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            {parsing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <div className="text-sm font-extrabold text-slate-800">
            {parsing ? 'Đang phân tích file Excel...' : 'Nhấp để chọn file Excel (.xlsx, .xls) hoặc CSV'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hỗ trợ file danh sách chứa cột MSHS (Mã số học sinh) và Họ và tên. Không giới hạn số lượng học sinh.
          </p>
        </div>
      )}

      {/* Parse Preview Result */}
      {parseResult && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 block">{fileName}</span>
                <span className="text-[11px] text-slate-500">
                  Cột nhận diện: MSHS → "{parseResult.detectedColumns.mshsCol}" | Họ tên → "{parseResult.detectedColumns.nameCol}"
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                ✓ {parseResult.validCount} học sinh hợp lệ
              </span>
              {parseResult.errorCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                  ⚠️ {parseResult.errorCount} lỗi
                </span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Hủy / Đổi file
              </button>
            </div>
          </div>

          {/* Validation Errors Box if any */}
          {parseResult.errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Phát hiện lỗi trong file Excel (Vui lòng kiểm tra lại trước khi nhập):</span>
              </div>
              <ul className="list-disc list-inside text-rose-800 space-y-0.5 max-h-36 overflow-y-auto pl-1">
                {parseResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Dòng</th>
                  <th className="px-4 py-2.5">MSHS</th>
                  <th className="px-4 py-2.5">Họ và Tên đầy đủ</th>
                  <th className="px-4 py-2.5">Trạng thái ghép nối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parseResult.allRows.map((row) => {
                  const isExisting = existingStudentIds.some(
                    (id) => id.toUpperCase() === row.mshs.toUpperCase()
                  );
                  return (
                    <tr
                      key={row.rowIndex}
                      className={
                        row.status !== 'valid'
                          ? 'bg-rose-50/70 text-rose-900'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="px-4 py-2 text-slate-400 font-mono text-[11px]">
                        #{row.rowIndex}
                      </td>
                      <td className="px-4 py-2 font-mono font-bold text-orange-700">
                        {row.mshs}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {row.name}
                      </td>
                      <td className="px-4 py-2">
                        {row.status === 'valid' ? (
                          isExisting ? (
                            <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              Đã có (Bảo lưu điểm & tiến độ)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              + Thêm học sinh mới
                            </span>
                          )
                        ) : (
                          <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {row.errorMessage || 'Lỗi dữ liệu'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!parseResult.success || parseResult.validCount === 0 || importing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {importing
                  ? 'Đang nhập vào hệ thống...'
                  : `Xác nhận Nhập ${parseResult.validCount} Học Sinh`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
