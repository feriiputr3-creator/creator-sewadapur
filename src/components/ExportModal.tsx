import React from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Share2, 
  Printer, 
  Download, 
  X, 
  Check, 
  Copy
} from 'lucide-react';
import { RentalRecord, AppSettings } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: RentalRecord[];
  settings?: AppSettings;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onCopyWhatsApp: () => void;
  onPrintPDF: () => void;
  onExportJSON: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records = [],
  settings,
  onExportExcel,
  onExportCSV,
  onCopyWhatsApp,
  onPrintPDF,
  onExportJSON,
}) => {
  if (!isOpen) return null;

  const safeRecords = records || [];
  const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
  const grandTotal = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  return (
    <div 
      id="export-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        id="export-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Ekspor & Bagikan Laporan
              </h3>
              <p className="text-xs text-slate-300">
                Pilih format data yang ingin diunduh atau dibagikan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick summary of exported dataset */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Data siap ekspor: <strong className="text-slate-900">{records.length} Periode</strong> ({totalHari} Hari)
          </div>
          <div>
            Total: <strong className="text-emerald-700 font-bold">Rp {formatRupiah(grandTotal)}</strong>
          </div>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3">
          
          {/* Option 1: Microsoft Excel (.xlsx) */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                  Unduh File Excel (.xlsx)
                </h4>
                <p className="text-xs text-slate-500">
                  Format tabel spreadsheet Microsoft Excel lengkap dengan kolom dan baris total.
                </p>
              </div>
            </div>
            <button
              id="btn-modal-export-excel"
              onClick={() => {
                onExportExcel();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .XLSX</span>
            </button>
          </div>

          {/* Option 2: CSV File (.csv) */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-800">
                  Unduh File CSV (.csv)
                </h4>
                <p className="text-xs text-slate-500">
                  Kompatibel dengan Google Sheets, Excel, Numbers, dan berbagai aplikasi lain.
                </p>
              </div>
            </div>
            <button
              id="btn-modal-export-csv"
              onClick={() => {
                onExportCSV();
                onClose();
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .CSV</span>
            </button>
          </div>

          {/* Option 3: Salin Format WhatsApp */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800">
                  Salin Teks Ringkasan (WhatsApp)
                </h4>
                <p className="text-xs text-slate-500">
                  Format teks rapi siap kirim pesan ke grup WhatsApp pengelola atau penyewa.
                </p>
              </div>
            </div>
            <button
              id="btn-modal-copy-wa"
              onClick={() => {
                onCopyWhatsApp();
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Teks</span>
            </button>
          </div>

          {/* Option 4: Cetak / Simpan PDF */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-200 text-slate-700 flex-shrink-0">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Cetak Dokumen / Simpan PDF
                </h4>
                <p className="text-xs text-slate-500">
                  Format lembar rekapitulasi resmi dengan kop instansi dan kolom tanda tangan.
                </p>
              </div>
            </div>
            <button
              id="btn-modal-print-pdf"
              onClick={() => {
                onPrintPDF();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 flex-shrink-0 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
