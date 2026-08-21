import * as XLSX from 'xlsx';
import { RentalRecord, AppSettings, ExtraExpense } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultSewaPerHari: 6000000,
  defaultPotonganPerHari: 1200000,
  defaultJumlahHari: 6,
  namaInstansi: 'SEWA DAPUR SPPG',
  subJudul: 'Rekapitulasi Data Sewa Dapur Per Periode',
  penanggungJawab: 'Pengelola Dapur SPPG',
  jabatan: 'Koordinator Operasional',
  mataUang: 'IDR',
};

export const INITIAL_SAMPLE_DATA: RentalRecord[] = [
  {
    id: 'rec-1',
    periode: '10-11MEI',
    startDate: '2026-05-10',
    endDate: '2026-05-13',
    jumlahHari: 4,
    sewaPerHari: 6000000,
    total: 24000000,
    keterangan: '',
    statusBayar: 'Lunas',
    penyewa: 'Katering SPPG',
    potonganPerHari: 1200000,
    totalPotongan: 4800000,
    biayaLainnya: 0,
    ketBiayaLainnya: '',
    totalBersih: 19200000,
    createdAt: new Date('2026-05-10').toISOString(),
    updatedAt: new Date('2026-05-10').toISOString(),
  },
  {
    id: 'rec-2',
    periode: '16-20JUNE',
    startDate: '2026-06-16',
    endDate: '2026-06-20',
    jumlahHari: 5,
    sewaPerHari: 6000000,
    total: 30000000,
    keterangan: '',
    statusBayar: 'Lunas',
    penyewa: 'Event Dapur Bersama',
    potonganPerHari: 1200000,
    totalPotongan: 6000000,
    biayaLainnya: 0,
    ketBiayaLainnya: '',
    totalBersih: 24000000,
    createdAt: new Date('2026-06-16').toISOString(),
    updatedAt: new Date('2026-06-16').toISOString(),
  },
  {
    id: 'rec-3',
    periode: '14-18JUNE',
    startDate: '2026-06-14',
    endDate: '2026-06-18',
    jumlahHari: 5,
    sewaPerHari: 6000000,
    total: 30000000,
    keterangan: '',
    statusBayar: 'Lunas',
    penyewa: 'Paket Katering Harian',
    potonganPerHari: 1200000,
    totalPotongan: 6000000,
    biayaLainnya: 0,
    ketBiayaLainnya: '',
    totalBersih: 24000000,
    createdAt: new Date('2026-06-14').toISOString(),
    updatedAt: new Date('2026-06-14').toISOString(),
  },
];

/**
 * Calculate row financials:
 * total = hari * sewaPerHari
 * totalPotongan = hari * potonganPerHari
 * totalBersih = total - totalPotongan - biayaLainnya
 */
export function calculateRecordFinancials(
  jumlahHari: number,
  sewaPerHari: number,
  potonganPerHari: number = 1200000,
  biayaLainnya: number = 0
) {
  const days = Number(jumlahHari) || 0;
  const rate = Number(sewaPerHari) || 0;
  const potRate = Number(potonganPerHari) >= 0 ? Number(potonganPerHari) : 1200000;
  const otherCost = Number(biayaLainnya) || 0;

  const total = days * rate;
  const totalPotongan = days * potRate;
  const totalBersih = total - totalPotongan - otherCost;

  return {
    total,
    potonganPerHari: potRate,
    totalPotongan,
    biayaLainnya: otherCost,
    totalBersih,
  };
}

/**
 * Format numbers as Indonesian Rupiah or clean dot separator format
 * e.g. 6000000 -> "6.000.000" or "Rp 6.000.000"
 */
export function formatRupiah(amount: number | undefined | null, withPrefix: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return withPrefix ? 'Rp 0' : '0';
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(num);

  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Parse a string or raw input into valid integer amount
 */
export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  // Clean all non-digit characters
  const cleaned = input.toString().replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate day difference between two YYYY-MM-DD dates inclusive
 */
export function calculateDaysBetween(startStr?: string, endStr?: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Generate quick period text from start and end dates if user picks dates
 * e.g. "10-14 MEI 2026"
 */
export function generatePeriodeText(startStr?: string, endStr?: string): string {
  if (!startStr) return '';
  const start = new Date(startStr);
  if (isNaN(start.getTime())) return '';

  const indonesianMonths = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
  ];

  if (!endStr || startStr === endStr) {
    return `${start.getDate()} ${indonesianMonths[start.getMonth()]}`;
  }

  const end = new Date(endStr);
  if (isNaN(end.getTime())) {
    return `${start.getDate()} ${indonesianMonths[start.getMonth()]}`;
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()} ${indonesianMonths[start.getMonth()]}`;
  }

  return `${start.getDate()} ${indonesianMonths[start.getMonth()]} - ${end.getDate()} ${indonesianMonths[end.getMonth()]}`;
}

/**
 * Safe client-side file downloader using standard Blob & object URL
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Export data to real Excel (.xlsx) file with full side deductions and net calculations
 */
export function exportToExcel(
  records: RentalRecord[] = [], 
  settings?: AppSettings, 
  extraExpenses: ExtraExpense[] = []
): boolean {
  try {
    const safeRecords = records || [];
    const safeExpenses = extraExpenses || [];
    const defaultPot = settings?.defaultPotonganPerHari || 1200000;

    const tableData = safeRecords.map((item, index) => {
      const potPerHari = item.potonganPerHari !== undefined ? item.potonganPerHari : defaultPot;
      const totalPot = item.totalPotongan !== undefined ? item.totalPotongan : (item.jumlahHari * potPerHari);
      const otherCost = Number(item.biayaLainnya) || 0;
      const netTotal = item.totalBersih !== undefined ? item.totalBersih : (item.total - totalPot - otherCost);

      return {
        'NO': index + 1,
        'PERIODE': item.periode || '-',
        'JUMLAH HARI': Number(item.jumlahHari) || 0,
        'SEWA PER HARI': Number(item.sewaPerHari) || 0,
        'TOTAL SEWA': Number(item.total) || 0,
        'KET': item.keterangan || item.penyewa || '',
        'POTONGAN / HARI': potPerHari,
        'TOTAL POTONGAN': totalPot,
        'BIAYA LAINNYA': otherCost,
        'KET BIAYA LAIN': item.ketBiayaLainnya || '',
        'SISA BERSIH': netTotal,
      };
    });

    // Summary Calculations
    const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
    const grandTotalSewa = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    const grandTotalPotongan = safeRecords.reduce((sum, r) => {
      const pot = r.totalPotongan !== undefined ? r.totalPotongan : (r.jumlahHari * (r.potonganPerHari ?? defaultPot));
      return sum + pot;
    }, 0);
    const grandTotalBiayaLain = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);
    const totalExtraExp = safeExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
    const grandTotalBersih = grandTotalSewa - grandTotalPotongan - grandTotalBiayaLain - totalExtraExp;

    // Add Summary Row
    tableData.push({
      'NO': 'TOTAL' as unknown as number,
      'PERIODE': `${safeRecords.length} Periode`,
      'JUMLAH HARI': totalHari,
      'SEWA PER HARI': 0,
      'TOTAL SEWA': grandTotalSewa,
      'KET': `Rekap Bersih: Rp ${formatRupiah(grandTotalBersih)}`,
      'POTONGAN / HARI': defaultPot,
      'TOTAL POTONGAN': grandTotalPotongan,
      'BIAYA LAINNYA': grandTotalBiayaLain + totalExtraExp,
      'KET BIAYA LAIN': totalExtraExp > 0 ? `Termasuk Pengeluaran Umum Rp ${formatRupiah(totalExtraExp)}` : '',
      'SISA BERSIH': grandTotalBersih,
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // NO
      { wch: 20 }, // PERIODE
      { wch: 14 }, // JUMLAH HARI
      { wch: 18 }, // SEWA PER HARI
      { wch: 18 }, // TOTAL SEWA
      { wch: 16 }, // KET
      { wch: 18 }, // POTONGAN/HARI (1.200.000)
      { wch: 18 }, // TOTAL POTONGAN
      { wch: 16 }, // BIAYA LAINNYA
      { wch: 20 }, // KET BIAYA LAIN
      { wch: 20 }, // SISA BERSIH
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sewa Dapur SPPG');

    // Generate binary array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });

    const fileName = `Rekap_Sewa_Dapur_SPPG_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadBlob(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating XLSX, falling back to CSV:', error);
    exportToCSV(records, settings, extraExpenses);
    return true;
  }
}

/**
 * Export data to CSV
 */
export function exportToCSV(
  records: RentalRecord[] = [], 
  settings?: AppSettings, 
  extraExpenses: ExtraExpense[] = []
): boolean {
  try {
    const safeRecords = records || [];
    const safeExpenses = extraExpenses || [];
    const headers = [
      'NO', 
      'PERIODE', 
      'JUMLAH HARI', 
      'SEWA PER HARI', 
      'TOTAL SEWA', 
      'KET', 
      'POTONGAN PER HARI', 
      'TOTAL POTONGAN', 
      'BIAYA LAINNYA', 
      'KET BIAYA LAIN', 
      'SISA BERSIH'
    ];

    const defaultPot = settings?.defaultPotonganPerHari || 1200000;

    const rows = safeRecords.map((item, idx) => {
      const potPerHari = item.potonganPerHari !== undefined ? item.potonganPerHari : defaultPot;
      const totalPot = item.totalPotongan !== undefined ? item.totalPotongan : (item.jumlahHari * potPerHari);
      const otherCost = Number(item.biayaLainnya) || 0;
      const netTotal = item.totalBersih !== undefined ? item.totalBersih : (item.total - totalPot - otherCost);

      return [
        idx + 1,
        `"${(item.periode || '').replace(/"/g, '""')}"`,
        Number(item.jumlahHari) || 0,
        Number(item.sewaPerHari) || 0,
        Number(item.total) || 0,
        `"${(item.keterangan || item.penyewa || '').replace(/"/g, '""')}"`,
        potPerHari,
        totalPot,
        otherCost,
        `"${(item.ketBiayaLainnya || '').replace(/"/g, '""')}"`,
        netTotal,
      ];
    });

    const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
    const grandTotalSewa = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    const grandTotalPotongan = safeRecords.reduce((sum, r) => {
      const pot = r.totalPotongan !== undefined ? r.totalPotongan : (r.jumlahHari * (r.potonganPerHari ?? defaultPot));
      return sum + pot;
    }, 0);
    const grandTotalBiayaLain = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);
    const totalExtraExp = safeExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
    const grandTotalBersih = grandTotalSewa - grandTotalPotongan - grandTotalBiayaLain - totalExtraExp;

    rows.push([
      'TOTAL',
      `"${safeRecords.length} Periode"`,
      totalHari,
      0,
      grandTotalSewa,
      `"Rekap Total"`,
      defaultPot,
      grandTotalPotongan,
      grandTotalBiayaLain + totalExtraExp,
      `"${totalExtraExp > 0 ? `Pengeluaran Umum Rp ${formatRupiah(totalExtraExp)}` : ''}"`,
      grandTotalBersih,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `Sewa_Dapur_SPPG_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(blob, fileName);
    return true;
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return false;
  }
}

/**
 * Copy as formatted tabular text suitable for WhatsApp / Telegram / Excel paste
 */
export function copyAsFormattedText(
  records: RentalRecord[] = [], 
  settings?: AppSettings, 
  extraExpenses: ExtraExpense[] = []
): string {
  const safeRecords = records || [];
  const safeExpenses = extraExpenses || [];
  const defaultPot = settings?.defaultPotonganPerHari || 1200000;
  
  let text = `*REKAPITULASI SEWA DAPUR SPPG*\n`;
  text += `----------------------------------------\n`;
  text += `NO | PERIODE | HARI | TOTAL SEWA | POTONGAN (@${formatRupiah(defaultPot)}) | BIAYA LAIN | SISA BERSIH\n`;
  text += `----------------------------------------\n`;

  let totalHari = 0;
  let totalSewa = 0;
  let totalPotongan = 0;
  let totalBiayaLain = 0;
  let totalBersih = 0;

  safeRecords.forEach((r, idx) => {
    const potPerHari = r.potonganPerHari !== undefined ? r.potonganPerHari : defaultPot;
    const totalPot = r.totalPotongan !== undefined ? r.totalPotongan : (r.jumlahHari * potPerHari);
    const otherCost = Number(r.biayaLainnya) || 0;
    const netTotal = r.totalBersih !== undefined ? r.totalBersih : (r.total - totalPot - otherCost);

    totalHari += Number(r.jumlahHari) || 0;
    totalSewa += Number(r.total) || 0;
    totalPotongan += totalPot;
    totalBiayaLain += otherCost;
    totalBersih += netTotal;

    text += `${idx + 1}. *${r.periode}* (${r.jumlahHari} hari)\n`;
    text += `   - Total Sewa: Rp ${formatRupiah(r.total)}\n`;
    text += `   - Potongan Harian (${r.jumlahHari}x${formatRupiah(potPerHari)}): -Rp ${formatRupiah(totalPot)}\n`;
    if (otherCost > 0) {
      text += `   - Biaya Lainnya: -Rp ${formatRupiah(otherCost)} ${r.ketBiayaLainnya ? `(${r.ketBiayaLainnya})` : ''}\n`;
    }
    text += `   - *Sisa Bersih: Rp ${formatRupiah(netTotal)}*\n`;
  });

  const totalExtraExp = safeExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
  const grandNetFinal = totalBersih - totalExtraExp;

  text += `----------------------------------------\n`;
  text += `*RINGKASAN TOTAL:*\n`;
  text += `• Total Periode: ${safeRecords.length} Periode (${totalHari} Hari)\n`;
  text += `• Total Penerimaan Sewa: Rp ${formatRupiah(totalSewa)}\n`;
  text += `• Total Potongan Harian: -Rp ${formatRupiah(totalPotongan)}\n`;
  if (totalBiayaLain > 0) {
    text += `• Total Biaya Lain Periode: -Rp ${formatRupiah(totalBiayaLain)}\n`;
  }
  if (totalExtraExp > 0) {
    text += `• Biaya Pengeluaran Umum: -Rp ${formatRupiah(totalExtraExp)}\n`;
  }
  text += `• *TOTAL SISA BERSIH AKHIR: Rp ${formatRupiah(grandNetFinal)}*\n`;
  text += `----------------------------------------\n`;
  text += `_Dicatat pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}_`;

  return text;
}

