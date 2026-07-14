'use client';

import { useState, useMemo, Fragment } from 'react';
import { formatNumber } from '@/lib/utils';
import { Building2, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { GoldBar } from '@/types/refinery';
import type { Supplier } from '@/types';

interface SupplierDirectoryProps {
  goldBars: GoldBar[];
  suppliers: Supplier[] | undefined;
  isLoading?: boolean;
  purityFirst?: boolean;
  filterSupplierId?: string;
  showSearch?: boolean;
}

export function SupplierDirectory({
  goldBars,
  suppliers,
  isLoading,
  purityFirst = false,
  filterSupplierId,
  showSearch = false,
}: SupplierDirectoryProps) {
  const SUPPLIERS_PER_PAGE = 10;
  const BARS_PER_PAGE = 10;

  const [searchCode, setSearchCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(
    filterSupplierId ?? null,
  );
  const [supplierBarPages, setSupplierBarPages] = useState<Record<string, number>>({});

  const supplierData = useMemo(() => {
    const latestDate = new Map<string, number>();
    const grouped = new Map<string, GoldBar[]>();
    const q = searchCode.toLowerCase();

    let barsToProcess = goldBars;
    if (filterSupplierId) {
      barsToProcess = goldBars.filter((b) => b.supplierId === filterSupplierId);
    }

    for (const bar of barsToProcess) {
      if (!grouped.has(bar.supplierId)) {
        grouped.set(bar.supplierId, []);
      }
      grouped.get(bar.supplierId)!.push(bar);
      const d = new Date(bar.registrationDate).getTime();
      const prev = latestDate.get(bar.supplierId) ?? 0;
      if (d > prev) latestDate.set(bar.supplierId, d);
    }

    for (const [, bars] of grouped) {
      bars.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }

    const filtered = (suppliers ?? [])
      .filter((s) => {
        if (!latestDate.has(s.id)) return false;
        if (!q) return true;
        return grouped.get(s.id)?.some((b) => b.code.toLowerCase().includes(q)) ?? false;
      })
      .sort((a, b) => (latestDate.get(b.id) ?? 0) - (latestDate.get(a.id) ?? 0));

    return { filtered, grouped };
  }, [goldBars, suppliers, filterSupplierId, searchCode]);

  const { filtered: visibleSuppliers, grouped: barsBySupplier } = supplierData;

  const supplierTotalPages = Math.max(1, Math.ceil(visibleSuppliers.length / SUPPLIERS_PER_PAGE));
  const safeSupplierPage = Math.min(currentPage, supplierTotalPages);
  const paginatedSuppliers = visibleSuppliers.slice(
    (safeSupplierPage - 1) * SUPPLIERS_PER_PAGE,
    safeSupplierPage * SUPPLIERS_PER_PAGE,
  );

  const grandTotal = useMemo(() => {
    const ids = new Set(visibleSuppliers.map((s) => s.id));
    const visible = goldBars.filter((b) => ids.has(b.supplierId));
    return {
      grossWeight: visible.reduce((s, b) => s + b.grossWeight, 0),
      analytical: visible.reduce((s, b) => s + b.analytical, 0),
      expected: visible.reduce((s, b) => s + b.expected, 0),
      recovered: visible.reduce((s, b) => s + b.recovered, 0),
    };
  }, [goldBars, visibleSuppliers]);

  const STICKY_BASE =
    'sticky left-0 z-10 border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 animate-spin rounded-full" />
          <span className="text-xs text-slate-500">Cargando barras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {showSearch && (
        <div className="px-4 sm:px-5 py-3 border-b border-blue-500/10 flex items-center justify-end gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => { setSearchCode(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por código..."
              className="w-36 pl-7 pr-2 py-1.5 bg-midnight-800 border border-blue-500/20 text-slate-400 text-[10px] placeholder-slate-600 outline-none transition-all focus:border-blue-500/40"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
            {String(visibleSuppliers.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {filterSupplierId && (
        <div className="px-4 sm:px-5 pt-3 pb-1 text-[10px] text-amber-400 font-semibold uppercase tracking-widest">
          Filtrado por:{' '}
          {suppliers
            ? (() => {
                const s = suppliers.find((x) => x.id === filterSupplierId);
                return s ? s.name : filterSupplierId;
              })()
            : filterSupplierId}
        </div>
      )}

      {paginatedSuppliers.length > 0 ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-40 touch-pan-y">
          {paginatedSuppliers.map((s) => {
            const supplierBars = barsBySupplier.get(s.id) ?? [];
            const barPage = supplierBarPages[s.id] ?? 1;
            const barTotalPages = Math.max(1, Math.ceil(supplierBars.length / BARS_PER_PAGE));
            const safeBarPage = Math.min(barPage, barTotalPages);
            const paginatedBars = supplierBars.slice(
              (safeBarPage - 1) * BARS_PER_PAGE,
              safeBarPage * BARS_PER_PAGE,
            );
            const supplierTotals = {
              grossWeight: supplierBars.reduce((s, b) => s + b.grossWeight, 0),
              analytical: supplierBars.reduce((s, b) => s + b.analytical, 0),
              expected: supplierBars.reduce((s, b) => s + b.expected, 0),
              recovered: supplierBars.reduce((s, b) => s + b.recovered, 0),
            };

            return (
              <Fragment key={s.id}>
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 first:pt-0">
                  <div
                    className="glass-panel cursor-pointer active:scale-[0.98] transition-all hover:bg-blue-500/[0.04]"
                    onClick={() =>
                      setExpandedSupplierId((prev) => (prev === s.id ? null : s.id))
                    }
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white uppercase tracking-wider truncate">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            RIF: {s.rif}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10 whitespace-nowrap">
                          {supplierBars.length} BARRAS
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${
                            expandedSupplierId === s.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {expandedSupplierId === s.id && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="overflow-x-auto border border-blue-500/10">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-blue-500/10 bg-midnight-900/50">
                            <th
                              className={`${STICKY_BASE} bg-midnight-900/50 px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest`}
                            >
                              Código
                            </th>
                            {purityFirst && (
                              <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                                Ley Au (‰)
                              </th>
                            )}
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              Bruto (g)
                            </th>
                            {!purityFirst && (
                              <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                                Ley Au (‰)
                              </th>
                            )}
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              FA (g)
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              FE (g)
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              R (g)
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              Ley Ag (‰)
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              Ag (g)
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBars.map((bar, idx) => (
                            <tr
                              key={bar.id}
                              className={`${
                                idx % 2 === 0 ? 'bg-midnight-900/30' : 'bg-midnight-800/20'
                              } hover:bg-blue-500/[0.04] transition-colors`}
                            >
                              <td
                                className={`${STICKY_BASE} px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200`}
                                style={{
                                  backgroundColor: idx % 2 === 0 ? '#0B1120' : '#0C1221',
                                }}
                              >
                                {bar.code}
                              </td>
                              {purityFirst && (
                                <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                  {bar.ley != null ? formatNumber(bar.ley) : '\u2014'}
                                </td>
                              )}
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {formatNumber(bar.grossWeight)}
                              </td>
                              {!purityFirst && (
                                <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                  {bar.ley != null ? formatNumber(bar.ley) : '\u2014'}
                                </td>
                              )}
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {formatNumber(bar.analytical)}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {formatNumber(bar.expected)}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {formatNumber(bar.recovered)}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {bar.leyAg != null ? formatNumber(bar.leyAg) : '\u2014'}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-mono text-slate-200">
                                {bar.analyticalAg != null
                                  ? formatNumber(bar.analyticalAg)
                                  : '\u2014'}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-right">
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                                    bar.available
                                      ? 'text-gold-500 bg-gold-500/10 border border-gold-500/20'
                                      : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                                  }`}
                                >
                                  {bar.available ? 'DISPONIBLE' : 'EN LOTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {supplierBars.length > 0 && (
                          <tfoot>
                            <tr className="border-t border-blue-500/10 bg-midnight-800/50">
                              <td
                                className={`${STICKY_BASE} bg-midnight-800/50 px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest`}
                              >
                                Total {s.name}
                              </td>
                              {purityFirst && <td className="px-3 py-2" />}
                              <td className="px-3 py-2 text-right text-xs font-mono text-slate-200">
                                {formatNumber(supplierTotals.grossWeight)}
                              </td>
                              {!purityFirst && <td className="px-3 py-2" />}
                              <td className="px-3 py-2 text-right text-xs font-mono text-slate-200">
                                {formatNumber(supplierTotals.analytical)}
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-mono text-slate-200">
                                {formatNumber(supplierTotals.expected)}
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-mono text-slate-200">
                                {formatNumber(supplierTotals.recovered)}
                              </td>
                              <td colSpan={3} />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                    {barTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <span className="text-[9px] font-mono text-slate-500">
                          Página {safeBarPage} de {barTotalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setSupplierBarPages((prev) => ({
                                ...prev,
                                [s.id]: safeBarPage - 1,
                              }))
                            }
                            disabled={safeBarPage <= 1}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setSupplierBarPages((prev) => ({
                                ...prev,
                                [s.id]: safeBarPage + 1,
                              }))
                            }
                            disabled={safeBarPage >= barTotalPages}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">No hay barras registradas.</p>
        </div>
      )}

      {visibleSuppliers.length > 0 && (
        <div className="flex-shrink-0 border-t border-gold-500/30 bg-midnight-900 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          {/* ── Desktop: horizontal row ── */}
          <div className="hidden sm:flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest drop-shadow-sm">
              GRAN TOTAL
            </span>
            <div className="flex items-center gap-5">
              <span className="text-xs font-mono text-slate-300">
                Bruto:{' '}
                <span className="text-gold-400 font-bold text-sm">
                  {formatNumber(grandTotal.grossWeight)}
                </span>{' '}
                <span className="text-[10px] text-slate-500">g</span>
              </span>
              <span className="text-[10px] text-slate-600">|</span>
              <span className="text-xs font-mono text-slate-300">
                FA:{' '}
                <span className="text-gold-400 font-bold text-sm">
                  {formatNumber(grandTotal.analytical)}
                </span>{' '}
                <span className="text-[10px] text-slate-500">g</span>
              </span>
              <span className="text-[10px] text-slate-600">|</span>
              <span className="text-xs font-mono text-slate-300">
                FE:{' '}
                <span className="text-gold-400 font-bold text-sm">
                  {formatNumber(grandTotal.expected)}
                </span>{' '}
                <span className="text-[10px] text-slate-500">g</span>
              </span>
              <span className="text-[10px] text-slate-600">|</span>
              <span className="text-xs font-mono text-slate-300">
                R:{' '}
                <span className="text-gold-400 font-bold text-sm">
                  {formatNumber(grandTotal.recovered)}
                </span>{' '}
                <span className="text-[10px] text-slate-500">g</span>
              </span>
            </div>
          </div>

          {/* ── Mobile: 2x2 grid ── */}
          <div className="sm:hidden px-4 py-3">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
              GRAN TOTAL
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">Bruto</div>
                <div className="text-[13px] font-mono font-bold text-gold-400 leading-tight whitespace-nowrap">
                  {formatNumber(grandTotal.grossWeight)}{' '}
                  <span className="text-[10px] font-normal text-slate-500">g</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">FA</div>
                <div className="text-[13px] font-mono font-bold text-gold-400 leading-tight whitespace-nowrap">
                  {formatNumber(grandTotal.analytical)}{' '}
                  <span className="text-[10px] font-normal text-slate-500">g</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">FE</div>
                <div className="text-[13px] font-mono font-bold text-gold-400 leading-tight whitespace-nowrap">
                  {formatNumber(grandTotal.expected)}{' '}
                  <span className="text-[10px] font-normal text-slate-500">g</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">R</div>
                <div className="text-[13px] font-mono font-bold text-gold-400 leading-tight whitespace-nowrap">
                  {formatNumber(grandTotal.recovered)}{' '}
                  <span className="text-[10px] font-normal text-slate-500">g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {supplierTotalPages > 1 && (
        <div className="px-4 sm:px-5 py-3 border-t border-blue-500/10 flex items-center justify-center gap-4">
          <span className="text-[10px] font-mono text-slate-500">
            Página {safeSupplierPage} de {supplierTotalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeSupplierPage <= 1}
              className="p-1.5 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(supplierTotalPages, p + 1))}
              disabled={safeSupplierPage >= supplierTotalPages}
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
