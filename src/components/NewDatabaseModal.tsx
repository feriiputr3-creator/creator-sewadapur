import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  CalendarDays, 
  Settings2,
  ChefHat,
  ArrowRight
} from 'lucide-react';
import { RentalRecord, AppSettings, NewDatabaseMode } from '../types';
import { formatRupiah } from '../utils/formatters';

interface NewDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecords: RentalRecord[];
  currentSettings: AppSettings;
  existingDatabasesCount: number;
  onCreateDatabase: (
    name: string,
    mode: NewDatabaseMode,
    customSettings?: Partial<AppSettings>,
    color?: string
  ) => void;
}

const COLOR_OPTIONS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-600', ring: 'ring-indigo-400' },
  { id: 'emerald', name: 'Emerald (Hijau)', bg: 'bg-emerald-500', border: 'border-emerald-600', ring: 'ring-emerald-400' },
  { id: 'amber', name: 'Amber (Kuning Mas)', bg: 'bg-amber-500', border: 'border-amber-600', ring: 'ring-amber-400' },
  { id: 'rose', name: 'Rose (Merah)', bg: 'bg-rose-500', border: 'border-rose-600', ring: 'ring-rose-400' },
  { id: 'cyan', name: 'Cyan (Biru Langit)', bg: 'bg-cyan-500', border: 'border-cyan-600', ring: 'ring-cyan-400' },
  { id: 'purple', name: 'Purple (Ungu)', bg: 'bg-purple-500', border: 'border-purple-600', ring: 'ring-purple-400' },
];

export const NewDatabaseModal: React.FC<NewDatabaseModalProps> = ({
  isOpen,
  onClose,
  currentRecords,
  currentSettings,
  existingDatabasesCount,
  onCreateDatabase,
}) => {
  const [name, setName] = useState(`Dapur ${existingDatabasesCount + 1} SPPG`);
  const [mode, setMode] = useState<NewDatabaseMode>('retain-periods-clear-days');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Custom Settings overrides if user wants
  const [sewaPerHari, setSewaPerHari] = useState<number>(currentSettings.defaultSewaPerHari || 6000000);
  const [potonganPerHari, setPotonganPerHari] = useState<number>(currentSettings.defaultPotonganPerHari || 1200000);
  const [defaultJumlahHari, setDefaultJumlahHari] = useState<number>(currentSettings.defaultJumlahHari || 6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateDatabase(
      name.trim(),
      mode,
      {
        defaultSewaPerHari: Number(sewaPerHari) || 6000000,
        defaultPotonganPerHari: Number(potonganPerHari) >= 0 ? Number(potonganPerHari) : 1200000,
        defaultJumlahHari: Number(defaultJumlahHari) >= 0 ? Number(defaultJumlahHari) : 6,
        namaInstansi: name.trim().toUpperCase(),
      },
      selectedColor
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Buat Database Dapur Baru</h3>
              <p className="text-xs text-indigo-100">
                Pencatatan baru untuk dapur lain dengan struktur periode siap pakai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Database Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Database / Dapur <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ChefHat className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Dapur 2 SPPG, Dapur Unit B, Siklus Semester 2"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Pilihan Struktur Data Database Baru <span className="text-rose-500">*</span>
            </label>
            
            <div className="space-y-2.5">
              
              {/* OPTION 1: RETAIN PERIODS, CLEAR DAYS (USER'S REQUESTED HERO FEATURE) */}
              <label 
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'retain-periods-clear-days'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="database-mode"
                  value="retain-periods-clear-days"
                  checked={mode === 'retain-periods-clear-days'}
                  onChange={() => setMode('retain-periods-clear-days')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      Pertahankan Periode, Kosongkan Jumlah Hari
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                      Direkomendasikan
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Menyalin seluruh <strong>{currentRecords.length} susunan periode</strong> beserta tanggalnya secara rapi, namun <strong>mengosongkan Jumlah Hari (0 Hari / siap diisi)</strong> dan mereset biaya pengeluaran operasional.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-indigo-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Anda tidak perlu mengetik ulang {currentRecords.length} nama periode & tanggal satu per satu.</span>
                  </div>
                </div>
              </label>

              {/* OPTION 2: BLANK DATABASE */}
              <label 
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'blank'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="database-mode"
                  value="blank"
                  checked={mode === 'blank'}
                  onChange={() => setMode('blank')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-slate-900">
                    Database Kosong Baru
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Membuat lembar kerja baru tanpa data periode (0 baris), siap diinput secara mandiri dari awal.
                  </p>
                </div>
              </label>

              {/* OPTION 3: FULL CLONE */}
              <label 
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'clone-all'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="database-mode"
                  value="clone-all"
                  checked={mode === 'clone-all'}
                  onChange={() => setMode('clone-all')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-slate-900">
                    Duplikat Lengkap (Salin Persis Seluruh Isi Data)
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Menduplikasi persis seluruh data {currentRecords.length} periode termasuk jumlah hari dan biaya saat ini sebagai cadangan / backup.
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Visual Color Tag */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Warna Penanda Database
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    selectedColor === c.id
                      ? `${c.ring} ring-2 border-slate-900 bg-slate-900 text-white`
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Advanced Rate Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showAdvancedSettings ? 'Sembunyikan Pengaturan Tarif Dapur Baru' : 'Sesuaikan Tarif Sewa & Potongan Dapur Baru...'}</span>
            </button>

            {showAdvancedSettings && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tarif Sewa / Hari (Rp)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={sewaPerHari}
                      onChange={(e) => setSewaPerHari(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Rp {formatRupiah(sewaPerHari)}/hr
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-700 mb-1">
                      Potongan / Hari (Rp)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={potonganPerHari}
                      onChange={(e) => setPotonganPerHari(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-rose-300 rounded-lg font-bold text-rose-800"
                    />
                    <span className="text-[10px] text-rose-600 block mt-0.5">
                      Rp {formatRupiah(potonganPerHari)}/hr
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-700 mb-1">
                      Standar Hari / Periode
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={defaultJumlahHari}
                      onChange={(e) => setDefaultJumlahHari(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg font-bold text-center"
                    />
                    <span className="text-[10px] text-indigo-600 block mt-0.5">
                      Default: {defaultJumlahHari} hari
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Buat Database Dapur Baru</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
