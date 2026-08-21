import React from 'react';
import { 
  Wallet, 
  Calendar, 
  TrendingDown, 
  CheckCircle2, 
  MinusCircle,
  TrendingUp,
  Coins
} from 'lucide-react';
import { RentalRecord, ExtraExpense, AppSettings } from '../types';
import { formatRupiah, DEFAULT_SETTINGS } from '../utils/formatters';

interface SummaryCardsProps {
  records?: RentalRecord[];
  settings?: AppSettings;
  extraExpenses?: ExtraExpense[];
  onOpenSettings?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  records = [], 
  settings = DEFAULT_SETTINGS,
  extraExpenses = [],
  onOpenSettings
}) => {
  const safeRecords = records || [];
  const safeExpenses = extraExpenses || [];
  const safeSettings = settings || DEFAULT_SETTINGS;
  const defaultPot = safeSettings.defaultPotonganPerHari || 1200000;

  const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
  const totalSewaKotor = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  
  const totalPotonganHarian = safeRecords.reduce((sum, r) => {
    const pot = r.totalPotongan !== undefined 
      ? r.totalPotongan 
      : (r.jumlahHari * (r.potonganPerHari ?? defaultPot));
    return sum + pot;
  }, 0);

  const totalBiayaLainPeriode = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);
  const totalExtraExp = safeExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
  const grandTotalBiayaLain = totalBiayaLainPeriode + totalExtraExp;

  const grandTotalSisaBersih = totalSewaKotor - totalPotonganHarian - grandTotalBiayaLain;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
      
      {/* 1. Total Sewa Kotor */}
      <div 
        id="card-total-pendapatan"
        className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Sewa (Kotor)
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rp {formatRupiah(totalSewaKotor)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{records.length} Periode ({totalHari} Hari)</span>
          </div>
        </div>
      </div>

      {/* 2. Total Potongan Harian (1.200.000 / Hari) */}
      <div 
        id="card-total-potongan"
        className="bg-white rounded-xl p-4 sm:p-5 border border-rose-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Potongan Harian
            </span>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer"
                title="Edit Tarif Standar Potongan Harian"
              >
                Edit Tarif
              </button>
            )}
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <MinusCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            - Rp {formatRupiah(totalPotonganHarian)}
          </div>
          <div className="flex items-center justify-between gap-1.5 mt-1 text-xs text-rose-700/80 font-medium">
            <span>@{formatRupiah(defaultPot)} × {totalHari} Hari</span>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[11px] font-semibold text-rose-600 hover:underline hover:text-rose-800"
              >
                Ubah Standar &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Total Biaya Lainnya */}
      <div 
        id="card-total-biaya-lain"
        className="bg-white rounded-xl p-4 sm:p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Biaya Lain-Lain
          </span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            - Rp {formatRupiah(grandTotalBiayaLain)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-700/80 font-medium">
            <span>Input biaya operasional & lainnya</span>
          </div>
        </div>
      </div>

      {/* 4. Sisa Bersih Akhir */}
      <div 
        id="card-sisa-bersih-akhir"
        className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-300 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Sisa Bersih Akhir
          </span>
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            Rp {formatRupiah(grandTotalSisaBersih)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pendapatan Bersih Final</span>
          </div>
        </div>
      </div>

    </div>
  );
};
