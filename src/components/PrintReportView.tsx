import React from 'react';
import { RentalRecord, AppSettings, ExtraExpense } from '../types';
import { formatRupiah, DEFAULT_SETTINGS } from '../utils/formatters';

interface PrintReportViewProps {
  records?: RentalRecord[];
  settings?: AppSettings;
  extraExpenses?: ExtraExpense[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ 
  records = [], 
  settings = DEFAULT_SETTINGS,
  extraExpenses = []
}) => {
  const safeRecords = records || [];
  const safeExpenses = extraExpenses || [];
  const safeSettings = settings || DEFAULT_SETTINGS;
  const defaultPot = safeSettings.defaultPotonganPerHari || 1200000;

  const totalHari = safeRecords.reduce((sum, r) => sum + (Number(r.jumlahHari) || 0), 0);
  const grandTotalSewa = safeRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  
  const grandTotalPotongan = safeRecords.reduce((sum, r) => {
    const pot = r.totalPotongan !== undefined ? r.totalPotongan : (r.jumlahHari * (r.potonganPerHari ?? defaultPot));
    return sum + pot;
  }, 0);

  const grandTotalBiayaLain = safeRecords.reduce((sum, r) => sum + (Number(r.biayaLainnya) || 0), 0);
  const totalExtraExp = safeExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
  const grandTotalSemuaBiaya = grandTotalBiayaLain + totalExtraExp;

  const grandTotalBersih = grandTotalSewa - grandTotalPotongan - grandTotalSemuaBiaya;

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="hidden print:block p-6 bg-white text-black font-sans">
      
      {/* Official Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-2xl font-black uppercase tracking-wider text-black">
          {safeSettings.namaInstansi || 'SEWA DAPUR SPPG'}
        </h1>
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-800 mt-0.5">
          {safeSettings.subJudul || 'REKAPITULASI DATA SEWA DAPUR & PERHITUNGAN BERSIH'}
        </h2>
        <p className="text-xs text-stone-600 mt-1">
          Dicetak pada: {currentDateFormatted}
        </p>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN I: DATA PENERIMAAN SEWA DAPUR (Murni)               */}
      {/* ========================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            BAGIAN I: DATA PENERIMAAN SEWA DAPUR
          </h3>
          <span className="text-[11px] font-semibold text-stone-600">
            Standar Tarif: Rp {formatRupiah(safeSettings.defaultSewaPerHari || 6000000)} / Hari
          </span>
        </div>
        
        <table className="w-full border-collapse border-2 border-black text-xs">
          <thead>
            <tr className="bg-[#FFFF00] text-black border-b-2 border-black font-extrabold text-xs uppercase">
              <th className="py-2 px-2 border border-black text-center w-8">NO</th>
              <th className="py-2 px-3 border border-black text-left">PERIODE</th>
              <th className="py-2 px-2 border border-black text-center w-24">JUMLAH HARI</th>
              <th className="py-2 px-3 border border-black text-right w-36">SEWA PERHARI</th>
              <th className="py-2 px-3 border border-black text-right w-36">TOTAL</th>
              <th className="py-2 px-3 border border-black text-left w-32">Ket</th>
            </tr>
          </thead>
          <tbody>
            {safeRecords.map((item, index) => (
              <tr key={item.id} className="border-b border-black text-black">
                <td className="py-1.5 px-2 border border-black text-center font-medium">
                  {index + 1}
                </td>
                <td className="py-1.5 px-3 border border-black font-bold">
                  {item.periode}
                  {item.penyewa ? ` (${item.penyewa})` : ''}
                </td>
                <td className="py-1.5 px-2 border border-black text-center font-semibold">
                  {item.jumlahHari === 0 ? '0 (Libur)' : item.jumlahHari}
                </td>
                <td className="py-1.5 px-3 border border-black text-right font-medium tabular-nums">
                  Rp {formatRupiah(item.sewaPerHari)}
                </td>
                <td className="py-1.5 px-3 border border-black text-right font-bold tabular-nums">
                  Rp {formatRupiah(item.total)}
                </td>
                <td className="py-1.5 px-3 border border-black text-xs">
                  {item.keterangan || '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#FFFF00]/50 font-black text-black border-t-2 border-black">
              <td className="py-2 px-2 border border-black text-center">TOTAL</td>
              <td className="py-2 px-3 border border-black">{safeRecords.length} Periode</td>
              <td className="py-2 px-2 border border-black text-center text-sm font-black">{totalHari} Hari</td>
              <td className="py-2 px-3 border border-black text-right text-stone-500">-</td>
              <td className="py-2 px-3 border border-black text-right text-sm tabular-nums font-black">
                Rp {formatRupiah(grandTotalSewa)}
              </td>
              <td className="py-2 px-3 border border-black text-xs text-stone-600">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN II: RINCIAN POTONGAN HARIAN & BIAYA LAINNYA        */}
      {/* ========================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            BAGIAN II: RINCIAN POTONGAN HARIAN (RP {formatRupiah(defaultPot)} / HARI) & BIAYA LAINNYA
          </h3>
          <span className="text-[11px] font-semibold text-stone-600">
            Dipotong Rp {formatRupiah(defaultPot)} per hari kerja
          </span>
        </div>

        <table className="w-full border-collapse border-2 border-black text-xs">
          <thead>
            <tr className="bg-stone-200 text-black border-b-2 border-black font-extrabold text-xs uppercase">
              <th className="py-2 px-2 border border-black text-center w-8">NO</th>
              <th className="py-2 px-3 border border-black text-left">PERIODE</th>
              <th className="py-2 px-2 border border-black text-center w-20">JUMLAH HARI</th>
              <th className="py-2 px-3 border border-black text-right w-32">POTONGAN / HARI</th>
              <th className="py-2 px-3 border border-black text-right w-32">TOTAL POTONGAN</th>
              <th className="py-2 px-3 border border-black text-right w-28">BIAYA LAIN</th>
              <th className="py-2 px-3 border border-black text-left w-28">KET BIAYA LAIN</th>
              <th className="py-2 px-3 border border-black text-right w-32">SISA BERSIH</th>
            </tr>
          </thead>
          <tbody>
            {safeRecords.map((item, index) => {
              const potPerHari = item.potonganPerHari !== undefined ? item.potonganPerHari : defaultPot;
              const totalPotongan = item.totalPotongan !== undefined ? item.totalPotongan : (item.jumlahHari * potPerHari);
              const otherCost = Number(item.biayaLainnya) || 0;
              const netTotal = item.totalBersih !== undefined ? item.totalBersih : (item.total - totalPotongan - otherCost);

              return (
                <tr key={item.id} className="border-b border-black text-black">
                  <td className="py-1.5 px-2 border border-black text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="py-1.5 px-3 border border-black font-bold">
                    {item.periode}
                  </td>
                  <td className="py-1.5 px-2 border border-black text-center font-semibold">
                    {item.jumlahHari === 0 ? '0 (Libur)' : item.jumlahHari}
                  </td>
                  <td className="py-1.5 px-3 border border-black text-right font-medium tabular-nums">
                    Rp {formatRupiah(potPerHari)}
                  </td>
                  <td className="py-1.5 px-3 border border-black text-right font-bold tabular-nums text-rose-900">
                    - Rp {formatRupiah(totalPotongan)}
                  </td>
                  <td className="py-1.5 px-3 border border-black text-right font-medium tabular-nums">
                    {otherCost > 0 ? `- Rp ${formatRupiah(otherCost)}` : '-'}
                  </td>
                  <td className="py-1.5 px-3 border border-black text-xs">
                    {item.ketBiayaLainnya || '-'}
                  </td>
                  <td className="py-1.5 px-3 border border-black text-right font-black tabular-nums">
                    Rp {formatRupiah(netTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-stone-200 font-extrabold text-black border-t-2 border-black">
              <td className="py-2 px-2 border border-black text-center">TOTAL</td>
              <td className="py-2 px-3 border border-black">{safeRecords.length} Periode</td>
              <td className="py-2 px-2 border border-black text-center font-black">{totalHari} Hari</td>
              <td className="py-2 px-3 border border-black text-right text-xs">@{formatRupiah(defaultPot)}/hr</td>
              <td className="py-2 px-3 border border-black text-right text-sm tabular-nums font-black text-rose-900">
                - Rp {formatRupiah(grandTotalPotongan)}
              </td>
              <td className="py-2 px-3 border border-black text-right tabular-nums font-black">
                - Rp {formatRupiah(grandTotalBiayaLain)}
              </td>
              <td className="py-2 px-3 border border-black text-xs">Total Biaya</td>
              <td className="py-2 px-3 border border-black text-right text-sm tabular-nums font-black">
                Rp {formatRupiah(grandTotalBersih + totalExtraExp)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rincian Pengeluaran Tambahan Umum (jika ada) */}
      {safeExpenses.length > 0 && (
        <div className="my-4 p-3 border-2 border-black">
          <h3 className="font-black text-xs uppercase mb-1.5">Pengeluaran Operasional Tambahan Lainnya:</h3>
          <ul className="text-xs space-y-1">
            {safeExpenses.map((exp, idx) => (
              <li key={exp.id} className="flex justify-between border-b border-stone-300 py-0.5">
                <span>{idx + 1}. {exp.nama} {exp.keterangan ? `(${exp.keterangan})` : ''}</span>
                <span className="font-bold text-rose-900">- Rp {formatRupiah(exp.nominal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-black text-xs pt-1.5 mt-1 border-t border-black">
            <span>TOTAL PENGELUARAN OPERASIONAL UMUM:</span>
            <span className="text-rose-900">- Rp {formatRupiah(totalExtraExp)}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BAGIAN III: REKAPITULASI PENYELESAIAN BERSIH FINAL        */}
      {/* ========================================================= */}
      <div className="my-4 p-4 border-2 border-black bg-stone-50">
        <h3 className="text-xs font-black uppercase tracking-wider mb-2 pb-1 border-b border-black">
          BAGIAN III: REKAPITULASI PENYELESAIAN AKHIR (SISA BERSIH YANG DITERIMA)
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span>1. Total Penerimaan Sewa Dapur (Tabel I - {totalHari} Hari):</span>
            <span className="font-bold">Rp {formatRupiah(grandTotalSewa)}</span>
          </div>
          <div className="flex justify-between text-rose-900">
            <span>2. Total Potongan Harian (Tabel II - @Rp {formatRupiah(defaultPot)}/hari):</span>
            <span className="font-bold">- Rp {formatRupiah(grandTotalPotongan)}</span>
          </div>
          {grandTotalBiayaLain > 0 && (
            <div className="flex justify-between text-stone-800">
              <span>3. Total Biaya Lain-Lain Per Periode (Tabel II):</span>
              <span className="font-bold">- Rp {formatRupiah(grandTotalBiayaLain)}</span>
            </div>
          )}
          {totalExtraExp > 0 && (
            <div className="flex justify-between text-stone-800">
              <span>4. Pengeluaran Operasional Umum Tambahan:</span>
              <span className="font-bold">- Rp {formatRupiah(totalExtraExp)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black pt-2 mt-2 border-t-2 border-black bg-yellow-100 p-2">
            <span className="uppercase">TOTAL SISA BERSIH YANG DITERIMA:</span>
            <span className="text-base text-black">Rp {formatRupiah(grandTotalBersih)}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <p className="font-semibold text-stone-600">Disetujui Oleh,</p>
          <div className="h-16"></div>
          <p className="font-bold text-black uppercase underline">
            {safeSettings.penanggungJawab || 'Pengelola Dapur'}
          </p>
          <p className="text-[11px] text-stone-600">
            {safeSettings.jabatan || 'Koordinator Operasional'}
          </p>
        </div>

        <div>
          <p className="font-semibold text-stone-600">
            Dibuat di SPPG, {currentDateFormatted}
          </p>
          <div className="h-16"></div>
          <p className="font-bold text-black uppercase underline">
            Administrator Keuangan
          </p>
          <p className="text-[11px] text-stone-600">
            Bagian Rekapitulasi & Pembukuan
          </p>
        </div>
      </div>

    </div>
  );
};
