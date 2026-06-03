'use client';

import { useState, useMemo } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDeleteProcess, useRemoveBarsFromLot } from '@/lib/hooks/useProcesses';
import { getSupplierName, parseLocaleNumber, formatLocaleNumber, formatInputNumber } from '@/lib/utils';
import type { Process, ProcessLot, GoldBar } from '@/types/refinery';
import {
  Settings, Package, Crosshair, CheckCircle, Plus, ArrowLeft,
  Lock, X, Eye, Save, ChevronDown, ChevronRight, Trash2,
} from 'lucide-react';

type PageView = 'list' | 'detail';

type LotDetail = ProcessLot & {
  bars: GoldBar[];
  grossWeight: number;
  e: number;
  f: number;
  g: number;
  pct: number;
  dif: number;
};

type ProcessDetail = Process & {
  lotDetails: LotDetail[];
  totalGrossWeight: number;
  totalE: number;
  totalF: number;
  totalG: number;
  totalPct: number;
  totalDif: number;
};

function computeLotDetail(lot: ProcessLot, allBars: GoldBar[]): LotDetail {
  const bars = allBars.filter((b) => lot.barIds.includes(b.id));
  const grossWeight = bars.reduce((s, b) => s + b.grossWeight, 0);
  const e = bars.reduce((s, b) => s + b.analytical, 0);
  const f = bars.reduce((s, b) => s + b.expected, 0);
  const g = lot.recovered ?? bars.reduce((s, b) => s + b.recovered, 0);
  return {
    ...lot,
    bars,
    grossWeight,
    e,
    f,
    g,
    pct: e > 0 ? (g / e) * 100 : 0,
    dif: g - f,
  };
}

function buildProcessDetail(p: Process, allBars: GoldBar[]): ProcessDetail {
  const lotDetails = p.lots.map((l) => computeLotDetail(l, allBars));
  const totalGrossWeight = lotDetails.reduce((s, l) => s + l.grossWeight, 0);
  const totalE = lotDetails.reduce((s, l) => s + l.e, 0);
  const totalF = lotDetails.reduce((s, l) => s + l.f, 0);
  const totalG = lotDetails.reduce((s, l) => s + l.g, 0);
  return {
    ...p,
    lotDetails,
    totalGrossWeight,
    totalE,
    totalF,
    totalG,
    totalPct: totalE > 0 ? (totalG / totalE) * 100 : 0,
    totalDif: totalG - totalF,
  };
}

function ProcessModal({
  process,
  allBars,
  suppliers,
  onClose,
}: {
  process: Process;
  allBars: GoldBar[];
  suppliers: { id: string; name: string }[] | undefined;
  onClose: () => void;
}) {
  const detail = useMemo(() => buildProcessDetail(process, allBars), [process, allBars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-blue-500/10 flex items-center justify-between sticky top-0 bg-midnight-800/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Proceso #{detail.number} — {suppliers ? getSupplierName(suppliers, detail.supplierId) : '—'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  CERRADO
                </span>
                <span className="text-[10px] text-slate-500">
                  {detail.lotDetails.length} lote{detail.lotDetails.length !== 1 ? 's' : ''}
                </span>
                {detail.closedAt && (
                  <span className="text-[10px] text-slate-600">
                    Cerrado el {new Date(detail.closedAt).toLocaleDateString('es-PE')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lote</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">F (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">G (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recup.</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Dif (g)</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {detail.lotDetails.map((lot) => (
                  <tr key={lot.id} className="terminal-row">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">#{lot.number}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.grossWeight}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.e.toFixed(1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.f.toFixed(1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.g.toFixed(1)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">{lot.pct.toFixed(2)}%</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono" style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                      {lot.dif >= 0 ? '+' : ''}{lot.dif.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-[10px] text-slate-500 font-mono">{lot.bars.length} barra{lot.bars.length !== 1 ? 's' : ''}</span>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="border-t border-gold-500/20 bg-gold-500/5">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gold-500">Total</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalGrossWeight}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalE.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalF.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalG.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-gold-400">{detail.totalPct.toFixed(2)}%</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold" style={{ color: detail.totalDif < 0 ? '#EF4444' : '#22C55E' }}>
                    {detail.totalDif >= 0 ? '+' : ''}{detail.totalDif.toFixed(1)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalle de Barras por Lote</h3>
            {detail.lotDetails.map((lot) => (
              <div key={lot.id} className="bg-midnight-800/50 border border-blue-500/10 p-4">
                <p className="text-sm font-bold text-slate-300 mb-3">Lote #{lot.number}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-blue-500/10">
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Barra</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Bruto (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">E (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">F (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">G (g)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lot.bars.map((bar) => (
                        <tr key={bar.id} className="terminal-row">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-slate-300">{bar.code}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.grossWeight}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.analytical}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.expected}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.recovered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-blue-500/10 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ProcessDetailView({
  processDetail,
  availableBars,
  allBars,
  suppliers,
  onBack,
  onCloseProcess,
  onAssign,
}: {
  processDetail: ProcessDetail;
  availableBars: GoldBar[];
  allBars: GoldBar[];
  suppliers: { id: string; name: string }[] | undefined;
  onBack: () => void;
  onCloseProcess: (lots?: { id: string; recovered: number }[]) => void;
  onAssign: (barIds: string[]) => void;
}) {
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);
  const [closeWarning, setCloseWarning] = useState('');
  const [lotG, setLotG] = useState<Record<string, string>>({});
  const [expandedLots, setExpandedLots] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteBarId, setConfirmDeleteBarId] = useState<string | null>(null);
  const removeBarsFromLot = useRemoveBarsFromLot();

  const handleRemoveBar = async (lotId: string, barId: string) => {
    try {
      await removeBarsFromLot.mutateAsync({
        processId: processDetail.id,
        lotId,
        barIds: [barId],
      });
      setConfirmDeleteBarId(null);
    } catch {
      alert('Error al eliminar la barra del lote');
    }
  };

  const hasBars = processDetail.lotDetails.length > 0;

  const getLotG = (lotId: string): number | null => {
    const v = lotG[lotId];
    if (!v || !v.trim()) return null;
    const parsed = parseLocaleNumber(v);
    return isNaN(parsed) ? null : parsed;
  };

  const toggleBar = (barId: string) => {
    setSelectedBarIds((prev) =>
      prev.includes(barId) ? prev.filter((id) => id !== barId) : [...prev, barId]
    );
  };

  const handleAssign = () => {
    if (selectedBarIds.length === 0) return;
    onAssign(selectedBarIds);
    setSelectedBarIds([]);
  };

  const handleCloseClick = async () => {
    if (!hasBars) {
      setCloseWarning('No se puede cerrar el proceso porque no contiene barras asignadas.');
      setTimeout(() => setCloseWarning(''), 4000);
      return;
    }

    const missingG = processDetail.lotDetails.some(
      (lot) => getLotG(lot.id) === null,
    );
    if (missingG) {
      setCloseWarning('Debe ingresar el Peso Fino Recuperado para todos los lotes antes de cerrar el proceso.');
      setTimeout(() => setCloseWarning(''), 5000);
      return;
    }

    setIsSaving(true);
    try {
      const lots = processDetail.lotDetails.map((lot) => ({
        id: lot.id,
        recovered: getLotG(lot.id)!,
      }));
      onCloseProcess(lots);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-blue-500/5 transition-all border border-transparent hover:border-blue-500/20">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Proceso #{processDetail.number} — {suppliers ? getSupplierName(suppliers, processDetail.supplierId) : '—'}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-400">
                ACTIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
              {processDetail.lotDetails.length} lote{processDetail.lotDetails.length !== 1 ? 's' : ''} creado{processDetail.lotDetails.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {closeWarning && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2">
            <span className="text-red-400 text-xs font-medium">{closeWarning}</span>
          </div>
        )}

        <button
          onClick={handleCloseClick}
          disabled={isSaving}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
            hasBars && !isSaving
              ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isSaving ? <Save className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            {isSaving ? 'Guardando...' : 'Cerrar Proceso'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Barras Disponibles</h2>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {availableBars.length > 0 ? (
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                  {availableBars.map((bar) => (
                    <label
                      key={bar.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border ${
                        selectedBarIds.includes(bar.id)
                          ? 'bg-gold-500/10 border-gold-500/30'
                          : 'bg-midnight-800/50 border-transparent hover:bg-midnight-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBarIds.includes(bar.id)}
                        onChange={() => toggleBar(bar.id)}
                        className="w-4 h-4 accent-gold-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-slate-200">{bar.code}</span>
                          <span className="text-xs font-mono text-slate-400">{bar.grossWeight} g</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono mt-0.5">
                          <span>E: {bar.analytical}</span>
                          <span>F: {bar.expected}</span>
                          <span>G: {bar.recovered}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500 py-6">
                  No hay barras disponibles para este proveedor.
                </p>
              )}

              <button
                onClick={handleAssign}
                disabled={selectedBarIds.length === 0}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  Asignar a Lote Nuevo ({selectedBarIds.length})
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Consolidado</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                {String(processDetail.lotDetails.length).padStart(2, '0')} lote{processDetail.lotDetails.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lote</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">F (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">G (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recup.</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Dif (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {processDetail.lotDetails.length > 0 ? (
                    [...processDetail.lotDetails].reverse().map((lot) => (
                      <tr key={lot.id} className="terminal-row">
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">#{lot.number}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.grossWeight}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.e.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.f.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.g.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">{lot.pct.toFixed(2)}%</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono" style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                          {lot.dif >= 0 ? '+' : ''}{lot.dif.toFixed(1)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay lotes en este proceso. Asigna barras para crear el primer lote.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Captura de Peso Fino Recuperado (G) por Lote</h2>
        </div>

        {processDetail.lotDetails.length > 0 ? (
          [...processDetail.lotDetails].reverse().map((lot) => {
            const sumE = lot.bars.reduce((s, b) => s + b.analytical, 0);
            const sumF = lot.bars.reduce((s, b) => s + b.expected, 0);
            const gVal = getLotG(lot.id);
            const pct = gVal !== null && sumE > 0 ? (gVal / sumE) * 100 : null;
            const dif = gVal !== null ? gVal - sumF : null;
            const isExpanded = expandedLots[lot.id] ?? false;

            return (
              <div key={lot.id} className="glass-panel">
                <div className="p-4 sm:p-5 border-b border-blue-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gold-500 font-mono">Lote #{lot.number}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        Σ E: {formatLocaleNumber(sumE)} g &middot; Σ F: {formatLocaleNumber(sumF)} g
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                          G (g)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={lotG[lot.id] ?? ''}
                          onChange={(e) => setLotG((prev) => ({ ...prev, [lot.id]: formatInputNumber(e.target.value) }))}
                          placeholder="0,00"
                          className="w-28 px-2.5 py-1.5 bg-midnight-900 border border-gold-500/20 text-slate-200 text-sm font-mono text-right outline-none transition-all focus:border-gold-500/50 placeholder-slate-700"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block -mb-0.5">% Recup.</span>
                          <span className="font-bold" style={{ color: pct !== null ? (pct < 100 ? '#EF4444' : '#22C55E') : '#64748B' }}>
                            {pct !== null ? `${pct.toFixed(2)}%` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block -mb-0.5">Dif (g)</span>
                          <span className="font-bold" style={{ color: dif !== null ? (dif < 0 ? '#EF4444' : '#22C55E') : '#64748B' }}>
                            {dif !== null ? `${dif >= 0 ? '+' : ''}${formatLocaleNumber(dif)}` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setExpandedLots((prev) => ({ ...prev, [lot.id]: !isExpanded }))}
                    className="w-full flex items-center gap-2 px-4 sm:px-5 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest hover:bg-blue-500/5 transition-all"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Barras del Lote #{lot.number} ({lot.bars.length} barra{lot.bars.length !== 1 ? 's' : ''})
                  </button>

                  {isExpanded && (
                    <div className="overflow-x-auto border-t border-blue-500/10">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-blue-500/10">
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Barra</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Bruto (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">E (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">F (g)</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {lot.bars.map((bar) => (
                            <tr key={bar.id} className="terminal-row">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-slate-300">{bar.code}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.grossWeight)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.analytical)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.expected)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                {confirmDeleteBarId === bar.id ? (
                                  <div className="flex items-center gap-1 justify-end">
                                    <button
                                      onClick={() => handleRemoveBar(lot.id, bar.id)}
                                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteBarId(null)}
                                      className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteBarId(bar.id)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    title="Quitar barra del lote"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-8 text-center">
            <p className="text-sm text-slate-500">No hay lotes en este proceso.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcesosPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, processes, openProcess, closeProcess, assignToLot } = useProcess();

  const [view, setView] = useState<PageView>('list');
  const [managingProcessId, setManagingProcessId] = useState<string | null>(null);
  const [viewingProcessId, setViewingProcessId] = useState<string | null>(null);
  const [newProcessSupplierId, setNewProcessSupplierId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const activeProcesses = useMemo(() => processes.filter((p) => p.status === 'open'), [processes]);
  const closedProcesses = useMemo(() => processes.filter((p) => p.status === 'closed'), [processes]);

  const managingProcess = useMemo(
    () => (managingProcessId ? processes.find((p) => p.id === managingProcessId) ?? null : null),
    [managingProcessId, processes]
  );

  const viewingProcess = useMemo(
    () => (viewingProcessId ? processes.find((p) => p.id === viewingProcessId) ?? null : null),
    [viewingProcessId, processes]
  );

  const managingDetail = useMemo(
    () => (managingProcess ? buildProcessDetail(managingProcess, goldBars) : null),
    [managingProcess, goldBars]
  );

  const availableBarsForManaging = useMemo(
    () => (managingProcess
      ? goldBars
          .filter((b) => b.available && b.supplierId === managingProcess.supplierId)
          .sort((a, b) => b.grossWeight - a.grossWeight)
      : []),
    [managingProcess, goldBars]
  );

  const deleteProcess = useDeleteProcess();
  const [confirmDeleteProcessId, setConfirmDeleteProcessId] = useState<string | null>(null);

  const handleDeleteProcess = async (processId: string) => {
    try {
      await deleteProcess.mutateAsync(processId);
      setConfirmDeleteProcessId(null);
      setSuccessMessage('Proceso eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      alert('Error al eliminar el proceso');
    }
  };

  const handleOpenProcess = async () => {
    if (!newProcessSupplierId) return;
    try {
      const newProc = await openProcess(newProcessSupplierId);
      setNewProcessSupplierId('');
      setManagingProcessId(newProc.id);
      setView('detail');
      setSuccessMessage(`Proceso #${newProc.number} abierto correctamente`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // error handled by react query
    }
  };

  const handleCloseProcess = async (lots?: { id: string; recovered: number }[]) => {
    if (!managingProcessId) return;
    try {
      const proc = processes.find((p) => p.id === managingProcessId);
      await closeProcess(managingProcessId, lots);
      setSuccessMessage(`Proceso #${proc?.number} cerrado definitivamente`);
      setManagingProcessId(null);
      setView('list');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // error handled by react query
    }
  };

  const handleAssign = async (barIds: string[]) => {
    if (!managingProcessId) return;
    try {
      await assignToLot(managingProcessId, barIds);
      setSuccessMessage(`${barIds.length} barra${barIds.length !== 1 ? 's' : ''} asignada${barIds.length !== 1 ? 's' : ''} a lote nuevo`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // error handled by react query
    }
  };

  if (view === 'detail' && managingDetail) {
    return (
      <div className="space-y-5">
        {successMessage && (
          <div className="glass-panel-gold p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
              <p className="text-[10px] text-gold-500/60 uppercase tracking-wider mt-0.5">Operación exitosa</p>
            </div>
          </div>
        )}

        <ProcessDetailView
          processDetail={managingDetail}
          availableBars={availableBarsForManaging}
          allBars={goldBars}
          suppliers={suppliers}
          onBack={() => { setView('list'); setManagingProcessId(null); }}
          onCloseProcess={handleCloseProcess}
          onAssign={handleAssign}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-500" />
            Configuración de Procesos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Gestión de procesos de refinación</p>
        </div>
      </div>

      {successMessage && (
        <div className="glass-panel-gold p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
            <p className="text-[10px] text-gold-500/60 uppercase tracking-wider mt-0.5">Operación exitosa</p>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <div className="p-4 sm:p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Abrir Nuevo Proceso</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Package className="w-3 h-3 inline mr-1" />
                Empresa / Proveedor
              </label>
              <select
                value={newProcessSupplierId}
                onChange={(e) => setNewProcessSupplierId(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-midnight-800">{s.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleOpenProcess}
              disabled={!newProcessSupplierId}
              className="px-5 py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Abrir Proceso
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-gold-500 rounded-sm" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Procesos Activos
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
              {String(activeProcesses.length).padStart(2, '0')}
            </span>
          </div>

          {activeProcesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {activeProcesses.map((p) => {
                const lotCount = p.lots.length;
                const barCount = p.lots.reduce((s, l) => s + l.barIds.length, 0);
                return (
                  <div key={p.id} className="glass-panel p-4 hover:border-gold-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-gold-500 font-mono">#{p.number}</p>
                        <p className="text-sm text-slate-300 mt-0.5">
                          {suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-400">
                        ACTIVO
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mb-3">
                      <span>{lotCount} lote{lotCount !== 1 ? 's' : ''}</span>
                      <span>{barCount} barra{barCount !== 1 ? 's' : ''}</span>
                      <span>Creado {new Date(p.createdAt).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setManagingProcessId(p.id); setView('detail'); }}
                        className="flex-1 py-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-bold uppercase tracking-wider hover:bg-gold-500/20 transition-all"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Settings className="w-3 h-3" />
                          Gestionar
                        </span>
                      </button>
                      {confirmDeleteProcessId === p.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteProcess(p.id)}
                            className="px-2 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteProcessId(null)}
                            className="px-2 py-2 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteProcessId(p.id)}
                          className="px-3 py-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                          title="Eliminar proceso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center">
              <p className="text-sm text-slate-500">No hay procesos activos.</p>
              <p className="text-[10px] text-slate-600 mt-1">Selecciona un proveedor y abre un nuevo proceso.</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-blue-500 rounded-sm" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Procesos Cerrados
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/20">
              {String(closedProcesses.length).padStart(2, '0')}
            </span>
          </div>

          {closedProcesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {closedProcesses.map((p) => {
                const lotCount = p.lots.length;
                const barCount = p.lots.reduce((s, l) => s + l.barIds.length, 0);
                return (
                  <div key={p.id} className="glass-panel p-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-slate-400 font-mono">#{p.number}</p>
                        <p className="text-sm text-slate-300 mt-0.5">
                          {suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          CERRADO
                        </span>
                        {confirmDeleteProcessId === p.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDeleteProcess(p.id)}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteProcessId(null)}
                              className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteProcessId(p.id)}
                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Eliminar proceso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mb-3">
                      <span>{lotCount} lote{lotCount !== 1 ? 's' : ''}</span>
                      <span>{barCount} barra{barCount !== 1 ? 's' : ''}</span>
                      {p.closedAt && <span>Cerrado {new Date(p.closedAt).toLocaleDateString('es-PE')}</span>}
                    </div>
                    <button
                      onClick={() => setViewingProcessId(p.id)}
                      className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Eye className="w-3 h-3" />
                        Ver Detalle
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center">
              <p className="text-sm text-slate-500">No hay procesos cerrados.</p>
            </div>
          )}
        </div>
      </div>

      {viewingProcess && (
        <ProcessModal
          process={viewingProcess}
          allBars={goldBars}
          suppliers={suppliers}
          onClose={() => setViewingProcessId(null)}
        />
      )}
    </div>
  );
}
