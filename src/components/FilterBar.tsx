import React from 'react';
import { Search, Filter, ArrowUpDown, RefreshCw, X } from 'lucide-react';
import { PaymentStatus } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  totalFiltered,
  totalAll,
}) => {
  const hasActiveFilter = searchTerm !== '' || statusFilter !== 'all' || sortBy !== 'default';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 mb-4 shadow-2xs print:hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari data periode (misal: MEI, JUNE, 10-11), keterangan, penyewa..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 text-slate-900"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Status: Lunas</option>
              <option value="Belum Lunas">Status: Belum Lunas</option>
              <option value="DP">Status: DP</option>
              <option value="Pending">Status: Pending</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="default">Urutan: Asli / Input</option>
              <option value="period-asc">Periode (A - Z)</option>
              <option value="days-desc">Jumlah Hari (Terbanyak)</option>
              <option value="total-desc">Nominal Total (Terbesar)</option>
              <option value="total-asc">Nominal Total (Terkecil)</option>
            </select>
          </div>

          {/* Reset button if active */}
          {hasActiveFilter && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset semua filter"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Indicator */}
          <div className="text-xs text-slate-500 pl-1 font-medium">
            Menampilkan <strong className="text-slate-900">{totalFiltered}</strong> dari {totalAll}
          </div>

        </div>

      </div>
    </div>
  );
};
