import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Wallet, 
  MinusCircle, 
  DollarSign, 
  HelpCircle,
  Sparkles,
  Calculator
} from 'lucide-react';
import { RentalRecord, ExtraExpense, AppSettings } from '../types';
import { formatRupiah, DEFAULT_SETTINGS } from '../utils/formatters';

interface ExtraExpensesSectionProps {
  records?: RentalRecord[];
  settings?: AppSettings;
  extraExpenses?: ExtraExpense[];
  expenses?: ExtraExpense[];
  onAddExpense: (expense: Omit<ExtraExpense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExtraExpensesSection: React.FC<ExtraExpensesSectionProps> = ({
  records = [],
  settings = DEFAULT_SETTINGS,
  extraExpenses,
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [namaBiaya, setNamaBiaya] = useState('');
  const [nominal, setNominal] = useState<number | ''>('');
  const [keterangan, setKeterangan] = useState('');

  const expenseList = extraExpenses || expenses || [];
  const safeRecords = records || [];
  const safeSettings = settings || DEFAULT_SETTINGS;

  // 1. Total Gross Rental
  const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
  const totalSewaKotor = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  // 2. Total Potongan Harian (1.200.000 / hari default)
  const defaultPot = safeSettings.defaultPotonganPerHari || 1200000;
  const totalPotonganHarian = safeRecords.reduce((sum, r) => {
    const potPerHari = r.potonganPerHari !== undefined ? r.potonganPerHari : defaultPot;
    return sum + (r.totalPotongan !== undefined ? r.totalPotongan : r.jumlahHari * potPerHari);
  }, 0);

  // 3. Total Biaya Lainnya dari Baris Periode
  const totalBiayaLainPeriode = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);

  // 4. Total Pengeluaran Umum / Biaya Tambahan
  const totalPengeluaranUmum = expenseList.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);

  // 5. Grand Total Semua Pengeluaran & Sisa Bersih Akhir
  const totalSemuaPengeluaran = totalPotonganHarian + totalBiayaLainPeriode + totalPengeluaranUmum;
  const grandTotalSisaBersih = totalSewaKotor - totalSemuaPengeluaran;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBiaya.trim() || !nominal || Number(nominal) <= 0) return;

    onAddExpense({
      nama: namaBiaya.trim(),
      nominal: Number(nominal),
      keterangan: keterangan.trim() || undefined,
      tanggal: new Date().toISOString().slice(0, 10),
    });

    setNamaBiaya('');
    setNominal('');
    setKeterangan('');
  };

  return (
    <div id="section-biaya-dan-sisa-bersih" className="mt-8 space-y-6 print:hidden">
      
      {/* 1. MASTER SUMMARY CARD: PENGURANGAN HARIAN (1.200.000) & BIAYA LAINNYA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Rekapitulasi Sisa Bersih & Biaya-Biaya Lainnya
              </h2>
              <p className="text-xs text-slate-300">
                Kalkulasi otomatis pendapatan sewa dikurangi potongan harian (Rp {formatRupiah(defaultPot)}/hari) & biaya operasional lainnya.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Sisa Pendapatan Bersih
            </span>
            <span className={`text-xl sm:text-2xl font-black ${
              grandTotalSisaBersih >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              Rp {formatRupiah(grandTotalSisaBersih)}
            </span>
          </div>
        </div>

        {/* Calculation Step Breakdown (High Contrast & Clear) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/60 border-b border-slate-200">
          
          {/* Item 1: Total Penerimaan Kotor */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>1. Total Sewa Kotor</span>
              <span className="text-slate-400">{totalHari} Hari</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              Rp {formatRupiah(totalSewaKotor)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Dari {records.length} periode sewa
            </div>
          </div>

          {/* Item 2: Potongan Harian (1.200.000 / Hari) */}
          <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-rose-600 font-semibold mb-1">
              <span>2. Potongan Harian</span>
              <span className="text-[10px] bg-rose-50 px-1.5 py-0.5 rounded text-rose-700 font-bold">
                @{formatRupiah(defaultPot)}/hr
              </span>
            </div>
            <div className="text-lg font-bold text-rose-600">
              - Rp {formatRupiah(totalPotonganHarian)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {totalHari} Hari × Rp {formatRupiah(defaultPot)}
            </div>
          </div>

          {/* Item 3: Biaya-Biaya Lainnya */}
          <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-amber-600 font-semibold mb-1">
              <span>3. Total Biaya Lainnya</span>
              <span className="text-slate-400">{expenseList.length} pos</span>
            </div>
            <div className="text-lg font-bold text-amber-600">
              - Rp {formatRupiah(totalBiayaLainPeriode + totalPengeluaranUmum)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Biaya kolom tabel + biaya umum
            </div>
          </div>

          {/* Item 4: Hasil Sisa Bersih */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
              <span>4. SISA BERSIH AKHIR</span>
              <span className="text-emerald-700">Net Profit</span>
            </div>
            <div className="text-lg font-black text-emerald-700">
              = Rp {formatRupiah(grandTotalSisaBersih)}
            </div>
            <div className="text-[11px] text-emerald-800/80 mt-1 font-medium">
              (Total - Potongan - Biaya Lain)
            </div>
          </div>

        </div>

        {/* 2. FORM & DAFTAR BIAYA PENGELUARAN LAINNYA (KOLOM INPUT BIAYA TAMBAHAN) */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Input Biaya-Biaya Pengeluaran Lainnya (Operasional / Logistik)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan biaya lain (misal token listrik, gas LPG, operasional, kebersihan) untuk otomatis mengurangi total akhir.
              </p>
            </div>
            {expenseList.length > 0 && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {expenseList.length} Biaya Tambahan Dicatat
              </span>
            )}
          </div>

          {/* Form Quick Add Extra Expense */}
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Biaya / Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaBiaya}
                onChange={(e) => setNamaBiaya(e.target.value)}
                placeholder="Contoh: Gas LPG 12kg (2 tabung)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nominal Biaya (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={nominal}
                onChange={(e) => setNominal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 25000000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
              />
              {nominal !== '' && Number(nominal) > 0 && (
                <span className="text-[11px] font-bold text-indigo-700 mt-1 block bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Rp {formatRupiah(Number(nominal))}
                </span>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Untuk persiapan acara 16-20JUNE"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                id="btn-add-extra-expense"
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah</span>
              </button>
            </div>
          </form>

          {/* List of Extra Expenses */}
          {expenseList.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-xs text-slate-500">
              Belum ada pengeluaran umum tambahan. Anda dapat menginput biaya tambahan di atas atau mengisi kolom "Biaya Lainnya" langsung pada baris tabel periode sewa.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">No</th>
                    <th className="py-2.5 px-4">Nama Biaya / Pengeluaran</th>
                    <th className="py-2.5 px-4 text-right">Nominal Pengeluaran</th>
                    <th className="py-2.5 px-4">Keterangan</th>
                    <th className="py-2.5 px-3 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-sans">
                  {expenseList.map((exp, idx) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{exp.nama}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600 tabular-nums">
                        - Rp {formatRupiah(exp.nominal)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{exp.keterangan || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Biaya Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-4 text-right">Total Pengeluaran Tambahan:</td>
                    <td className="py-2.5 px-4 text-right text-rose-700 font-black">
                      - Rp {formatRupiah(totalPengeluaranUmum)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
