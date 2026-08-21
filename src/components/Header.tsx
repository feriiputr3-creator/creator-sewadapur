import React from 'react';
import { 
  ChefHat, 
  PlusCircle, 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Settings, 
  Download,
  CalendarDays
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onCopyText: () => void;
  onOpenSettings: () => void;
  onOpenDatabaseManager?: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenExportModal,
  onExportExcel,
  onPrint,
  onCopyText,
  onOpenSettings,
  onOpenDatabaseManager,
  title = 'Sewa Dapur SPPG',
  subtitle = 'Pencatatan Sewa Dapur Harian Per Periode',
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  {title}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Harian & Periode
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-add-period"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Periode</span>
            </button>

            <button
              id="btn-open-export-menu"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              title="Menu Ekspor Data (Excel, CSV, WhatsApp, PDF)"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data</span>
            </button>

            <button
              id="btn-copy-wa"
              onClick={onCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm border border-slate-200 transition-all cursor-pointer"
              title="Salin rekap untuk WhatsApp atau pesan"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Salin WA</span>
            </button>

            <button
              id="btn-print-report"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm border border-slate-200 transition-all cursor-pointer"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Cetak / PDF</span>
            </button>

            <button
              id="btn-settings"
              onClick={onOpenSettings}
              className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
              title="Pengaturan & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
