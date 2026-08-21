export type PaymentStatus = 'Lunas' | 'Belum Lunas' | 'DP' | 'Pending';

export interface RentalRecord {
  id: string;
  periode: string; // e.g. "10-11MEI", "16-20JUNE"
  startDate?: string;
  endDate?: string;
  jumlahHari: number;
  sewaPerHari: number; // e.g. 6000000
  total: number; // jumlahHari * sewaPerHari
  keterangan: string;
  statusBayar: PaymentStatus;
  penyewa?: string;
  
  // New: Deduction 1.200.000 / day & Custom Other Costs
  potonganPerHari?: number; // default 1200000
  totalPotongan?: number;   // jumlahHari * (potonganPerHari || 1200000)
  biayaLainnya?: number;    // input biaya lainnya (kolom kosong user)
  ketBiayaLainnya?: string; // keterangan biaya lainnya
  totalBersih?: number;     // total - totalPotongan - (biayaLainnya || 0)

  createdAt: string;
  updatedAt: string;
}

export interface ExtraExpense {
  id: string;
  nama: string;
  nominal: number;
  kategori?: string;
  tanggal?: string;
  keterangan?: string;
  createdAt?: string;
}

export interface AppSettings {
  defaultSewaPerHari: number;
  defaultPotonganPerHari: number; // e.g. 1200000
  defaultJumlahHari?: number; // e.g. 6 (normal per periode)
  namaInstansi: string;
  subJudul: string;
  penanggungJawab: string;
  jabatan: string;
  mataUang: string;
}

export type NewDatabaseMode = 
  | 'retain-periods-clear-days' // Pertahankan periode & rentang tanggal, kosongkan jumlah hari (0 hari)
  | 'blank'                     // Database kosong murni
  | 'clone-all';                // Salin semua data persis

export interface KitchenDatabase {
  id: string;
  name: string; // e.g. "Dapur Utama SPPG", "Dapur 2 (Unit B)"
  description?: string;
  color?: string; // visual accent color
  createdAt: string;
  updatedAt: string;
  records: RentalRecord[];
  extraExpenses: ExtraExpense[];
  settings: AppSettings;
}

