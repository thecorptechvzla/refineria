'use client';

import { useState, useMemo } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { exportConsolidado } from '@/lib/exportExcel';
import { getSupplierName, formatNumber } from '@/lib/utils';
import { FileDown, Download, Search, X } from 'lucide-react';

function computeLotDetail(lot: { id: string; number: number; barIds: string[]; recovered?: number | null }, bars: { id: string; grossWeight: number; analytical: number; expected: number; recovered: number }[]) {
  const lotBars = bars.filter((b) => lot.barIds.includes(b.id));
  const grossWeight = lotBars.reduce((s, b) => s + b.grossWeight, 0);
  const e = lotBars.reduce((s, b) => s + b.analytical, 0);
  const f = lotBars.reduce((s, b) => s + b.expected, 0);
  const g = lot.recovered ?? lotBars.reduce((s, b) => s + b.recovered, 0);
  return { grossWeight, e, f, g, pct: e > 0 ? (g / e) * 100 : 0, dif: g - f };
}

export default function ExportarPage() {
  const { processes, goldBars } = useProcess();
  const { data: suppliers } = useSuppliers();

  const [filterSupplierId, setFilterSupplierId] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const closedProcesses = useMemo(() => {
    return processes.filter((p) => p.status === 'closed');
  }, [processes]);

  const filtered = useMemo(() => {
    return closedProcesses.filter((p) => {
      if (filterSupplierId !== 'all' && p.supplierId !== filterSupplierId) return false;
      if (filterStartDate && new Date(p.closedAt!) < new Date(filterStartDate + 'T00:00:00')) return false;
      if (filterEndDate && new Date(p.closedAt!) > new Date(filterEndDate + 'T23:59:59.999')) return false;
      return true;
    });
  }, [closedProcesses, filterSupplierId, filterStartDate, filterEndDate]);

  const processDetails = useMemo(() => {
    return filtered.map((p) => {
      const lotDetails = p.lots.map((lot) => computeLotDetail(lot, goldBars));
      const totalGrossWeight = lotDetails.reduce((s, l) => s + l.grossWeight, 0);
      const totalE = lotDetails.reduce((s, l) => s + l.e, 0);
      const totalF = lotDetails.reduce((s, l) => s + l.f, 0);
      const totalG = lotDetails.reduce((s, l) => s + l.g, 0);
      const totalPct = totalE > 0 ? (totalG / totalE) * 100 : 0;
      const totalDif = totalG - totalF;
      return { ...p, lotDetails, totalGrossWeight, totalE, totalF, totalG, totalPct, totalDif };
    });
  }, [filtered, goldBars]);

  const supplierIds = useMemo(() => {
    const ids = new Set(closedProcesses.map((p) => p.supplierId));
    return Array.from(ids);
  }, [closedProcesses]);

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(processDetails.map((p) => p.id)));
      setSelectAll(true);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      setSelectAll(false);
    } else {
      next.add(id);
      if (next.size === processDetails.length) setSelectAll(true);
    }
    setSelectedIds(next);
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) return;
    const selectedProcs = processDetails.filter((p) => selectedIds.has(p.id));
    if (selectedProcs.length === 0) return;

    const supplierName = filterSupplierId !== 'all' && suppliers
      ? getSupplierName(suppliers, filterSupplierId)
      : 'CONSOLIDADO';

    const exportData = selectedProcs.map((p) => ({
      lots: p.lots,
      allBars: goldBars,
    }));

    try {
      await exportConsolidado(supplierName, exportData);
    } catch {
      setErrorMessage('Error al exportar el Excel');
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <FileDown className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Exportar</h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
            Seleccione procesos cerrados y exporte a Excel
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Proveedor
            </label>
            <select
              value={filterSupplierId}
              onChange={(e) => { setFilterSupplierId(e.target.value); setSelectedIds(new Set()); setSelectAll(false); }}
              className="w-full px-3 py-2 bg-midnight-900 border border-blue-500/20 text-slate-200 text-sm outline-none focus:border-gold-500/50"
            >
              <option value="all">Todos los clientes</option>
              {supplierIds.map((sid) => (
                <option key={sid} value={sid}>
                  {suppliers ? getSupplierName(suppliers, sid) : sid}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Desde
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setSelectedIds(new Set()); setSelectAll(false); }}
              className="px-3 py-2 bg-midnight-900 border border-blue-500/20 text-slate-200 text-sm outline-none focus:border-gold-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Hasta
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setSelectedIds(new Set()); setSelectAll(false); }}
              className="px-3 py-2 bg-midnight-900 border border-blue-500/20 text-slate-200 text-sm outline-none focus:border-gold-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {(filterSupplierId !== 'all' || filterStartDate || filterEndDate) && (
              <button
                onClick={() => { setFilterSupplierId('all'); setFilterStartDate(''); setFilterEndDate(''); setSelectedIds(new Set()); setSelectAll(false); }}
                className="px-3 py-2 border border-blue-500/20 text-slate-400 text-xs hover:bg-blue-500/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-xs text-slate-500 ml-2">
              {processDetails.length} proceso{processDetails.length !== 1 ? 's' : ''} cerrado{processDetails.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {processDetails.length > 0 ? (
        <div className="glass-panel">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectAll && processDetails.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proceso</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lotes</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">FA (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">FE (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">R (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recup.</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Dif (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cerrado</th>
                </tr>
              </thead>
              <tbody>
                {processDetails.map((p) => (
                  <tr key={p.id} className="terminal-row">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                        className="w-4 h-4 accent-gold-500"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">#{p.number}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-300">
                      {suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-400">{p.lotDetails.length}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatNumber(p.totalGrossWeight, 1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatNumber(p.totalE, 1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatNumber(p.totalF, 1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatNumber(p.totalG, 1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">{formatNumber(p.totalPct)}%</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-semibold" style={{ color: p.totalDif < 0 ? '#EF4444' : '#22C55E' }}>
                      {p.totalDif >= 0 ? '+' : ''}{formatNumber(p.totalDif, 1)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-mono text-slate-600">
                      {p.closedAt ? new Date(p.closedAt).toLocaleDateString('es-PE') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-slate-700" />
            <p className="text-sm text-slate-500">No hay procesos cerrados{filterSupplierId !== 'all' ? ' para este proveedor' : ''}.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2">
          <span className="text-red-400 text-xs font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {selectedIds.size} de {processDetails.length} proceso{processDetails.length !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleExport}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Excel ({selectedIds.size})
        </button>
      </div>
    </div>
  );
}
