import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Download, 
  Upload, 
  ChefHat, 
  Layers, 
  CalendarDays, 
  Coins, 
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { KitchenDatabase, NewDatabaseMode } from '../types';
import { formatRupiah } from '../utils/formatters';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  databases: KitchenDatabase[];
  activeDatabaseId: string;
  onSelectDatabase: (id: string) => void;
  onOpenNewDatabaseModal: () => void;
  onRenameDatabase: (id: string, newName: string) => void;
  onDuplicateStructure: (sourceDb: KitchenDatabase) => void;
  onDeleteDatabase: (id: string) => void;
  onExportAllDatabases: () => void;
  onImportDatabases: (jsonString: string) => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  databases,
  activeDatabaseId,
  onSelectDatabase,
  onOpenNewDatabaseModal,
  onRenameDatabase,
  onDuplicateStructure,
  onDeleteDatabase,
  onExportAllDatabases,
  onImportDatabases,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRename = (db: KitchenDatabase) => {
    setEditingId(db.id);
    setEditName(db.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameDatabase(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportDatabases(text);
        setImportError(null);
      } catch (err: any) {
        setImportError('Format file backup JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Kelola Database Dapur</h3>
              <p className="text-xs text-slate-300">
                Pilih dapur aktif, tambah dapur baru, atau gandakan struktur periode
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewDatabaseModal();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Database Dapur Baru</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportAllDatabases}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cadangkan semua database ke file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup Semua (JSON)</span>
              </button>

              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Database List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {databases.map((db, idx) => {
              const isActive = db.id === activeDatabaseId;
              const totalPeriods = db.records.length;
              const totalDays = db.records.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
              const totalNet = db.records.reduce((sum, r) => {
                const total = Number(r.total) || 0;
                const pot = Number(r.totalPotongan) || (r.jumlahHari * (r.potonganPerHari || 1200000));
                const bl = Number(r.biayaLainnya) || 0;
                return sum + (r.totalBersih !== undefined ? r.totalBersih : (total - pot - bl));
              }, 0) - db.extraExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);

              const isEditing = editingId === db.id;

              return (
                <div
                  key={db.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-200' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Database Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2.5 py-1 text-sm font-bold bg-white border border-indigo-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(db.id)}
                              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <ChefHat className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                                {db.name}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStartRename(db)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                              title="Ubah nama database"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                            Aktif
                          </span>
                        )}
                      </div>

                      {/* Stats chips */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                          {totalPeriods} Periode
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {totalDays} Hari Kerja
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                          Rp {formatRupiah(totalNet)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons per database */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onSelectDatabase(db.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          Pilih Dapur Ini
                        </button>
                      )}

                      {/* Quick action: Retain periods and clear days to new kitchen */}
                      <button
                        type="button"
                        onClick={() => {
                          onDuplicateStructure(db);
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Gandakan susunan periode dapur ini (dengan jumlah hari dikosongkan) ke database dapur baru"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Klon Periode (0 Hari)</span>
                      </button>

                      {/* Delete */}
                      {databases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteDatabase(db.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus database dapur ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">💡 Tips Manajemen Database Dapur:</p>
            <p>
              Gunakan tombol <strong>"Klon Periode (0 Hari)"</strong> atau <strong>"+ Buat Database Dapur Baru"</strong> untuk mencatat dapur cabang lain tanpa perlu mengetik ulang 31 periode dan rentang tanggal dari awal.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
