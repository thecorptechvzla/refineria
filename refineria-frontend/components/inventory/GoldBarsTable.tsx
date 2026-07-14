'use client';

import { useState, useMemo, Fragment } from 'react';
import { getSupplierName, formatNumber } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import type { GoldBar } from '@/types/refinery';
import type { Supplier } from '@/types';

interface GoldBarsTableProps {
  goldBars: GoldBar[];
  suppliers: Supplier[] | undefined;
  isLoading?: boolean;
  purityFirst?: boolean;
  filterSupplierId?: string;
}

export function GoldBarsTable({ goldBars, suppliers, isLoading, purityFirst = false, filterSupplierId }: GoldBarsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* ── Filter ── */
  const filteredBars = useMemo(() => {
    return goldBars.filter((b) => {
      if (filterSupplierId && b.supplierId !== filterSupplierId) return false;
      return true;
    });
  }, [goldBars, filterSupplierId]);

  /* ── Group by supplier, order blocks by newest bar, bars newest-first ── */
  const allGroupedBars = useMemo(() => {
    const map = new Map<string, { supplierId: string; supplierName: string; bars: GoldBar[] }>();
    for (const bar of filteredBars) {
      if (!map.has(bar.supplierId)) {
        map.set(bar.supplierId, {
          supplierId: bar.supplierId,
          supplierName: suppliers ? getSupplierName(suppliers, bar.supplierId) : bar.supplierId,
          bars: [],
        });
      }
      map.get(bar.supplierId)!.bars.push(bar);
    }
    // Within each group, sort newest-first
    for (const group of map.values()) {
      group.bars.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }
    // Sort groups by their most recent bar's date
    return Array.from(map.values()).sort((a, b) => {
      const aMax = new Date(a.bars[0].registrationDate).getTime();
      const bMax = new Date(b.bars[0].registrationDate).getTime();
      return bMax - aMax;
    });
  }, [filteredBars, suppliers]);

  /* ── Group-aware pagination ── */
  const groupPages = useMemo(() => {
    const pages: number[][] = [];
    let cur: number[] = [];
    let count = 0;
    allGroupedBars.forEach((g, idx) => {
      if (count + g.bars.length > ITEMS_PER_PAGE && cur.length > 0) {
        pages.push(cur);
        cur = [];
        count = 0;
      }
      cur.push(idx);
      count += g.bars.length;
    });
    if (cur.length > 0) pages.push(cur);
    return pages;
  }, [allGroupedBars]);

  const totalPages = Math.max(1, groupPages.length);
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedGroups = (groupPages[currentPageSafe - 1] || []).map((idx) => allGroupedBars[idx]);

  /* ── Totals (across all filtered bars) ── */
  const totals = useMemo(() => ({
    grossWeight: filteredBars.reduce((s, b) => s + b.grossWeight, 0),
    analytical: filteredBars.reduce((s, b) => s + b.analytical, 0),
    expected: filteredBars.reduce((s, b) => s + b.expected, 0),
    recovered: filteredBars.reduce((s, b) => s + b.recovered, 0),
  }), [filteredBars]);

  const STICKY_CELL = 'sticky left-0 z-20 bg-midnight-900 px-2 sm:px-3 py-2 sm:py-3 border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]';

  return (
    <div>
      {filterSupplierId && (
        <div className="mb-3 text-[10px] text-amber-400 font-semibold uppercase tracking-widest">
          Filtrado por: {suppliers ? getSupplierName(suppliers, filterSupplierId) : filterSupplierId}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-blue-500/10">
              <th className={`${STICKY_CELL} text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500`}>Código</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Cliente</th>
              {purityFirst && <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">LEY AU</th>}
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500"><span className="hidden sm:inline">Bruto (g)</span><span className="sm:hidden">BRU.</span></th>
              {!purityFirst && <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">LEY AU</th>}
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
                {purityFirst && <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-500" />}
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.grossWeight)}</td>
                {!purityFirst && <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-500" />}
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.analytical, 1)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.expected, 1)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono font-bold text-gold-500">{formatNumber(totals.recovered, 1)}</td>
                <td />
              </tr>
            )}

            {isLoading ? (
              <tr>
                <td colSpan={purityFirst ? 8 : 7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 animate-spin rounded-full" />
                    <span className="text-xs text-slate-500">Cargando barras...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedGroups.length === 0 && filteredBars.length === 0 ? (
              <tr>
                <td colSpan={purityFirst ? 8 : 7} className="px-4 py-12 text-center text-xs text-slate-500">No hay barras registradas.</td>
              </tr>
            ) : (
              <>
                {filteredBars.length > 0 && paginatedGroups.length === 0 && (
                  <tr>
                    <td colSpan={purityFirst ? 8 : 7} className="px-4 py-12 text-center text-xs text-slate-500">No hay barras en esta página.</td>
                  </tr>
                )}
                {paginatedGroups.length > 0 && paginatedGroups.map((group) => (
                  <Fragment key={group.supplierId}>
                    {/* Group header */}
                    <tr className="bg-blue-500/[0.08] border-b border-blue-500/10">
                      <td colSpan={purityFirst ? 8 : 7} className="px-2 sm:px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{group.supplierName}</span>
                          <span className="text-[10px] font-mono text-slate-500">— {group.bars.length} BARRAS</span>
                        </div>
                      </td>
                    </tr>
                    {/* Bars */}
                    {group.bars.map((bar) => (
                      <tr key={bar.id} className="terminal-row">
                        <td className={`${STICKY_CELL} whitespace-nowrap text-xs sm:text-sm font-mono text-slate-200`}>
                          {bar.code}
                        </td>
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-slate-300">
                          {suppliers ? getSupplierName(suppliers, bar.supplierId) : '—'}
                        </td>
                        {purityFirst && <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-blue-300">{bar.ley != null ? `${formatNumber(bar.ley, 2)}` : '\u2014'}</td>}
                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-slate-100">{formatNumber(bar.grossWeight)}</td>
                        {!purityFirst && <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono text-blue-300">{bar.ley != null ? `${formatNumber(bar.ley, 2)}` : '\u2014'}</td>}
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
                    ))}
                  </Fragment>
                ))}
              </>
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
