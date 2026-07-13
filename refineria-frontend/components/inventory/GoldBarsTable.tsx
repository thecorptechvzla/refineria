'use client';

import { useState, useMemo } from 'react';
import { getSupplierName, formatNumber } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GoldBar } from '@/types/refinery';
import type { Supplier } from '@/types';

interface GoldBarsTableProps {
  goldBars: GoldBar[];
  suppliers: Supplier[] | undefined;
  isLoading?: boolean;
}

export function GoldBarsTable({ goldBars, suppliers, isLoading }: GoldBarsTableProps) {
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'in_lot'>('all');
  const [supplierId, setSupplierId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const extractCodeNumber = (code: string): number => {
    const match = code.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const filteredBars = useMemo(() => {
    return goldBars.filter((b) => {
      if (supplierId && b.supplierId !== supplierId) return false;
      if (filterAvailable === 'available' && !b.available) return false;
      if (filterAvailable === 'in_lot' && b.available) return false;
      return true;
    });
  }, [goldBars, supplierId, filterAvailable]);

  const sortedBars = useMemo(() => {
    return [...filteredBars].sort((a, b) => extractCodeNumber(a.code) - extractCodeNumber(b.code));
  }, [filteredBars]);

  const totalPages = Math.max(1, Math.ceil(sortedBars.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedBars = sortedBars.slice((currentPageSafe - 1) * ITEMS_PER_PAGE, currentPageSafe * ITEMS_PER_PAGE);

  const totals = useMemo(() => ({
    grossWeight: filteredBars.reduce((s, b) => s + b.grossWeight, 0),
    analytical: filteredBars.reduce((s, b) => s + b.analytical, 0),
    expected: filteredBars.reduce((s, b) => s + b.expected, 0),
    recovered: filteredBars.reduce((s, b) => s + b.recovered, 0),
  }), [filteredBars]);

  const STICKY_CELL = 'sticky left-0 z-20 bg-midnight-900 px-2 sm:px-3 py-2 sm:py-3 border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]';

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={filterAvailable}
          onChange={(e) => { setFilterAvailable(e.target.value as 'all' | 'available' | 'in_lot'); setCurrentPage(1); }}
          className="px-2 py-1.5 bg-midnight-800 border border-blue-500/20 text-slate-400 text-[10px] outline-none"
        >
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="in_lot">En Lote</option>
        </select>
        <select
          value={supplierId}
          onChange={(e) => { setSupplierId(e.target.value); setCurrentPage(1); }}
          className="px-2 py-1.5 bg-midnight-800 border border-blue-500/20 text-slate-400 text-[10px] outline-none"
        >
          <option value="">Todos los proveedores</option>
          {suppliers?.map((s) => (
            <option key={s.id} value={s.id} className="bg-midnight-800">{s.name}</option>
          ))}
        </select>
        <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
          {String(filteredBars.length).padStart(2, '0')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-blue-500/10">
              <th className={`${STICKY_CELL} text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500`}>Código</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Proveedor</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500"><span className="hidden sm:inline">Bruto (g)</span><span className="sm:hidden">BRU.</span></th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">FA</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">FE</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">R</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {/* Totals row — top of table */}
            {filteredBars.length > 0 && (
              <tr className="border-b-2 border-gold-500/30 bg-midnight-900">
                <td className={`${STICKY_CELL} text-xs sm:text-sm font-bold text-gold-500`}>Totales</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-slate-500">{filteredBars.length} barras</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.grossWeight)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.analytical, 1)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.expected, 1)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.recovered, 1)}</td>
                <td />
              </tr>
            )}
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 animate-spin rounded-full" />
                    <span className="text-xs text-slate-500">Cargando barras...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedBars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">No hay barras registradas.</td>
              </tr>
            ) : (
              paginatedBars.map((bar) => (
                <tr key={bar.id} className="terminal-row">
                  <td className={`${STICKY_CELL} whitespace-nowrap text-xs sm:text-sm font-mono text-slate-200`}>
                    {bar.code}
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-slate-300">
                    {suppliers ? getSupplierName(suppliers, bar.supplierId) : '—'}
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-100">{formatNumber(bar.grossWeight)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-100">{formatNumber(bar.analytical, 1)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-100">{formatNumber(bar.expected, 1)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-100">{formatNumber(bar.recovered, 1)}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      bar.available
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {bar.available ? 'Disponible' : 'En Proceso'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-2 sm:px-3 py-3 border-t border-blue-500/10 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            Página {currentPageSafe} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPageSafe <= 1}
              className="p-1.5 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageSafe >= totalPages}
              className="p-1.5 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
