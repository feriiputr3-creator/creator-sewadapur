import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Plus, 
  Sparkles, 
  Tag, 
  Info,
  CalendarDays,
  FileText,
  DollarSign,
  Layers,
  Scissors,
  Receipt,
  Eye,
  Settings,
  Sliders,
  RotateCcw,
  Table as TableIcon
} from 'lucide-react';
import { RentalRecord, PaymentStatus, AppSettings } from '../types';
import { formatRupiah, parseAmount, DEFAULT_SETTINGS } from '../utils/formatters';

interface RentalTableProps {
  records?: RentalRecord[];
  settings?: AppSettings;
  onUpdateRecord: (updated: RentalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (record: RentalRecord) => void;
  onOpenEditModal: (record: RentalRecord) => void;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
  tableTheme: 'yellow-classic' | 'modern-clean';
  onToggleTheme: () => void;
}

export type TableViewMode = 'separated' | 'rental-only' | 'deductions-only' | 'combined';

export const RentalTable: React.FC<RentalTableProps> = ({
  records = [],
  settings = DEFAULT_SETTINGS,
  onUpdateRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onOpenEditModal,
  onOpenAddModal,
  onOpenSettings,
  tableTheme,
  onToggleTheme,
}) => {
  const safeRecords = records || [];
  const safeSettings = settings || DEFAULT_SETTINGS;
  const defaultPotongan = safeSettings.defaultPotonganPerHari || 1200000;

  // View Mode: 'separated' (Default: 2 Tabel Terpisah), 'rental-only', 'deductions-only', 'combined'
  const [viewMode, setViewMode] = useState<TableViewMode>('separated');

  // Batch deduction editor modal state
  const [isBatchDeductionModalOpen, setIsBatchDeductionModalOpen] = useState(false);
  const [batchDeductionInput, setBatchDeductionInput] = useState<string>(formatRupiah(defaultPotongan));

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<RentalRecord>>({});

  const startInlineEdit = (record: RentalRecord) => {
    setEditingId(record.id);
    setEditRowData({
      ...record,
      potonganPerHari: record.potonganPerHari ?? defaultPotongan,
      biayaLainnya: record.biayaLainnya ?? 0,
      ketBiayaLainnya: record.ketBiayaLainnya ?? '',
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditRowData({});
  };

  const saveInlineEdit = () => {
    if (!editingId) return;
    const existing = safeRecords.find(r => r.id === editingId);
    if (!existing) return;

    const jumlahHari = editRowData.jumlahHari !== undefined && Number(editRowData.jumlahHari) >= 0 
      ? Number(editRowData.jumlahHari) 
      : (existing.jumlahHari ?? 6);
    const sewaPerHari = Number(editRowData.sewaPerHari) || safeSettings.defaultSewaPerHari || 6000000;
    const total = jumlahHari * sewaPerHari;

    const potPerHari = editRowData.potonganPerHari !== undefined 
      ? Number(editRowData.potonganPerHari) 
      : (existing.potonganPerHari ?? defaultPotongan);
    
    const totalPot = jumlahHari * potPerHari;
    const biayaLain = Number(editRowData.biayaLainnya) || 0;
    const totalBersih = total - totalPot - biayaLain;

    const updated: RentalRecord = {
      ...existing,
      periode: (editRowData.periode || existing.periode).trim(),
      jumlahHari,
      sewaPerHari,
      total,
      keterangan: (editRowData.keterangan ?? existing.keterangan).trim(),
      statusBayar: (editRowData.statusBayar as PaymentStatus) || existing.statusBayar,
      penyewa: editRowData.penyewa?.trim(),
      potonganPerHari: potPerHari,
      totalPotongan: totalPot,
      biayaLainnya: biayaLain,
      ketBiayaLainnya: (editRowData.ketBiayaLainnya || '').trim(),
      totalBersih,
      updatedAt: new Date().toISOString(),
    };

    onUpdateRecord(updated);
    setEditingId(null);
    setEditRowData({});
  };

  // Quick inline update for Potongan Per Hari
  const handleQuickPotonganPerHariChange = (record: RentalRecord, value: string) => {
    const parsed = value === '' ? 0 : parseAmount(value);
    const totalPot = record.jumlahHari * parsed;
    const biayaLain = Number(record.biayaLainnya) || 0;
    const totalBersih = record.total - totalPot - biayaLain;

    const updated: RentalRecord = {
      ...record,
      potonganPerHari: parsed,
      totalPotongan: totalPot,
      totalBersih,
      updatedAt: new Date().toISOString(),
    };
    onUpdateRecord(updated);
  };

  // Batch update all records' Potongan Harian
  const handleApplyBatchDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseAmount(batchDeductionInput);
    safeRecords.forEach((record) => {
      const totalPot = record.jumlahHari * newRate;
      const biayaLain = Number(record.biayaLainnya) || 0;
      const totalBersih = record.total - totalPot - biayaLain;
      onUpdateRecord({
        ...record,
        potonganPerHari: newRate,
        totalPotongan: totalPot,
        totalBersih,
        updatedAt: new Date().toISOString(),
      });
    });
    setIsBatchDeductionModalOpen(false);
  };

  // Quick inline update for Biaya Lainnya without full edit mode
  const handleQuickBiayaLainChange = (record: RentalRecord, value: string) => {
    const parsed = value === '' ? 0 : parseAmount(value);
    const potPerHari = record.potonganPerHari ?? defaultPotongan;
    const totalPot = record.jumlahHari * potPerHari;
    const totalBersih = record.total - totalPot - parsed;

    const updated: RentalRecord = {
      ...record,
      biayaLainnya: parsed,
      totalBersih,
      updatedAt: new Date().toISOString(),
    };
    onUpdateRecord(updated);
  };

  const handleQuickKetBiayaChange = (record: RentalRecord, value: string) => {
    const updated: RentalRecord = {
      ...record,
      ketBiayaLainnya: value,
      updatedAt: new Date().toISOString(),
    };
    onUpdateRecord(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };

  // Calculations
  const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
  const grandTotalSewa = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const grandTotalPotongan = safeRecords.reduce((sum, r) => {
    const pot = r.totalPotongan !== undefined ? r.totalPotongan : (r.jumlahHari * (r.potonganPerHari ?? defaultPotongan));
    return sum + pot;
  }, 0);
  const grandTotalBiayaLain = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);
  const grandTotalBersih = grandTotalSewa - grandTotalPotongan - grandTotalBiayaLain;

  const isYellow = tableTheme === 'yellow-classic';

  return (
    <div className="space-y-6 mb-8">
      
      {/* Top View Selector & Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            Tampilan Tabel:
          </span>
          <button
            id="tab-view-separated"
            onClick={() => setViewMode('separated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'separated'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2 Tabel Terpisah (Rekomendasi)</span>
          </button>
          
          <button
            id="tab-view-rental"
            onClick={() => setViewMode('rental-only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'rental-only'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>1. Data Sewa Saja</span>
          </button>

          <button
            id="tab-view-deductions"
            onClick={() => setViewMode('deductions-only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'deductions-only'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>2. Potongan & Biaya Lain Saja</span>
          </button>

          <button
            id="tab-view-combined"
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'combined'
                ? 'bg-slate-800 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Gabungan</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            Tema: {isYellow ? '🟡 Kuning (Kwitansi)' : '⚪ Modern'}
          </button>

          <button
            id="btn-table-add-row"
            onClick={onOpenAddModal}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Periode</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABEL 1: DATA PENERIMAAN SEWA DAPUR (Murni Sesuai Dokumen & Foto Asli) */}
      {/* ========================================================================= */}
      {(viewMode === 'separated' || viewMode === 'rental-only') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                Tabel 1: Data Penerimaan Sewa Dapur
              </span>
              <span className="text-xs text-amber-700 font-medium hidden sm:inline">
                (Mencatat jumlah hari & penerimaan kotor sewa dapur)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              {safeRecords.length} Periode
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="table-penerimaan-sewa-murni" className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className={
                  isYellow 
                    ? 'bg-[#FFFF00] text-black border-y-2 border-black font-extrabold tracking-wide text-xs uppercase' 
                    : 'bg-slate-900 text-white border-y border-slate-800 font-bold text-xs uppercase'
                }>
                  <th className="py-2.5 px-3 border border-slate-300 text-center w-12">NO</th>
                  <th className="py-2.5 px-3 border border-slate-300 min-w-[140px]">PERIODE</th>
                  <th className="py-2.5 px-2 border border-slate-300 text-center min-w-[90px]">JUMLAH HARI</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right min-w-[130px]">SEWA PERHARI</th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right min-w-[140px]">TOTAL</th>
                  <th className="py-2.5 px-3 border border-slate-300 min-w-[120px]">Ket</th>
                  <th className="py-2.5 px-2 border border-slate-300 text-center w-24 print:hidden">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {safeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      <p className="font-medium text-slate-700">Belum ada data periode sewa yang dicatat.</p>
                    </td>
                  </tr>
                ) : (
                  safeRecords.map((record, index) => {
                    const isEditing = editingId === record.id;
                    if (isEditing) {
                      const currentHari = Number(editRowData.jumlahHari) || 0;
                      const currentSewa = Number(editRowData.sewaPerHari) || 0;
                      const calculatedTotal = currentHari * currentSewa;

                      return (
                        <tr key={record.id} className="bg-indigo-50/70 border-2 border-indigo-500">
                          <td className="py-2 px-2 border border-slate-300 text-center font-bold text-slate-800">
                            {index + 1}
                          </td>
                          <td className="py-2 px-2 border border-slate-300">
                            <input
                              type="text"
                              value={editRowData.periode || ''}
                              onChange={(e) => setEditRowData({ ...editRowData, periode: e.target.value })}
                              onKeyDown={handleKeyDown}
                              placeholder="10-11MEI"
                              className="w-full px-2 py-1 bg-white border border-indigo-400 rounded text-xs font-semibold uppercase"
                              autoFocus
                            />
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center">
                            <input
                              type="number"
                              min="0"
                              value={editRowData.jumlahHari !== undefined ? editRowData.jumlahHari : ''}
                              onChange={(e) => setEditRowData({ ...editRowData, jumlahHari: e.target.value === '' ? 0 : Number(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              placeholder="6"
                              className="w-16 px-1.5 py-1 bg-white border border-indigo-400 rounded text-xs font-bold text-center"
                            />
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-right">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={editRowData.sewaPerHari ?? ''}
                              onChange={(e) => setEditRowData({ ...editRowData, sewaPerHari: Number(e.target.value) })}
                              onKeyDown={handleKeyDown}
                              className="w-28 px-1.5 py-1 bg-white border border-indigo-400 rounded text-xs font-semibold text-right"
                            />
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-right font-bold text-slate-900 bg-indigo-100/50">
                            {formatRupiah(calculatedTotal)}
                          </td>
                          <td className="py-2 px-2 border border-slate-300">
                            <input
                              type="text"
                              value={editRowData.keterangan || ''}
                              onChange={(e) => setEditRowData({ ...editRowData, keterangan: e.target.value })}
                              onKeyDown={handleKeyDown}
                              placeholder="Keterangan..."
                              className="w-full px-1.5 py-1 bg-white border border-indigo-400 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-center print:hidden">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={saveInlineEdit} className="p-1 rounded bg-emerald-600 text-white" title="Simpan">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={cancelInlineEdit} className="p-1 rounded bg-slate-200 text-slate-700" title="Batal">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-2.5 px-3 border border-slate-200 text-center font-medium text-slate-700">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900 tracking-tight">
                          <div className="flex items-center justify-between">
                            <span>{record.periode}</span>
                            {record.penyewa && (
                              <span className="text-[10px] font-normal text-slate-500 ml-1.5 italic">
                                ({record.penyewa})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 border border-slate-200 text-center font-semibold text-slate-800">
                          {record.jumlahHari === 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Periode Libur (0 Hari Kerja)">
                              0 (Libur)
                            </span>
                          ) : (
                            record.jumlahHari
                          )}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-medium text-slate-800 tabular-nums">
                          {formatRupiah(record.sewaPerHari)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-bold text-slate-950 tabular-nums bg-amber-50/30">
                          {formatRupiah(record.total)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-slate-700">
                          {record.keterangan ? (
                            <span className="text-xs">{record.keterangan}</span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 border border-slate-200 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startInlineEdit(record)}
                              className="p-1 rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit Baris Ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDuplicateRecord(record)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Duplikasi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {safeRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-amber-100/70 font-extrabold text-slate-900 border-t-2 border-black">
                    <td className="py-3 px-3 border border-slate-300 text-center font-black">TOTAL</td>
                    <td className="py-3 px-3 border border-slate-300">{safeRecords.length} Periode</td>
                    <td className="py-3 px-2 border border-slate-300 text-center text-slate-950 font-black text-sm">
                      {totalHari} Hari
                    </td>
                    <td className="py-3 px-3 border border-slate-300 text-right text-slate-500 text-xs italic">-</td>
                    <td className="py-3 px-3 border border-slate-300 text-right text-slate-950 text-base tabular-nums bg-amber-200/80 font-black">
                      Rp {formatRupiah(grandTotalSewa)}
                    </td>
                    <td className="py-3 px-3 border border-slate-300 text-xs text-slate-600">-</td>
                    <td className="py-3 px-2 border border-slate-300 print:hidden"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABEL 2: DATA POTONGAN HARIAN (Rp 1.200.000) & BIAYA LAINNYA (Terpisah)   */}
      {/* ========================================================================= */}
      {(viewMode === 'separated' || viewMode === 'deductions-only') && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-rose-50/80 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                Tabel 2: Rincian Potongan Harian (Rp {formatRupiah(defaultPotongan)} / Hari) & Biaya Lainnya
              </span>
              <span className="text-xs text-rose-700 font-medium hidden sm:inline">
                (Nominal potongan per hari dapat diedit langsung di tabel atau per periode)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setBatchDeductionInput(formatRupiah(defaultPotongan));
                  setIsBatchDeductionModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ubah nilai potongan harian untuk semua periode sekaligus"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Ubah Semua Potongan</span>
              </button>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Buka Pengaturan Tarif Standar Potongan Harian"
                >
                  <Settings className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tarif Standar: Rp {formatRupiah(defaultPotongan)}/hr</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table id="table-potongan-biaya-lain" className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-rose-900 text-white border-y border-rose-950 font-bold text-xs uppercase">
                  <th className="py-2.5 px-3 border border-rose-800 text-center w-12">NO</th>
                  <th className="py-2.5 px-3 border border-rose-800 min-w-[130px]">PERIODE</th>
                  <th className="py-2.5 px-2 border border-rose-800 text-center min-w-[85px]">JUMLAH HARI</th>
                  <th className="py-2.5 px-3 border border-rose-800 text-right min-w-[170px] bg-rose-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-rose-200 font-normal">Ketik utk edit:</span>
                      <span>POTONGAN / HARI</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 border border-rose-800 text-right min-w-[135px] bg-rose-950 font-black">TOTAL POTONGAN</th>
                  <th className="py-2.5 px-3 border border-rose-800 text-right min-w-[135px] bg-amber-900/60 font-black">
                    BIAYA LAIN-LAIN
                  </th>
                  <th className="py-2.5 px-3 border border-rose-800 min-w-[130px] bg-amber-950/40">KET BIAYA LAIN</th>
                  <th className="py-2.5 px-3 border border-rose-800 text-right min-w-[140px] bg-emerald-900 font-black">
                    SISA BERSIH
                  </th>
                  <th className="py-2.5 px-2 border border-rose-800 text-center min-w-[100px] print:hidden">
                    MENU EDIT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {safeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-500">
                      <p className="font-medium text-slate-700">Belum ada data potongan tercatat.</p>
                    </td>
                  </tr>
                ) : (
                  safeRecords.map((record, index) => {
                    const potPerHari = record.potonganPerHari !== undefined 
                      ? record.potonganPerHari 
                      : defaultPotongan;
                    
                    const totalPotongan = record.totalPotongan !== undefined 
                      ? record.totalPotongan 
                      : (record.jumlahHari * potPerHari);
                    
                    const biayaLain = Number(record.biayaLainnya) || 0;
                    const totalBersih = record.totalBersih !== undefined 
                      ? record.totalBersih 
                      : (record.total - totalPotongan - biayaLain);

                    const isCustomPotongan = record.potonganPerHari !== undefined && record.potonganPerHari !== defaultPotongan;

                    return (
                      <tr key={record.id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-2.5 px-3 border border-slate-200 text-center font-medium text-slate-700">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900">
                          <div className="flex items-center justify-between gap-1">
                            <span>{record.periode}</span>
                            {isCustomPotongan && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300" title="Tarif potongan periode ini disesuaikan manual">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 border border-slate-200 text-center font-semibold text-slate-800">
                          {record.jumlahHari === 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Periode Libur (0 Hari Kerja)">
                              0 (Libur)
                            </span>
                          ) : (
                            record.jumlahHari
                          )}
                        </td>
                        
                        {/* EDITABLE POTONGAN / HARI */}
                        <td className="py-1.5 px-2 border border-slate-200 text-right bg-rose-50/30">
                          <div className="space-y-1">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 pointer-events-none">
                                Rp
                              </span>
                              <input
                                type="text"
                                value={potPerHari > 0 ? formatRupiah(potPerHari) : (potPerHari === 0 ? '0' : '')}
                                placeholder="1.200.000"
                                onChange={(e) => handleQuickPotonganPerHariChange(record, e.target.value)}
                                className="w-full pl-7 pr-2 py-1 text-right text-xs font-bold text-rose-800 bg-white hover:bg-rose-50/40 focus:bg-white border border-rose-300 hover:border-rose-500 rounded focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                                title="Ketik nominal potongan per hari untuk periode ini"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickPotonganPerHariChange(record, '0')}
                                className="text-[9px] px-1 py-0.2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                                title="Set 0 (tanpa potongan harian)"
                              >
                                Rp 0
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickPotonganPerHariChange(record, String(defaultPotongan))}
                                className="text-[9px] px-1 py-0.2 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold cursor-pointer"
                                title={`Set standar default (Rp ${formatRupiah(defaultPotongan)})`}
                              >
                                Standar ({formatRupiah(defaultPotongan)})
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 border border-slate-200 text-right font-black text-rose-700 tabular-nums bg-rose-50/50">
                          - Rp {formatRupiah(totalPotongan)}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-200 text-right bg-amber-50/30">
                          <input
                            type="text"
                            value={biayaLain > 0 ? formatRupiah(biayaLain) : ''}
                            placeholder="0 (Isi Biaya)"
                            onChange={(e) => handleQuickBiayaLainChange(record, e.target.value)}
                            className="w-full px-2 py-1 text-right text-xs font-semibold text-amber-900 bg-white hover:bg-amber-50 focus:bg-white border border-amber-200 hover:border-amber-400 rounded focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                            title="Ketik nominal biaya lain untuk periode ini"
                          />
                        </td>
                        <td className="py-1.5 px-2 border border-slate-200 bg-amber-50/10">
                          <input
                            type="text"
                            value={record.ketBiayaLainnya || ''}
                            placeholder="Keterangan..."
                            onChange={(e) => handleQuickKetBiayaChange(record, e.target.value)}
                            className="w-full px-2 py-1 text-xs text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                            title="Keterangan biaya lain"
                          />
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-black text-emerald-800 tabular-nums bg-emerald-50/50">
                          Rp {formatRupiah(totalBersih)}
                        </td>

                        {/* MENU EDIT / AKSI */}
                        <td className="py-2 px-2 border border-slate-200 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(record)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-950 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Buka form edit lengkap untuk periode ini (ubah tarif, hari, tanggal, potongan & biaya)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            {isCustomPotongan && (
                              <button
                                type="button"
                                onClick={() => handleQuickPotonganPerHariChange(record, String(defaultPotongan))}
                                className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                title={`Reset potongan ke standar (Rp ${formatRupiah(defaultPotongan)}/hr)`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
              {safeRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-rose-100/70 font-extrabold text-slate-900 border-t-2 border-rose-900">
                    <td className="py-3 px-3 border border-slate-300 text-center font-black">TOTAL</td>
                    <td className="py-3 px-3 border border-slate-300">{safeRecords.length} Periode</td>
                    <td className="py-3 px-2 border border-slate-300 text-center font-black text-sm">{totalHari} Hari</td>
                    <td className="py-3 px-3 border border-slate-300 text-right text-rose-800 font-bold text-xs">
                      Rata-rata: @{formatRupiah(Math.round(grandTotalPotongan / (totalHari || 1)))}/hr
                    </td>
                    <td className="py-3 px-3 border border-slate-300 text-right text-rose-800 font-black tabular-nums bg-rose-200/80 text-base">
                      - Rp {formatRupiah(grandTotalPotongan)}
                    </td>
                    <td className="py-3 px-2 border border-slate-300 text-right text-amber-800 font-black tabular-nums bg-amber-100/80 text-base">
                      - Rp {formatRupiah(grandTotalBiayaLain)}
                    </td>
                    <td className="py-3 px-2 border border-slate-300 text-xs text-slate-600">Total Biaya Lain</td>
                    <td className="py-3 px-3 border border-slate-300 text-right text-emerald-900 text-base tabular-nums bg-emerald-200/80 font-black">
                      Rp {formatRupiah(grandTotalBersih)}
                    </td>
                    <td className="py-3 px-2 border border-slate-300 print:hidden text-center text-xs text-slate-500 font-normal">
                      {safeRecords.length} Baris
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABEL GABUNGAN (JIKA USER MEMILIH TAMPILAN SEMUA KOLOM) */}
      {/* ========================================================================= */}
      {viewMode === 'combined' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Tabel Gabungan: Sewa Dapur, Potongan Harian & Biaya Lainnya
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-y border-slate-800 font-bold text-xs uppercase">
                  <th className="py-2 px-2 border border-slate-800 text-center w-10">NO</th>
                  <th className="py-2 px-2 border border-slate-800">PERIODE</th>
                  <th className="py-2 px-2 border border-slate-800 text-center">HARI</th>
                  <th className="py-2 px-2 border border-slate-800 text-right">SEWA/HARI</th>
                  <th className="py-2 px-2 border border-slate-800 text-right">TOTAL SEWA</th>
                  <th className="py-2 px-2 border border-slate-800 text-right bg-rose-900">POTONGAN</th>
                  <th className="py-2 px-2 border border-slate-800 text-right bg-amber-900">BIAYA LAIN</th>
                  <th className="py-2 px-2 border border-slate-800 text-right bg-emerald-900">SISA BERSIH</th>
                  <th className="py-2 px-2 border border-slate-800 text-center print:hidden">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safeRecords.map((r, idx) => {
                  const potPerHari = r.potonganPerHari ?? defaultPotongan;
                  const totalPot = r.jumlahHari * potPerHari;
                  const biayaLain = Number(r.biayaLainnya) || 0;
                  const bersih = r.total - totalPot - biayaLain;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 border border-slate-200 text-center">{idx + 1}</td>
                      <td className="py-2 px-2 border border-slate-200 font-bold">{r.periode}</td>
                      <td className="py-2 px-2 border border-slate-200 text-center">
                        {r.jumlahHari === 0 ? (
                          <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            0 (Libur)
                          </span>
                        ) : (
                          r.jumlahHari
                        )}
                      </td>
                      <td className="py-2 px-2 border border-slate-200 text-right">{formatRupiah(r.sewaPerHari)}</td>
                      <td className="py-2 px-2 border border-slate-200 text-right font-bold">{formatRupiah(r.total)}</td>
                      <td className="py-2 px-2 border border-slate-200 text-right text-rose-700 font-bold">- {formatRupiah(totalPot)}</td>
                      <td className="py-2 px-2 border border-slate-200 text-right text-amber-700 font-bold">{biayaLain > 0 ? `- ${formatRupiah(biayaLain)}` : '-'}</td>
                      <td className="py-2 px-2 border border-slate-200 text-right font-black text-emerald-800">{formatRupiah(bersih)}</td>
                      <td className="py-2 px-2 border border-slate-200 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEditModal(r)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                            title="Edit Periode & Potongan"
                          >
                            <Edit3 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button 
                            onClick={() => onDeleteRecord(r.id)} 
                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                            title="Hapus Periode"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT POTONGAN HARIAN MASSAL (BATCH UPDATE)                         */}
      {/* ========================================================================= */}
      {isBatchDeductionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <h3 className="font-bold text-base">Ubah Potongan Semua Periode</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchDeductionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-rose-700 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBatchDeduction} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Terapkan nominal tarif potongan harian baru ke <strong>seluruh {safeRecords.length} periode</strong> yang ada dalam daftar secara otomatis.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nominal Potongan / Hari (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-500 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={batchDeductionInput}
                    onChange={(e) => setBatchDeductionInput(e.target.value)}
                    placeholder="1.200.000"
                    className="w-full pl-10 pr-3 py-2.5 bg-rose-50/40 border border-rose-300 rounded-xl text-rose-900 font-bold text-base focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500">Pilihan cepat:</span>
                  <button
                    type="button"
                    onClick={() => setBatchDeductionInput(formatRupiah(1200000))}
                    className="text-[10px] px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold cursor-pointer"
                  >
                    1.200.000 (Standar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchDeductionInput(formatRupiah(1000000))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    1.000.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchDeductionInput('0')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Rp 0
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Kalkulasi <strong>Total Potongan</strong> dan <strong>Sisa Bersih</strong> pada setiap baris akan langsung dihitung ulang otomatis.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchDeductionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan ke Semua Periode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ringkasan Neraca Perhitungan Akhir */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold">Formula Perhitungan Sisa Bersih:</div>
          <div className="text-xs text-slate-200 mt-0.5">
            [Total Penerimaan Sewa Dapur] - [Total Potongan Harian (Rp {formatRupiah(defaultPotongan)}/hr)] - [Total Biaya Lainnya]
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Sewa Kotor:</div>
            <div className="font-bold text-amber-300 text-sm">Rp {formatRupiah(grandTotalSewa)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-rose-300">Total Potongan & Biaya:</div>
            <div className="font-bold text-rose-400 text-sm">- Rp {formatRupiah(grandTotalPotongan + grandTotalBiayaLain)}</div>
          </div>
          <div className="text-right pl-4 border-l border-slate-700">
            <div className="text-xs text-emerald-400 font-bold uppercase">Sisa Bersih Akhir:</div>
            <div className="font-black text-emerald-400 text-lg">Rp {formatRupiah(grandTotalBersih)}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

