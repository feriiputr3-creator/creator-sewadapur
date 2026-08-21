import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  recordDetails?: {
    periode?: string;
    jumlahHari?: number;
    total?: number;
    keterangan?: string;
  };
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  recordDetails,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      id="confirm-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        id="confirm-modal-container"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          isDestructive ? 'bg-rose-50 border-b border-rose-100' : 'bg-slate-50 border-b border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isDestructive ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`text-base font-bold ${
                isDestructive ? 'text-rose-950' : 'text-slate-900'
              }`}>
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>

          {/* Optional Record Details Preview */}
          {recordDetails && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              {recordDetails.periode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Periode:</span>
                  <span className="font-bold text-slate-900 uppercase">{recordDetails.periode}</span>
                </div>
              )}
              {recordDetails.jumlahHari !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Jumlah Hari:</span>
                  <span className="font-semibold text-slate-800">{recordDetails.jumlahHari} Hari</span>
                </div>
              )}
              {recordDetails.total !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Biaya:</span>
                  <span className="font-bold text-emerald-700">
                    Rp {new Intl.NumberFormat('id-ID').format(recordDetails.total)}
                  </span>
                </div>
              )}
              {recordDetails.keterangan && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Keterangan:</span>
                  <span className="text-slate-700 italic">{recordDetails.keterangan}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500">
            {isDestructive 
              ? 'Tindakan ini akan menghapus data tersebut dari daftar rekapitulasi.' 
              : 'Pastikan Anda telah memeriksa data sebelum melanjutkan.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-confirm-cancel"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="btn-confirm-execute"
            onClick={handleConfirm}
            className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
            }`}
          >
            {isDestructive && <Trash2 className="w-4 h-4" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
