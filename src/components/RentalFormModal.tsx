import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Calculator, 
  CheckCircle2, 
  HelpCircle, 
  DollarSign,
  Tag,
  User,
  MinusCircle,
  TrendingDown
} from 'lucide-react';
import { RentalRecord, PaymentStatus, AppSettings } from '../types';
import { 
  formatRupiah, 
  calculateDaysBetween, 
  generatePeriodeText, 
  parseAmount 
} from '../utils/formatters';

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: Omit<RentalRecord, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  initialData?: RentalRecord | null;
  settings: AppSettings;
}

export const RentalFormModal: React.FC<RentalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  settings,
}) => {
  const defaultSewa = settings.defaultSewaPerHari || 6000000;
  const defaultPot = settings.defaultPotonganPerHari || 1200000;
  const defaultHari = settings.defaultJumlahHari ?? 6;

  const [periode, setPeriode] = useState('');
  const [useDatePicker, setUseDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jumlahHari, setJumlahHari] = useState<number>(defaultHari);
  const [sewaPerHari, setSewaPerHari] = useState<number>(defaultSewa);
  const [potonganPerHari, setPotonganPerHari] = useState<number>(defaultPot);
  const [biayaLainnya, setBiayaLainnya] = useState<number>(0);
  const [ketBiayaLainnya, setKetBiayaLainnya] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [statusBayar, setStatusBayar] = useState<PaymentStatus>('Lunas');
  const [penyewa, setPenyewa] = useState('');

  useEffect(() => {
    if (initialData) {
      setPeriode(initialData.periode);
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setJumlahHari(initialData.jumlahHari !== undefined ? initialData.jumlahHari : defaultHari);
      setSewaPerHari(initialData.sewaPerHari);
      setPotonganPerHari(initialData.potonganPerHari ?? defaultPot);
      setBiayaLainnya(initialData.biayaLainnya ?? 0);
      setKetBiayaLainnya(initialData.ketBiayaLainnya ?? '');
      setKeterangan(initialData.keterangan || '');
      setStatusBayar(initialData.statusBayar || 'Lunas');
      setPenyewa(initialData.penyewa || '');
      setUseDatePicker(Boolean(initialData.startDate));
    } else {
      setPeriode('');
      setStartDate('');
      setEndDate('');
      setJumlahHari(defaultHari);
      setSewaPerHari(defaultSewa);
      setPotonganPerHari(defaultPot);
      setBiayaLainnya(0);
      setKetBiayaLainnya('');
      setKeterangan('');
      setStatusBayar('Lunas');
      setPenyewa('');
      setUseDatePicker(false);
    }
  }, [initialData, defaultSewa, defaultPot, defaultHari, isOpen]);

  // When start or end date changes, auto-fill days and period text
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const days = calculateDaysBetween(start, end);
      if (days >= 0) {
        setJumlahHari(days);
      }
      const generatedPeriod = generatePeriodeText(start, end);
      if (generatedPeriod) {
        setPeriode(generatedPeriod.toUpperCase());
      }
    } else if (start && !end) {
      const generatedPeriod = generatePeriodeText(start, start);
      if (generatedPeriod) {
        setPeriode(generatedPeriod.toUpperCase());
      }
    }
  };

  const daysCount = typeof jumlahHari === 'number' && jumlahHari >= 0 ? jumlahHari : 0;
  const calculatedTotal = daysCount * (Number(sewaPerHari) || 0);
  const calculatedPotongan = daysCount * (Number(potonganPerHari) >= 0 ? Number(potonganPerHari) : defaultPot);
  const calculatedBersih = calculatedTotal - calculatedPotongan - (Number(biayaLainnya) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periode.trim()) return;

    onSave({
      periode: periode.trim().toUpperCase(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      jumlahHari: daysCount,
      sewaPerHari: Number(sewaPerHari) > 0 ? Number(sewaPerHari) : defaultSewa,
      total: calculatedTotal,
      potonganPerHari: Number(potonganPerHari) >= 0 ? Number(potonganPerHari) : defaultPot,
      totalPotongan: calculatedPotongan,
      biayaLainnya: Number(biayaLainnya) || 0,
      ketBiayaLainnya: ketBiayaLainnya.trim() || undefined,
      totalBersih: calculatedBersih,
      keterangan: keterangan.trim(),
      statusBayar,
      penyewa: penyewa.trim() || undefined,
    }, initialData?.id);

    onClose();
  };

  if (!isOpen) return null;

  const ratePresets = [5000000, 6000000, 7500000, 10000000];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {initialData ? 'Edit Data Periode & Potongan' : 'Tambah Periode Sewa Dapur'}
              </h2>
              <p className="text-xs font-medium text-slate-300">
                Formulir rincian sewa, potongan harian, dan biaya lainnya
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-900 max-h-[80vh] overflow-y-auto">
          
          {/* Option: Pick using Date range or Direct Text */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-700">
              Gunakan Kalender Pemilihan Tanggal?
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={useDatePicker} 
                onChange={(e) => setUseDatePicker(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Date Pickers (if toggled) */}
          {useDatePicker && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, endDate)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange(startDate, e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* PERIODE TEXT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Teks Periode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              placeholder="Contoh: 10-11MEI atau 16-20JUNE"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase tracking-wide"
            />
          </div>

          {/* JUMLAH HARI & SEWA PER HARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Jumlah Hari <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setJumlahHari(0)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    0 (Libur)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJumlahHari(6)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer"
                  >
                    6 (Normal)
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={jumlahHari}
                  onChange={(e) => setJumlahHari(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-center text-base focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                  Hari
                </span>
              </div>
              {daysCount === 0 && (
                <p className="text-[11px] text-amber-700 font-semibold mt-1">
                  ⚠️ Periode Libur (0 Hari) — Tetap dicatat dalam rekapitulasi.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Sewa Per Hari (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={sewaPerHari}
                onChange={(e) => setSewaPerHari(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-right text-base focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* POTONGAN HARIAN (1.200.000) & BIAYA LAINNYA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-rose-50/40 rounded-xl border border-rose-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-800">
                  Potongan / Hari (Rp)
                </label>
                <button
                  type="button"
                  onClick={() => setPotonganPerHari(defaultPot)}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Set Standar ({formatRupiah(defaultPot)})
                </button>
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={potonganPerHari}
                onChange={(e) => setPotonganPerHari(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-rose-900 font-bold text-right text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
              <div className="flex items-center gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setPotonganPerHari(1200000)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold cursor-pointer"
                >
                  1.2 Jt
                </button>
                <button
                  type="button"
                  onClick={() => setPotonganPerHari(1000000)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  1.0 Jt
                </button>
                <button
                  type="button"
                  onClick={() => setPotonganPerHari(0)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Rp 0
                </button>
              </div>
              <div className="text-[11px] text-rose-700 mt-1 font-semibold">
                Total Potongan: - Rp {formatRupiah(calculatedPotongan)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                Biaya Lainnya (Rp)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={biayaLainnya}
                onChange={(e) => setBiayaLainnya(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold text-right text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={ketBiayaLainnya}
                onChange={(e) => setKetBiayaLainnya(e.target.value)}
                placeholder="Ket: Gas, Listrik, Kebersihan"
                className="w-full mt-1.5 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* REALTIME CALCULATION SUMMARY CARD */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Total Penerimaan Sewa:</span>
              <span className="font-semibold">Rp {formatRupiah(calculatedTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span>Potongan Harian ({daysCount} × Rp {formatRupiah(potonganPerHari)}):</span>
              <span className="font-semibold">- Rp {formatRupiah(calculatedPotongan)}</span>
            </div>
            {biayaLainnya > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>Biaya Lain-Lain:</span>
                <span className="font-semibold">- Rp {formatRupiah(biayaLainnya)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Sisa Bersih Akhir:
              </span>
              <span className="text-xl font-black text-emerald-400">
                Rp {formatRupiah(calculatedBersih)}
              </span>
            </div>
          </div>

          {/* STATUS PEMBAYARAN & PENYEWA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pembayaran
              </label>
              <select
                value={statusBayar}
                onChange={(e) => setStatusBayar(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Penyewa / Klien (Opsional)
              </label>
              <input
                type="text"
                value={penyewa}
                onChange={(e) => setPenyewa(e.target.value)}
                placeholder="Contoh: Ibu Rina / Katering"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Tambahan (Ket)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Transfer BCA, Acara Nikahan, DP 50%..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          {/* Modal Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-modal-save"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-all cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah ke Rekapitulasi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
