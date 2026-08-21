/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DatabaseSwitcher } from './components/DatabaseSwitcher';
import { SummaryCards } from './components/SummaryCards';
import { RentalTable } from './components/RentalTable';
import { QuickAddRow } from './components/QuickAddRow';
import { ExtraExpensesSection } from './components/ExtraExpensesSection';
import { RentalFormModal } from './components/RentalFormModal';
import { FilterBar } from './components/FilterBar';
import { SettingsModal } from './components/SettingsModal';
import { NewDatabaseModal } from './components/NewDatabaseModal';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import { PrintReportView } from './components/PrintReportView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ExportModal } from './components/ExportModal';
import { 
  RentalRecord, 
  AppSettings, 
  ExtraExpense, 
  KitchenDatabase, 
  NewDatabaseMode 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_SAMPLE_DATA, 
  exportToExcel, 
  exportToCSV, 
  copyAsFormattedText, 
  formatRupiah 
} from './utils/formatters';
import { 
  ChefHat, 
  FileSpreadsheet, 
  PlusCircle, 
  Info, 
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

const STORAGE_KEY_DATABASES = 'sppg_kitchen_databases_v2';
const STORAGE_KEY_ACTIVE_DB_ID = 'sppg_active_kitchen_id_v2';
const STORAGE_KEY_THEME = 'sppg_table_theme_v1';

interface ConfirmDialogState {
  isOpen: boolean;
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
  onConfirm: () => void;
}

export default function App() {
  // State: Databases (Multi-Kitchen Workspace)
  const [databases, setDatabases] = useState<KitchenDatabase[]>(() => {
    try {
      const savedDbs = localStorage.getItem(STORAGE_KEY_DATABASES);
      if (savedDbs) {
        const parsed = JSON.parse(savedDbs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading databases from localStorage', e);
    }

    // Fallback: Migrate from legacy single-kitchen storage if exists
    let legacyRecords = INITIAL_SAMPLE_DATA;
    let legacyExpenses: ExtraExpense[] = [];
    let legacySettings = DEFAULT_SETTINGS;

    try {
      const savedRecs = localStorage.getItem('sppg_rental_records_v1');
      if (savedRecs) {
        const p = JSON.parse(savedRecs);
        if (Array.isArray(p) && p.length > 0) legacyRecords = p;
      }
      const savedExps = localStorage.getItem('sppg_extra_expenses_v1');
      if (savedExps) legacyExpenses = JSON.parse(savedExps);
      const savedSetts = localStorage.getItem('sppg_app_settings_v1');
      if (savedSetts) legacySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSetts) };
    } catch (e) {}

    const initialMainDb: KitchenDatabase = {
      id: 'dapur-utama-1',
      name: 'Dapur 1 SPPG (Dapur Utama)',
      description: 'Database pencatatan sewa dapur periode utama',
      color: 'indigo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      records: legacyRecords,
      extraExpenses: legacyExpenses,
      settings: legacySettings,
    };

    return [initialMainDb];
  });

  // State: Active Database ID
  const [activeDatabaseId, setActiveDatabaseId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_DB_ID);
      if (savedId) return savedId;
    } catch (e) {}
    return 'dapur-utama-1';
  });

  // State Penanda: Menghindari push/write sebelum data ditarik dari cloud
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

  // Computed Active Database & Shortcuts
  const activeDatabase = useMemo(() => {
    const found = databases.find((d) => d.id === activeDatabaseId);
    return found || databases[0];
  }, [databases, activeDatabaseId]);

  const records = activeDatabase.records || [];
  const extraExpenses = activeDatabase.extraExpenses || [];
  const settings = activeDatabase.settings || DEFAULT_SETTINGS;

  // State: Theme
  const [tableTheme, setTableTheme] = useState<'yellow-classic' | 'modern-clean'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'modern-clean' || saved === 'yellow-classic') {
        return saved;
      }
    } catch (e) {}
    return 'yellow-classic';
  });

  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Modals & Popups
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RentalRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewDatabaseModalOpen, setIsNewDatabaseModalOpen] = useState(false);
  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState(false);

  // Custom Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATABASES, JSON.stringify(databases));
    } catch (e) {
      console.error('Error saving databases to localStorage', e);
    }
  }, [databases]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_DB_ID, activeDatabaseId);
    } catch (e) {}
  }, [activeDatabaseId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, tableTheme);
    } catch (e) {}
  }, [tableTheme]);

  // =========================================================================
  // AUTO-PULL: Ambil data terbaru dari GitHub metadata.json saat web dibuka
  // =========================================================================
  useEffect(() => {
    const fetchFromGitHub = async () => {
      const OWNER = 'feriiputr3-creator';
      const REPO = 'creator-sewadapur';
      const FILE_PATH = 'metadata.json';
      const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

      try {
        const response = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
          {
            headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
          }
        );

        if (response.ok) {
          const fileData = await response.json();
          // Dekode string Base64 dari GitHub API
          const jsonString = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
          const parsed = JSON.parse(jsonString);

          if (parsed && Array.isArray(parsed.databases) && parsed.databases.length > 0) {
            setDatabases(parsed.databases);
            if (parsed.activeDatabaseId) {
              setActiveDatabaseId(parsed.activeDatabaseId);
            }
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data terbaru dari GitHub:', err);
      } finally {
        setIsLoadedFromCloud(true);
      }
    };

    fetchFromGitHub();
  }, []);

  // =========================================================================
  // AUTO-PUSH: Sinkronkan perubahan data lokal kembali ke GitHub
  // =========================================================================
  const updateMetadataJsonOnGitHub = async (dataPayload: any) => {
    const OWNER = 'feriiputr3-creator';
    const REPO = 'creator-sewadapur';
    const FILE_PATH = 'metadata.json';
    const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

    if (!TOKEN) {
      console.warn('VITE_GITHUB_TOKEN belum dikonfigurasi di Vercel.');
      return;
    }

    try {
      const getFile = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      const fileData = await getFile.json();

      const jsonString = JSON.stringify(dataPayload, null, 2);
      const contentBase64 = btoa(unescape(encodeURIComponent(jsonString)));

      const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Otomatis sinkronisasi data dari web app',
            content: contentBase64,
            sha: fileData.sha,
          }),
        }
      );

      if (response.ok) {
        console.log('Data berhasil tersimpan otomatis di GitHub');
      } else {
        console.error('Gagal sinkronkan data ke GitHub:', await response.json());
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat simpan ke GitHub:', err);
    }
  };

  // Auto-sync berjalan hanya SETELAH data awal dari cloud selesai ditarik (isLoadedFromCloud = true)
  useEffect(() => {
    if (!isLoadedFromCloud) return;

    const timer = setTimeout(() => {
      if (databases && databases.length > 0) {
        updateMetadataJsonOnGitHub({
          version: '2.0',
          updatedAt: new Date().toISOString(),
          activeDatabaseId,
          databases,
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [databases, activeDatabaseId, isLoadedFromCloud]);

  const addToast = (type: 'success' | 'info' | 'error', text: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Update Active Database State
  const updateActiveDatabase = (
    updater: (currentDb: KitchenDatabase) => KitchenDatabase
  ) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.id === activeDatabase.id) {
          return updater({ ...db, updatedAt: new Date().toISOString() });
        }
        return db;
      })
    );
  };

  // =========================================================================
  // MULTI-DATABASE HANDLERS
  // =========================================================================

  const handleCreateDatabase = (
    name: string,
    mode: NewDatabaseMode,
    customSettings?: Partial<AppSettings>,
    color?: string
  ) => {
    const newId = `db-${Date.now()}`;
    const mergedSettings: AppSettings = {
      ...activeDatabase.settings,
      ...(customSettings || {}),
      namaInstansi: name.toUpperCase(),
    };

    let newRecords: RentalRecord[] = [];

    if (mode === 'retain-periods-clear-days') {
      newRecords = records.map((r, idx) => {
        const sewaRate = mergedSettings.defaultSewaPerHari || 6000000;
        const potRate = mergedSettings.defaultPotonganPerHari || 1200000;
        return {
          id: `rec-${newId}-${idx + 1}`,
          periode: r.periode,
          startDate: r.startDate,
          endDate: r.endDate,
          jumlahHari: 0,
          sewaPerHari: sewaRate,
          total: 0,
          potonganPerHari: potRate,
          totalPotongan: 0,
          biayaLainnya: 0,
          ketBiayaLainnya: '',
          totalBersih: 0,
          keterangan: '',
          penyewa: '',
          statusBayar: 'Belum Lunas',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } else if (mode === 'clone-all') {
      newRecords = records.map((r, idx) => ({
        ...r,
        id: `rec-${newId}-${idx + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } else {
      newRecords = [];
    }

    const newDb: KitchenDatabase = {
      id: newId,
      name,
      description: `Database untuk ${name}`,
      color: color || 'indigo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      records: newRecords,
      extraExpenses: [],
      settings: mergedSettings,
    };

    setDatabases((prev) => [...prev, newDb]);
    setActiveDatabaseId(newId);

    if (mode === 'retain-periods-clear-days') {
      addToast(
        'success',
        `Database "${name}" berhasil dibuat! Struktur ${newRecords.length} periode tersusun rapi dengan jumlah hari kosong (0 hari) siap diisi.`
      );
    } else {
      addToast('success', `Database "${name}" berhasil dibuat dan aktif.`);
    }
  };

  const handleDuplicateStructure = (sourceDb: KitchenDatabase) => {
    const newName = `Dapur ${databases.length + 1} (${sourceDb.name})`;
    const newId = `db-${Date.now()}`;
    const sewaRate = sourceDb.settings.defaultSewaPerHari || 6000000;
    const potRate = sourceDb.settings.defaultPotonganPerHari || 1200000;

    const clonedRecords: RentalRecord[] = sourceDb.records.map((r, idx) => ({
      id: `rec-${newId}-${idx + 1}`,
      periode: r.periode,
      startDate: r.startDate,
      endDate: r.endDate,
      jumlahHari: 0,
      sewaPerHari: sewaRate,
      total: 0,
      potonganPerHari: potRate,
      totalPotongan: 0,
      biayaLainnya: 0,
      ketBiayaLainnya: '',
      totalBersih: 0,
      keterangan: '',
      penyewa: '',
      statusBayar: 'Belum Lunas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newDb: KitchenDatabase = {
      id: newId,
      name: newName,
      description: `Salinan struktur periode dari ${sourceDb.name}`,
      color: 'emerald',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      records: clonedRecords,
      extraExpenses: [],
      settings: { ...sourceDb.settings, namaInstansi: newName.toUpperCase() },
    };

    setDatabases((prev) => [...prev, newDb]);
    setActiveDatabaseId(newId);
    addToast(
      'success',
      `Database baru "${newName}" berhasil dibuat dengan ${clonedRecords.length} periode tersusun (0 hari).`
    );
  };

  const handleRenameDatabase = (id: string, newName: string) => {
    setDatabases((prev) =>
      prev.map((db) =>
        db.id === id ? { ...db, name: newName, updatedAt: new Date().toISOString() } : db
      )
    );
    addToast('success', `Nama database diubah menjadi "${newName}".`);
  };

  const handleDeleteDatabase = (id: string) => {
    if (databases.length <= 1) {
      addToast('error', 'Tidak dapat menghapus database satu-satunya.');
      return;
    }
    const target = databases.find((d) => d.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Database Dapur',
      message: `Apakah Anda yakin ingin menghapus database "${target.name}" beserta seluruh (${target.records.length}) data periode di dalamnya? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Database',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        setDatabases((prev) => {
          const nextDbs = prev.filter((d) => d.id !== id);
          if (activeDatabaseId === id) {
            setActiveDatabaseId(nextDbs[0].id);
          }
          return nextDbs;
        });
        addToast('info', `Database "${target.name}" telah dihapus.`);
      },
    });
  };

  const handleExportAllDatabases = () => {
    try {
      const dataStr = JSON.stringify(
        {
          version: '2.0',
          exportedAt: new Date().toISOString(),
          activeDatabaseId,
          databases,
        },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Backup_Multi_Dapur_SPPG_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
      addToast('success', 'Semua database dapur berhasil dicadangkan (JSON).');
    } catch (err) {
      addToast('error', 'Gagal mencadangkan database.');
    }
  };

  const handleImportDatabases = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.databases) && parsed.databases.length > 0) {
        setDatabases(parsed.databases);
        if (parsed.activeDatabaseId) {
          setActiveDatabaseId(parsed.activeDatabaseId);
        } else {
          setActiveDatabaseId(parsed.databases[0].id);
        }
        addToast(
          'success',
          `${parsed.databases.length} database dapur berhasil dipulihkan dari file backup.`
        );
      } else if (Array.isArray(parsed.records)) {
        updateActiveDatabase((cur) => ({
          ...cur,
          records: parsed.records,
          extraExpenses: parsed.extraExpenses || [],
          settings: parsed.settings ? { ...cur.settings, ...parsed.settings } : cur.settings,
        }));
        addToast('success', `${parsed.records.length} data sewa berhasil dipulihkan.`);
      } else {
        addToast('error', 'Format backup JSON tidak dikenali.');
      }
    } catch (e) {
      addToast('error', 'Gagal memproses file JSON cadangan.');
    }
  };

  // =========================================================================
  // RECORD & PERIOD HANDLERS
  // =========================================================================

  const handleSaveRecord = (
    data: Omit<RentalRecord, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();

    if (editId) {
      updateActiveDatabase((cur) => ({
        ...cur,
        records: cur.records.map((item) =>
          item.id === editId ? { ...item, ...data, updatedAt: now } : item
        ),
      }));
      addToast('success', `Periode "${data.periode}" berhasil diperbarui.`);
    } else {
      const newRecord: RentalRecord = {
        ...data,
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: now,
        updatedAt: now,
      };
      updateActiveDatabase((cur) => ({
        ...cur,
        records: [...cur.records, newRecord],
      }));
      addToast(
        'success',
        `Data periode "${data.periode}" (Rp ${formatRupiah(data.total)}) berhasil ditambahkan.`
      );
    }
  };

  const handleUpdateRecord = (updated: RentalRecord) => {
    updateActiveDatabase((cur) => ({
      ...cur,
      records: cur.records.map((item) => (item.id === updated.id ? updated : item)),
    }));
  };

  const handleDeleteRecord = (id: string) => {
    const target = records.find((r) => r.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Data Periode',
      message: `Apakah Anda yakin ingin menghapus data sewa periode "${target.periode}"? Data yang dihapus tidak dapat dipulihkan.`,
      recordDetails: {
        periode: target.periode,
        jumlahHari: target.jumlahHari,
        total: target.total,
        keterangan: target.keterangan || (target.penyewa ? `Penyewa: ${target.penyewa}` : undefined),
      },
      confirmText: 'Ya, Hapus Data',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        updateActiveDatabase((cur) => ({
          ...cur,
          records: cur.records.filter((r) => r.id !== id),
        }));
        addToast('info', `Periode "${target.periode}" telah dihapus.`);
      },
    });
  };

  const handleDuplicateRecord = (record: RentalRecord) => {
    const duplicated: RentalRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      periode: `${record.periode} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateActiveDatabase((cur) => ({
      ...cur,
      records: [...cur.records, duplicated],
    }));
    addToast('success', `Duplikasi berhasil: "${duplicated.periode}" ditambahkan.`);
  };

  // Extra Expenses Handlers
  const handleAddExtraExpense = (expense: Omit<ExtraExpense, 'id' | 'createdAt'>) => {
    const newExp: ExtraExpense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    updateActiveDatabase((cur) => ({
      ...cur,
      extraExpenses: [...cur.extraExpenses, newExp],
    }));
    addToast(
      'success',
      `Biaya operasional "${newExp.nama}" (Rp ${formatRupiah(newExp.nominal)}) dicatat.`
    );
  };

  const handleDeleteExtraExpense = (id: string) => {
    const target = extraExpenses.find((e) => e.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Biaya Operasional',
      message: `Hapus catatan biaya "${target.nama}" senilai Rp ${formatRupiah(target.nominal)}?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        updateActiveDatabase((cur) => ({
          ...cur,
          extraExpenses: cur.extraExpenses.filter((e) => e.id !== id),
        }));
        addToast('info', `Biaya "${target.nama}" telah dihapus.`);
      },
    });
  };

  // Open Modals
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record: RentalRecord) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  // Toggle Table Theme
  const handleToggleTheme = () => {
    const nextTheme = tableTheme === 'yellow-classic' ? 'modern-clean' : 'yellow-classic';
    setTableTheme(nextTheme);
    addToast(
      'info',
      nextTheme === 'yellow-classic'
        ? 'Tampilan tabel diubah ke Header Kuning (Standar Dokumen)'
        : 'Tampilan tabel diubah ke Modern Minimalis'
    );
  };

  // Export & Print Actions
  const handleExportExcel = () => {
    if (records.length === 0) {
      addToast('error', 'Tidak ada data untuk diekspor ke Excel.');
      return;
    }
    const success = exportToExcel(records, settings, extraExpenses);
    if (success) {
      addToast('success', 'File Excel (.xlsx) berhasil diunduh.');
    } else {
      addToast('error', 'Gagal membuat file Excel.');
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      addToast('error', 'Tidak ada data untuk diekspor ke CSV.');
      return;
    }
    const success = exportToCSV(records, settings, extraExpenses);
    if (success) {
      addToast('success', 'File CSV (.csv) berhasil diunduh.');
    } else {
      addToast('error', 'Gagal membuat file CSV.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    if (records.length === 0) {
      addToast('error', 'Tidak ada data untuk disalin.');
      return;
    }
    try {
      const formatted = copyAsFormattedText(records, settings, extraExpenses);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      addToast('success', 'Rekap data berhasil disalin (Siap kirim ke WA/Chat)!');
    } catch (err) {
      console.error('Error copying text:', err);
      addToast('info', 'Format rekap disiapkan.');
    }
  };

  // Settings & Backups
  const handleSaveSettings = (newSettings: AppSettings) => {
    updateActiveDatabase((cur) => ({
      ...cur,
      settings: newSettings,
    }));
    addToast('success', 'Pengaturan berhasil diperbarui.');
  };

  const handleExportJsonBackup = () => {
    try {
      const dataStr = JSON.stringify(
        { records, extraExpenses, settings, version: '1.1', databaseName: activeDatabase.name },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Backup_${activeDatabase.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
      addToast('success', 'Cadangan data JSON berhasil diunduh.');
    } catch (err) {
      addToast('error', 'Gagal mengunduh cadangan JSON.');
    }
  };

  const handleImportJsonBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.records)) {
          updateActiveDatabase((cur) => ({
            ...cur,
            records: parsed.records,
            extraExpenses: Array.isArray(parsed.extraExpenses) ? parsed.extraExpenses : cur.extraExpenses,
            settings: parsed.settings ? { ...cur.settings, ...parsed.settings } : cur.settings,
          }));
          addToast('success', `${parsed.records.length} data sewa berhasil dipulihkan.`);
        } else if (Array.isArray(parsed)) {
          updateActiveDatabase((cur) => ({
            ...cur,
            records: parsed,
          }));
          addToast('success', `${parsed.length} data sewa berhasil dipulihkan.`);
        } else {
          addToast('error', 'Format file JSON cadangan tidak valid.');
        }
      } catch (err) {
        addToast('error', 'Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSampleData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Muat Ulang Data Contoh Awal',
      message:
        'Apakah Anda ingin mengembalikan data ke contoh awal? Data perubahan yang belum dicadangkan akan diganti.',
      confirmText: 'Ya, Muat Ulang',
      cancelText: 'Batal',
      isDestructive: false,
      onConfirm: () => {
        updateActiveDatabase((cur) => ({
          ...cur,
          records: INITIAL_SAMPLE_DATA,
          extraExpenses: [],
          settings: DEFAULT_SETTINGS,
        }));
        addToast('info', 'Data awal contoh berhasil dimuat.');
      },
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Seluruh Data Dapur Ini',
      message: `Apakah Anda yakin ingin menghapus SELURUH (${records.length}) data sewa yang tercatat di ${activeDatabase.name}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Kosongkan Semua',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        updateActiveDatabase((cur) => ({
          ...cur,
          records: [],
          extraExpenses: [],
        }));
        addToast('info', 'Seluruh data sewa telah dikosongkan.');
      },
    });
  };

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchSearch =
          searchTerm === '' ||
          r.periode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.penyewa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.ketBiayaLainnya || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter === 'all' || r.statusBayar === statusFilter;

        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'period-asc') {
          return a.periode.localeCompare(b.periode);
        }
        if (sortBy === 'days-desc') {
          return (b.jumlahHari || 0) - (a.jumlahHari || 0);
        }
        if (sortBy === 'total-desc') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortBy === 'total-asc') {
          return (a.total || 0) - (b.total || 0);
        }
        return 0;
      });
  }, [records, searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Header Bar */}
      <Header
        title={settings.namaInstansi || activeDatabase.name}
        subtitle={settings.subJudul || 'Rekapitulasi Data Sewa Dapur Per Periode'}
        onOpenAddModal={handleOpenAddModal}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onCopyText={handleCopyText}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDatabaseManager={() => setIsDatabaseManagerOpen(true)}
      />

      {/* Database & Multi-Kitchen Switcher Workspace Bar */}
      <DatabaseSwitcher
        databases={databases}
        activeDatabase={activeDatabase}
        onSelectDatabase={(id) => setActiveDatabaseId(id)}
        onOpenNewDatabaseModal={() => setIsNewDatabaseModalOpen(true)}
        onOpenDatabaseManager={() => setIsDatabaseManagerOpen(true)}
        onDuplicateStructure={handleDuplicateStructure}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        
        {/* Metric Summary Cards */}
        <SummaryCards 
          records={records} 
          settings={settings}
          extraExpenses={extraExpenses}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Quick Add Row Form */}
        <QuickAddRow
          settings={settings}
          onAddRecord={handleSaveRecord}
        />

        {/* Search, Filter & Sort Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setSortBy('default');
          }}
          totalFiltered={filteredRecords.length}
          totalAll={records.length}
        />

        {/* Rental Table */}
        <RentalTable
          records={filteredRecords}
          settings={settings}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
          onDuplicateRecord={handleDuplicateRecord}
          onOpenEditModal={handleOpenEditModal}
          onOpenAddModal={handleOpenAddModal}
          onOpenSettings={() => setIsSettingsOpen(true)}
          tableTheme={tableTheme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Extra Operational Expenses Section */}
        <ExtraExpensesSection
          extraExpenses={extraExpenses}
          expenses={extraExpenses}
          records={records}
          settings={settings}
          onAddExpense={handleAddExtraExpense}
          onDeleteExpense={handleDeleteExtraExpense}
        />

      </main>

      {/* Printable Report */}
      <PrintReportView 
        records={records} 
        settings={settings}
        extraExpenses={extraExpenses}
      />

      {/* Modal: Full Period Form */}
      <RentalFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        settings={settings}
      />

      {/* Modal: Export Menu */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        settings={settings}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onCopyWhatsApp={handleCopyText}
        onPrintPDF={handlePrint}
        onExportJSON={handleExportJsonBackup}
      />

      {/* Modal: Create New Kitchen Database */}
      <NewDatabaseModal
        isOpen={isNewDatabaseModalOpen}
        onClose={() => setIsNewDatabaseModalOpen(false)}
        currentRecords={records}
        currentSettings={settings}
        existingDatabasesCount={databases.length}
        onCreateDatabase={handleCreateDatabase}
      />

      {/* Modal: Database Manager */}
      <DatabaseManagerModal
        isOpen={isDatabaseManagerOpen}
        onClose={() => setIsDatabaseManagerOpen(false)}
        databases={databases}
        activeDatabaseId={activeDatabaseId}
        onSelectDatabase={(id) => setActiveDatabaseId(id)}
        onOpenNewDatabaseModal={() => setIsNewDatabaseModalOpen(true)}
        onRenameDatabase={handleRenameDatabase}
        onDuplicateStructure={handleDuplicateStructure}
        onDeleteDatabase={handleDeleteDatabase}
        onExportAllDatabases={handleExportAllDatabases}
        onImportDatabases={handleImportDatabases}
      />

      {/* Modal: Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        recordDetails={confirmDialog.recordDetails}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDestructive={confirmDialog.isDestructive}
      />

      {/* Modal: Settings & Backup */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExportJsonBackup={handleExportJsonBackup}
        onImportJsonBackup={handleImportJsonBackup}
        onResetToSampleData={handleResetToSampleData}
        onClearAllData={handleClearAllData}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <ChefHat className="w-4 h-4 text-indigo-600" />
            <span>Sewa Dapur SPPG &copy; {new Date().getFullYear()}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">{activeDatabase.name}</span>
          </div>
          <div>
            Data tersimpan otomatis dan tersinkronisasi dua arah dengan GitHub
          </div>
        </div>
      </footer>

    </div>
  );
}
