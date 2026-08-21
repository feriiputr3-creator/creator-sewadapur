import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { AppSettings, RentalRecord } from '../types';
import { formatRupiah } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onExportJsonBackup: () => void;
  onImportJsonBackup: (file: File) => void;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportJsonBackup,
  onImportJsonBackup,
  onResetToSampleData,
  onClearAllData,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJsonBackup(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Pengaturan & Backup Data</h2>
              <p className="text-xs text-slate-300">Konfigurasi tarif default dan cadangan data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-900">
          
          {/* Default Daily Rate, Default Deduction & Default Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tarif Sewa / Hari (Rp)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={formData.defaultSewaPerHari}
                onChange={(e) => setFormData({ ...formData, defaultSewaPerHari: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Rp {formatRupiah(formData.defaultSewaPerHari)} / hr
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                Potongan / Hari (Rp)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={formData.defaultPotonganPerHari ?? 1200000}
                onChange={(e) => setFormData({ ...formData, defaultPotonganPerHari: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-rose-900 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-rose-600 mt-1">
                Rp {formatRupiah(formData.defaultPotonganPerHari ?? 1200000)} / hr
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                Standar Hari / Periode
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.defaultJumlahHari ?? 6}
                onChange={(e) => setFormData({ ...formData, defaultJumlahHari: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-indigo-900 font-bold text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-indigo-600 mt-1">
                Nilai awal input baru: {formData.defaultJumlahHari ?? 6} hari
              </p>
            </div>
          </div>


          {/* Nama Instansi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Instansi / Unit Dapur
            </label>
            <input
              type="text"
              value={formData.namaInstansi}
              onChange={(e) => setFormData({ ...formData, namaInstansi: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Penanggung Jawab & Jabatan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={formData.penanggungJawab}
                onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Cadangan & Pemulihan Data (Backup JSON)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportJsonBackup}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pulihkan dari File</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Data Reset Options */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onResetToSampleData}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Ulang Contoh Awal</span>
            </button>

            <button
              type="button"
              onClick={onClearAllData}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
