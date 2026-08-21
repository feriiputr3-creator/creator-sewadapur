import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  ChevronDown, 
  Plus, 
  Layers, 
  ChefHat, 
  Check, 
  Copy, 
  Sparkles,
  CalendarDays,
  Coins
} from 'lucide-react';
import { KitchenDatabase } from '../types';
import { formatRupiah } from '../utils/formatters';

interface DatabaseSwitcherProps {
  databases: KitchenDatabase[];
  activeDatabase: KitchenDatabase;
  onSelectDatabase: (id: string) => void;
  onOpenNewDatabaseModal: () => void;
  onOpenDatabaseManager: () => void;
  onDuplicateStructure: (db: KitchenDatabase) => void;
}

export const DatabaseSwitcher: React.FC<DatabaseSwitcherProps> = ({
  databases,
  activeDatabase,
  onSelectDatabase,
  onOpenNewDatabaseModal,
  onOpenDatabaseManager,
  onDuplicateStructure,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPeriods = activeDatabase.records.length;
  const totalDays = activeDatabase.records.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left: Active Database Selector */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 hidden md:inline">
              Database Dapur:
            </span>

            {/* Selector Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 text-white transition-all cursor-pointer shadow-xs"
                title="Klik untuk memilih atau beralih database dapur"
              >
                <div className="p-1 rounded-lg bg-indigo-500 text-white shrink-0">
                  <ChefHat className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight">
                      {activeDatabase.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                      {totalPeriods} Periode
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-indigo-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold">Daftar Database Dapur</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {databases.length} Dapur Tersimpan
                    </span>
                  </div>

                  <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                    {databases.map((db) => {
                      const isActive = db.id === activeDatabase.id;
                      const periodCount = db.records.length;
                      const dayCount = db.records.reduce((s, r) => s + (Number(r.jumlahHari) || 0), 0);

                      return (
                        <button
                          key={db.id}
                          type="button"
                          onClick={() => {
                            onSelectDatabase(db.id);
                            setIsOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-950'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ChefHat className={`w-4 h-4 ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900">
                                {db.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>{periodCount} Periode</span>
                                <span>•</span>
                                <span>{dayCount} Hari</span>
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <div className="p-1 rounded-full bg-indigo-600 text-white">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenNewDatabaseModal();
                      }}
                      className="w-full py-2 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Dapur Baru (Klon Periode)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick summary stats chip */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-indigo-200">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                {totalDays} Hari Aktif
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Direct Hero Button: New Kitchen with Preserved Periods */}
            <button
              type="button"
              onClick={onOpenNewDatabaseModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-emerald-500/20"
              title="Buat database dapur baru dengan mempertahankan susunan periode tapi mengosongkan jumlah hari"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Dapur Baru (Periode Tetap)</span>
            </button>

            {/* Manage Databases */}
            <button
              type="button"
              onClick={onOpenDatabaseManager}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka Menu Manajemen Semua Database Dapur"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-300" />
              <span>Kelola Database ({databases.length})</span>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
