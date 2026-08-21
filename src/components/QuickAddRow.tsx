import React, { useState } from 'react';
import { Plus, Calculator, ArrowRight, MinusCircle } from 'lucide-react';
import { RentalRecord, PaymentStatus, AppSettings } from '../types';
import { formatRupiah, parseAmount } from '../utils/formatters';

interface QuickAddRowProps {
  settings: AppSettings;
  onAddRecord: (record: Omit<RentalRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const QuickAddRow: React.FC<QuickAddRowProps> = ({
  settings,
  onAddRecord,
}) => {
  const defaultSewa = settings.defaultSewaPerHari || 6000000;
  const defaultPotongan = settings.defaultPotonganPerHari || 1200000;
  const defaultHari = settings.defaultJumlahHari ?? 6;

  const [periode, setPeriode] = useState('');
  const [jumlahHari, setJumlahHari] = useState<number | ''>(defaultHari);
  const [sewaPerHari, setSewaPerHari] = useState<number | ''>(defaultSewa);
  const [potonganPerHari, setPotonganPerHari] = useState<number | ''>(defaultPotongan);
  const [biayaLainnya, setBiayaLainnya] = useState<number | ''>('');
  const [ketBiayaLainnya, setKetBiayaLainnya] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [statusBayar, setStatusBayar] = useState<PaymentStatus>('Lunas');
  const [penyewa, setPenyewa] = useState('');

  const currentHari = typeof jumlahHari === 'number' && jumlahHari >= 0 ? jumlahHari : 0;
  const currentSewa = typeof sewaPerHari === 'number' ? sewaPerHari : defaultSewa;
  const currentPot = typeof potonganPerHari === 'number' ? potonganPerHari : defaultPotongan;
  const currentBiayaLain = typeof biayaLainnya === 'number' ? biayaLainnya : 0;

  const calculatedTotal = currentHari * currentSewa;
  const calculatedPotongan = currentHari * currentPot;
  const calculatedBersih = calculatedTotal - calculatedPotongan - currentBiayaLain;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periode.trim()) return;

    const days = typeof jumlahHari === 'number' && jumlahHari >= 0 ? jumlahHari : defaultHari;
    const rate = currentSewa > 0 ? currentSewa : defaultSewa;
    const pot = currentPot >= 0 ? currentPot : defaultPotongan;
    const total = days * rate;
    const totalPot = days * pot;
    const totalBersih = total - totalPot - currentBiayaLain;

    onAddRecord({
      periode: periode.trim().toUpperCase(),
      jumlahHari: days,
      sewaPerHari: rate,
      total,
      potonganPerHari: pot,
      totalPotongan: totalPot,
      biayaLainnya: currentBiayaLain,
      ketBiayaLainnya: ketBiayaLainnya.trim() || undefined,
      totalBersih,
      keterangan: keterangan.trim(),
      statusBayar,
      penyewa: penyewa.trim() || undefined,
    });

    // Reset input for next entry while preserving the standard 6 days and rates
    setPeriode('');
    setJumlahHari(defaultHari);
    setBiayaLainnya('');
    setKetBiayaLainnya('');
    setKeterangan('');
    setPenyewa('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Plus className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Input Cepat Baris Periode Baru
          </h3>
        </div>
        
        {/* Real-time calculation indicators */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700">
            <span>Total Sewa:</span>
            <span className="font-bold">Rp {formatRupiah(calculatedTotal)}</span>
          </div>

          <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded border border-rose-200 text-rose-700">
            <span>Potongan ({currentHari}x{formatRupiah(currentPot)}):</span>
            <span className="font-bold">- Rp {formatRupiah(calculatedPotongan)}</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-300 text-emerald-800 font-bold">
            <span>Sisa Bersih:</span>
            <span>Rp {formatRupiah(calculatedBersih)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* PERIODE */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            PERIODE <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            placeholder="Contoh: 10-11MEI"
            className="w-full px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase font-semibold placeholder:normal-case placeholder:text-slate-400"
          />
        </div>

        {/* JUMLAH HARI */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              JUMLAH HARI <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setJumlahHari(0)}
                className="text-[10px] px-1 py-0.2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                title="Set 0 Hari jika periode ini libur"
              >
                0 (Libur)
              </button>
              <button
                type="button"
                onClick={() => setJumlahHari(6)}
                className="text-[10px] px-1 py-0.2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer"
                title="Set 6 Hari normal per periode"
              >
                6 (Normal)
              </button>
            </div>
          </div>
          <input
            type="number"
            min="0"
            required
            value={jumlahHari}
            onChange={(e) => setJumlahHari(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="6"
            className="w-full px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-center"
          />
        </div>

        {/* SEWA PER HARI */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            SEWA/HARI (RP)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            value={sewaPerHari}
            onChange={(e) => setSewaPerHari(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="6000000"
            className="w-full px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-right"
          />
        </div>

        {/* POTONGAN PER HARI */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-rose-700 mb-1">
            POTONGAN/HARI (RP)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={potonganPerHari}
            onChange={(e) => setPotonganPerHari(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="1200000"
            className="w-full px-2.5 py-2 text-xs sm:text-sm bg-rose-50/50 border border-rose-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold text-rose-800 text-right"
          />
        </div>

        {/* BIAYA LAINNYA */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-amber-700 mb-1">
            BIAYA LAIN-LAIN (RP)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={biayaLainnya}
            onChange={(e) => setBiayaLainnya(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            className="w-full px-2.5 py-2 text-xs sm:text-sm bg-amber-50/50 border border-amber-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-amber-900 text-right"
          />
        </div>

        {/* TOMBOL SUBMIT */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            id="btn-quick-add-submit"
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>+ Simpan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
