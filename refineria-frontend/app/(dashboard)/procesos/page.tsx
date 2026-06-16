'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDeleteProcess, useRemoveBarsFromLot } from '@/lib/hooks/useProcesses';
import { getSupplierName, parseLocaleNumber, formatLocaleNumber, formatInputNumber } from '@/lib/utils';
import type { Process, ProcessLot, GoldBar } from '@/types/refinery';
import {
  Settings, Package, Crosshair, CheckCircle, Plus, ArrowLeft,
  Lock, X, Eye, Save, ChevronDown, ChevronRight, Trash2,
  FileText, Upload,
} from 'lucide-react';
import ShakeAlert from '@/components/ShakeAlert';

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
  process: procData,
  allBars,
  suppliers,
  onClose,
}: {
  process: Process;
  allBars: GoldBar[];
  suppliers: { id: string; name: string }[] | undefined;
  onClose: () => void;
}) {
  const detail = useMemo(() => buildProcessDetail(procData, allBars), [procData, allBars]);

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
                        <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Serial</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Bruto (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Ley (‰)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Fino Analítico — E (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Fino Esperado — F (g)</th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Fino Recuperado — G (g)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lot.bars.map((bar) => (
                        <tr key={bar.id} className="terminal-row">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-slate-300">{bar.code}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.grossWeight)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.ley != null ? formatLocaleNumber(bar.ley) : '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.analytical)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.expected)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.recovered)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          </div>

        {detail.status === 'closed' && (
          <div className="p-5 border-t border-blue-500/10">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Documentos de Validaci&oacute;n</h3>
            </div>
            {detail.actaRecepcion || detail.actaFundicion || detail.actaConformidad ? (
              <div className="flex flex-wrap gap-3">
                {[
                  { type: 'recepcion', label: 'Acta de Recepci&oacute;n', url: detail.actaRecepcion },
                  { type: 'fundicion', label: 'Acta de Fundici&oacute;n', url: detail.actaFundicion },
                  { type: 'conformidad', label: 'Acta de Conformidad', url: detail.actaConformidad },
                ].map((acta) => (
                  acta.url ? (
                    <a
                      key={acta.label}
                      href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/processes/${detail.id}/actas/${acta.type}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
                    >
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{acta.label}</span>
                    </a>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No hay documentos de validaci&oacute;n asociados.</p>
            )}
          </div>
        )}

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
  onCloseProcessWithActas,
  onAssign,
  onMarkComplete,
  saveLotRecovered,
}: {
  processDetail: ProcessDetail;
  availableBars: GoldBar[];
  allBars: GoldBar[];
  suppliers: { id: string; name: string }[] | undefined;
  onBack: () => void;
  onCloseProcess: (lots?: { id: string; recovered: number }[]) => void;
  onCloseProcessWithActas: (files: { actaRecepcion: File; actaFundicion: File; actaConformidad: File }, lots: { id: string; recovered: number }[]) => void;
  onAssign: (barIds: string[]) => void;
  onMarkComplete: () => Promise<void>;
  saveLotRecovered: (processId: string, lotId: string, recovered: number) => Promise<unknown>;
}) {
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);
  const [closeWarning, setCloseWarning] = useState('');
  const [assignWarning, setAssignWarning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [lotG, setLotG] = useState<Record<string, string>>({});
  const [savingG, setSavingG] = useState<Record<string, boolean>>({});
  const [savedG, setSavedG] = useState<Record<string, boolean>>({});
  const [expandedLots, setExpandedLots] = useState<Record<string, boolean>>({});
  const [confirmDeleteBarId, setConfirmDeleteBarId] = useState<string | null>(null);
  const [actaRecepcion, setActaRecepcion] = useState<File | null>(null);
  const [actaFundicion, setActaFundicion] = useState<File | null>(null);
  const [actaConformidad, setActaConformidad] = useState<File | null>(null);
  const [uploadingActas, setUploadingActas] = useState(false);
  const removeBarsFromLot = useRemoveBarsFromLot();

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const lot of processDetail.lotDetails) {
      if (lot.recovered != null && lot.recovered > 0) {
        initial[lot.id] = formatLocaleNumber(lot.recovered);
      }
    }
    setLotG(initial);
    setSavingG({});
    setSavedG({});
  }, [processDetail.id]);

  const isOpen = processDetail.status === 'open';
  const isInProgress = processDetail.status === 'in_progress';

  const anyLotBlocked = processDetail.lotDetails.some((lot) => {
    const totalWeight = lot.grossWeight;
    const totalWeightedLey = lot.bars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
    const avgLey = totalWeight > 0 ? totalWeightedLey / totalWeight : 0;
    return totalWeight < 2000 || avgLey < 900;
  });

  const handleRemoveBar = async (lotId: string, barId: string) => {
    try {
      await removeBarsFromLot.mutateAsync({
        processId: processDetail.id,
        lotId,
        barIds: [barId],
      });
      setConfirmDeleteBarId(null);
    } catch {
      setErrorMessage('Error al eliminar la barra del lote');
      setShakeKey((k) => k + 1);
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

    const selectedBars = availableBars.filter((b) => selectedBarIds.includes(b.id));
    const totalWeight = selectedBars.reduce((s, b) => s + b.grossWeight, 0);
    const totalWeightedLey = selectedBars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
    const avgLey = totalWeight > 0 ? totalWeightedLey / totalWeight : 0;

    if (totalWeight < 2000 || avgLey < 900) {
      const reasons: string[] = [];
      if (totalWeight < 2000) reasons.push(`peso mínimo de 2.000 g (faltan ${(2000 - totalWeight).toFixed(2)} g)`);
      if (avgLey < 900) reasons.push(`ley promedio de 900 (actual: ${avgLey.toFixed(2)})`);
      setAssignWarning(`Las barras seleccionadas no cumplen: ${reasons.join(' y ')}.`);
      setTimeout(() => setAssignWarning(''), 5000);
      return;
    }

    onAssign(selectedBarIds);
    setSelectedBarIds([]);
  };

  const handleSaveLotG = async (lotId: string) => {
    const gVal = getLotG(lotId);
    if (gVal === null) return;
    setSavingG((prev) => ({ ...prev, [lotId]: true }));
    try {
      await saveLotRecovered(processDetail.id, lotId, gVal);
      if (isOpen) {
        await onMarkComplete();
      }
      setSavedG((prev) => ({ ...prev, [lotId]: true }));
      setTimeout(() => {
        setSavedG((prev) => ({ ...prev, [lotId]: false }));
      }, 3000);
    } catch {
      setErrorMessage('Error al guardar el peso recuperado');
      setShakeKey((k) => k + 1);
    } finally {
      setSavingG((prev) => ({ ...prev, [lotId]: false }));
    }
  };

  const handleCloseClick = async () => {
    if (!hasBars) {
      setCloseWarning('No se puede cerrar el proceso porque no contiene barras asignadas.');
      setTimeout(() => setCloseWarning(''), 4000);
      return;
    }

    if (anyLotBlocked) {
      setCloseWarning('No se puede cerrar el proceso: hay lotes que no cumplen con el peso mínimo de 2.000 g o la ley promedio de 900.');
      setTimeout(() => setCloseWarning(''), 5000);
      return;
    }

    if (isInProgress) {
      const missingG = processDetail.lotDetails.some(
        (lot) => getLotG(lot.id) === null,
      );
      if (missingG) {
        setCloseWarning('Debe ingresar el Peso Fino Recuperado para todos los lotes antes de cerrar el proceso.');
        setTimeout(() => setCloseWarning(''), 5000);
        return;
      }
    }

    const allFilesReady = actaRecepcion && actaFundicion && actaConformidad;
    if (!allFilesReady) {
      setCloseWarning('Debe subir las 3 actas de validación (Recepción, Fundición y Conformidad) antes de cerrar el proceso.');
      setTimeout(() => setCloseWarning(''), 5000);
      return;
    }

    setUploadingActas(true);
    try {
      const lots = processDetail.lotDetails.map((lot) => ({
        id: lot.id,
        recovered: getLotG(lot.id)!,
      }));
      await onCloseProcessWithActas(
        { actaRecepcion: actaRecepcion!, actaFundicion: actaFundicion!, actaConformidad: actaConformidad! },
        lots,
      );
    } finally {
      setUploadingActas(false);
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
              {isOpen ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  ABIERTO
                </span>
              ) : isInProgress ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  EN PROCESO
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 text-slate-400">
                  CERRADO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
              {processDetail.lotDetails.length} lote{processDetail.lotDetails.length !== 1 ? 's' : ''} creado{processDetail.lotDetails.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {isOpen && (
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
                            <span className="text-xs font-mono text-slate-400">{formatLocaleNumber(bar.grossWeight)} g</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono mt-0.5">
                            <span>Ley: {bar.ley != null ? formatLocaleNumber(bar.ley) : '—'}</span>
                            <span>E: {formatLocaleNumber(bar.analytical)}</span>
                            <span>F: {formatLocaleNumber(bar.expected)}</span>
                            <span>G: {formatLocaleNumber(bar.recovered)}</span>
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

                {selectedBarIds.length > 0 && (() => {
                  const selBars = availableBars.filter((b) => selectedBarIds.includes(b.id));
                  const selWeight = selBars.reduce((s, b) => s + b.grossWeight, 0);
                  const selWeightedLey = selBars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
                  const selAvgLey = selWeight > 0 ? selWeightedLey / selWeight : 0;
                  const selValid = selWeight >= 2000 && selAvgLey >= 900;
                  return (
                    <div className={`px-3 py-2 text-[10px] font-mono border ${selValid ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'}`}>
                      Σ Peso: {formatLocaleNumber(selWeight)} g &middot; Ley prom: {selAvgLey.toFixed(1)} &permil;
                      {!selValid && <span className="ml-1">→ No cumple</span>}
                    </div>
                  );
                })()}

                {assignWarning && (
                  <div className="bg-red-500/10 border border-red-500/30 p-2">
                    <p className="text-xs text-red-400">{assignWarning}</p>
                  </div>
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
        )}

        <div className={isOpen ? 'lg:col-span-3' : 'lg:col-span-5'}>
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
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lote N°</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Bruto (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Fino Analítico — E (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Fino Esperado — F (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Fino Recuperado — G (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recuperación</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Diferencia (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {processDetail.lotDetails.length > 0 ? (
                    [...processDetail.lotDetails].reverse().map((lot) => {
                      const liveG = getLotG(lot.id) ?? lot.g;
                      const livePct = lot.e > 0 ? (liveG / lot.e) * 100 : 0;
                      const liveDif = liveG - lot.f;
                      return (
                        <tr key={lot.id} className="terminal-row">
                          <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">#{lot.number}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatLocaleNumber(lot.grossWeight)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatLocaleNumber(lot.e)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatLocaleNumber(lot.f)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{formatLocaleNumber(liveG)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">{formatLocaleNumber(livePct)}%</td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono" style={{ color: liveDif < 0 ? '#EF4444' : '#22C55E' }}>
                            {liveDif >= 0 ? '+' : ''}{formatLocaleNumber(liveDif)}
                          </td>
                        </tr>
                      );
                    })
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
            const totalWeight = lot.grossWeight;
            const totalWeightedLey = lot.bars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
            const avgLey = totalWeight > 0 ? totalWeightedLey / totalWeight : 0;
            const lotBlocked = totalWeight < 2000 || avgLey < 900;

            return (
              <div key={lot.id} className="glass-panel">
                <div className="p-4 sm:p-5 border-b border-blue-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gold-500 font-mono">Lote #{lot.number}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        Σ E: {formatLocaleNumber(sumE)} g · Σ F: {formatLocaleNumber(sumF)} g
                      </p>
                      {lotBlocked && (
                        <div className="bg-red-500/10 border border-red-500/30 p-2 mt-2">
                          <p className="text-xs text-red-400">
                            ⚠️ Bloqueado: El lote debe sumar un mínimo de 2.000 g y tener una ley promedio de 900 o superior para ser procesado.
                          </p>
                        </div>
                      )}
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (isOpen || isInProgress) && !lotBlocked) {
                                e.preventDefault();
                                handleSaveLotG(lot.id);
                              }
                            }}
                            placeholder="0,00"
                            className="w-28 px-2.5 py-1.5 bg-midnight-900 border border-gold-500/20 text-slate-200 text-sm font-mono text-right outline-none transition-all focus:border-gold-500/50 placeholder-slate-700"
                          />
        {(isOpen || isInProgress) && (
                          <button
                            onClick={() => handleSaveLotG(lot.id)}
                            disabled={savingG[lot.id] || getLotG(lot.id) === null || lotBlocked}
                            className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                          >
                            {savingG[lot.id] ? (
                              <Save className="w-3 h-3 animate-spin" />
                            ) : savedG[lot.id] ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Guardado
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Save className="w-3 h-3" />
                                {isOpen ? 'Guardar' : 'Guardar G'}
                              </span>
                            )}
                          </button>
                        )}
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
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Serial</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Bruto (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Ley (‰)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Fino Analítico — E (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Peso Fino Esperado — F (g)</th>
                            {isOpen && <th className="px-3 py-2" />}
                          </tr>
                        </thead>
                        <tbody>
                          {lot.bars.map((bar) => (
                            <tr key={bar.id} className="terminal-row">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-slate-300">{bar.code}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.grossWeight)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.ley != null ? formatLocaleNumber(bar.ley) : '—'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.analytical)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.expected)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                {isOpen && (confirmDeleteBarId === bar.id ? (
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
                                ))}
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

        {processDetail.status === 'closed' && (
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Documentos de Validación</h2>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {processDetail.actaRecepcion || processDetail.actaFundicion || processDetail.actaConformidad ? (
                <div className="flex flex-wrap gap-3">
                  {[
                    { type: 'recepcion', label: 'Acta de Recepción', url: processDetail.actaRecepcion },
                    { type: 'fundicion', label: 'Acta de Fundición', url: processDetail.actaFundicion },
                    { type: 'conformidad', label: 'Acta de Conformidad', url: processDetail.actaConformidad },
                  ].map((acta) => (
                    acta.url ? (
                      <a
                        key={acta.label}
                        href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/processes/${processDetail.id}/actas/${acta.type}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
                      >
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{acta.label}</span>
                      </a>
                    ) : null
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No hay documentos de validación asociados.</p>
              )}
            </div>
          </div>
        )}
      </div>

        {isInProgress && (
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subir Actas de Validaci&oacute;n</h2>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Adjunte las 3 actas en formato PDF para habilitar el cierre del proceso
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { key: 'recepcion', label: 'Acta de Recepci&oacute;n', state: actaRecepcion, setter: setActaRecepcion },
                  { key: 'fundicion', label: 'Acta de Fundici&oacute;n', state: actaFundicion, setter: setActaFundicion },
                  { key: 'conformidad', label: 'Acta de Conformidad', state: actaConformidad, setter: setActaConformidad },
                ] as const).map(({ key, label, state, setter }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                      {label}
                    </label>
                    {state ? (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-xs text-slate-300 truncate">{state.name}</span>
                        </div>
                        <button
                          onClick={() => setter(null)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/5 border border-dashed border-slate-700 text-slate-500 hover:bg-blue-500/10 hover:border-slate-600 hover:text-slate-400 transition-all cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Seleccionar PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setter(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <div className={`w-2 h-2 rounded-full ${actaRecepcion ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Recepci&oacute;n</span>
                <div className={`w-2 h-2 rounded-full ${actaFundicion ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Fundici&oacute;n</span>
                <div className={`w-2 h-2 rounded-full ${actaConformidad ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Conformidad</span>
              </div>

              {errorMessage && (
                <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
              )}
              {closeWarning && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2">
                  <span className="text-red-400 text-xs font-medium">{closeWarning}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-blue-500/10">
                <button
                  onClick={handleCloseClick}
                  disabled={!actaRecepcion || !actaFundicion || !actaConformidad || uploadingActas || anyLotBlocked}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    actaRecepcion && actaFundicion && actaConformidad && !uploadingActas && !anyLotBlocked
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {uploadingActas ? <Save className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    {uploadingActas ? 'Cerrando...' : 'Cerrar Proceso'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
export default function ProcesosPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, processes, openProcess, closeProcess, closeProcessWithActas, assignToLot, updateProcessStatus, saveLotRecovered } = useProcess();

  const [view, setView] = useState<PageView>('list');
  const [managingProcessId, setManagingProcessId] = useState<string | null>(null);
  const [viewingProcessId, setViewingProcessId] = useState<string | null>(null);
  const [newProcessSupplierId, setNewProcessSupplierId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const [activeTab, setActiveTab] = useState<'open' | 'in_progress' | 'closed'>('open');

  const [filterSupplierId, setFilterSupplierId] = useState('all');
  const [filterSelectOpen, setFilterSelectOpen] = useState(false);
  const filterSelectRef = useRef<HTMLDivElement>(null);

  const [filterPeriod, setFilterPeriod] = useState<'current' | 'previous' | 'last_two' | 'custom'>('last_two');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPeriodOpen, setFilterPeriodOpen] = useState(false);
  const filterPeriodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterSelectOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (filterSelectRef.current && !filterSelectRef.current.contains(e.target as Node)) {
        setFilterSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterSelectOpen]);

  useEffect(() => {
    if (!filterPeriodOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (filterPeriodRef.current && !filterPeriodRef.current.contains(e.target as Node)) {
        setFilterPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterPeriodOpen]);

  const monthRange = useMemo(() => {
    const now = new Date();
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfCurrent, startOfPrevious, endOfCurrent };
  }, []);

  const dateFilterFn = useMemo(() => {
    const { startOfCurrent, startOfPrevious, endOfCurrent } = monthRange;
    return (dateStr: string) => {
      const d = new Date(dateStr);
      switch (filterPeriod) {
        case 'current':
          return d >= startOfCurrent && d <= endOfCurrent;
        case 'previous':
          return d >= startOfPrevious && d < startOfCurrent;
        case 'custom':
          if (!filterStartDate && !filterEndDate) return true;
          if (filterStartDate && d < new Date(filterStartDate + 'T00:00:00')) return false;
          if (filterEndDate && d > new Date(filterEndDate + 'T23:59:59.999')) return false;
          return true;
        case 'last_two':
        default:
          return d >= startOfPrevious;
      }
    };
  }, [monthRange, filterPeriod, filterStartDate, filterEndDate]);

  const filteredProcessesByStatus = useMemo(() => {
    const filtered = processes.filter((p) => {
      if (filterSupplierId !== 'all' && p.supplierId !== filterSupplierId) return false;
      return dateFilterFn(p.createdAt);
    });
    return {
      open: filtered.filter((p) => p.status === 'open'),
      in_progress: filtered.filter((p) => p.status === 'in_progress'),
      closed: filtered.filter((p) => p.status === 'closed'),
    };
  }, [processes, filterSupplierId, dateFilterFn]);

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
      setErrorMessage('Error al eliminar el proceso');
      setShakeKey((k) => k + 1);
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
      setErrorMessage('Error al abrir el proceso');
      setShakeKey((k) => k + 1);
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
      setErrorMessage('Error al cerrar el proceso');
      setShakeKey((k) => k + 1);
    }
  };

  const handleCloseProcessWithActas = async (
    files: { actaRecepcion: File; actaFundicion: File; actaConformidad: File },
    lots: { id: string; recovered: number }[],
  ) => {
    if (!managingProcessId) return;
    try {
      const proc = processes.find((p) => p.id === managingProcessId);
      await closeProcessWithActas(managingProcessId, files, lots);
      setSuccessMessage(`Proceso #${proc?.number} cerrado con actas`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error cerrando proceso con actas:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setErrorMessage(`Error al cerrar el proceso: ${msg}`);
      setShakeKey((k) => k + 1);
    }
  };

  const handleMarkComplete = async () => {
    if (!managingProcessId) return;
    try {
      await updateProcessStatus(managingProcessId, 'in_progress');
      setSuccessMessage('Asignaci&oacute;n finalizada. Ahora puede ingresar el Peso Fino Recuperado (G) por lote.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setErrorMessage('Error al finalizar la asignación');
      setShakeKey((k) => k + 1);
    }
  };

  const handleAssign = async (barIds: string[]) => {
    if (!managingProcessId) return;
    try {
      await assignToLot(managingProcessId, barIds);
      setSuccessMessage(`${barIds.length} barra${barIds.length !== 1 ? 's' : ''} asignada${barIds.length !== 1 ? 's' : ''} a lote nuevo`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al asignar barras al lote';
      setErrorMessage(msg);
      setShakeKey((k) => k + 1);
    }
  };

  if (view === 'detail' && managingDetail) {
    return (
      <div className="space-y-5">
        {errorMessage && (
          <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
        )}
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
          onCloseProcessWithActas={handleCloseProcessWithActas}
          onAssign={handleAssign}
          onMarkComplete={handleMarkComplete}
          saveLotRecovered={saveLotRecovered}
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

      {errorMessage && (
        <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
      )}
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

      {/* Filtros */}
      <div className="glass-panel">
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Proveedor custom dropdown */}
            <div ref={filterSelectRef} className="relative w-full sm:w-auto">
              <button
                onClick={() => setFilterSelectOpen(!filterSelectOpen)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:border-blue-500/40 focus:outline-none focus:border-blue-500/50 text-left flex items-center justify-between gap-3 min-w-[200px]"
              >
                <span className="truncate">{filterSupplierId === 'all' ? 'Todos los clientes' : suppliers?.find((s) => s.id === filterSupplierId)?.name}</span>
                <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${filterSelectOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterSelectOpen && (
                <ul className="absolute z-50 right-0 mt-1 w-full min-w-[200px] bg-[#0f172a] border border-blue-500/20 shadow-xl">
                  <li
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterSupplierId === 'all' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setFilterSupplierId('all'); setFilterSelectOpen(false); }}
                  >Todos los clientes</li>
                  {suppliers?.map((s) => (
                    <li
                      key={s.id}
                      className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterSupplierId === s.id ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                      onClick={() => { setFilterSupplierId(s.id); setFilterSelectOpen(false); }}
                    >{s.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Periodo custom dropdown */}
            <div ref={filterPeriodRef} className="relative w-full sm:w-auto">
              <button
                onClick={() => setFilterPeriodOpen(!filterPeriodOpen)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:border-blue-500/40 focus:outline-none focus:border-blue-500/50 text-left flex items-center justify-between gap-3 min-w-[200px]"
              >
                <span className="truncate">
                  {filterPeriod === 'current' ? 'Mes actual' : filterPeriod === 'previous' ? 'Mes anterior' : filterPeriod === 'custom' ? 'Personalizado' : 'Últimos 2 meses'}
                </span>
                <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${filterPeriodOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterPeriodOpen && (
                <ul className="absolute z-50 right-0 mt-1 w-full min-w-[200px] bg-[#0f172a] border border-blue-500/20 shadow-xl">
                  <li
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterPeriod === 'last_two' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setFilterPeriod('last_two'); setFilterPeriodOpen(false); }}
                  >Últimos 2 meses</li>
                  <li
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterPeriod === 'current' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setFilterPeriod('current'); setFilterPeriodOpen(false); }}
                  >Mes actual</li>
                  <li
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterPeriod === 'previous' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setFilterPeriod('previous'); setFilterPeriodOpen(false); }}
                  >Mes anterior</li>
                  <li
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${filterPeriod === 'custom' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setFilterPeriod('custom'); setFilterPeriodOpen(false); }}
                  >Personalizado</li>
                </ul>
              )}
            </div>

            {/* Fechas personalizadas */}
            {filterPeriod === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-[7px] text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                />
                <span className="text-slate-600 text-[10px] shrink-0">—</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-[7px] text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-blue-500/10">
        {([
          { key: 'open', label: `Procesos Abiertos (${filteredProcessesByStatus.open.length})` },
          { key: 'in_progress', label: `Terminados (${filteredProcessesByStatus.in_progress.length})` },
          { key: 'closed', label: `Cerrados (${filteredProcessesByStatus.closed.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === key
                ? 'text-gold-400 border-b-2 border-gold-500 bg-gold-500/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-blue-500/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid de tarjetas */}
      {(() => {
        const cfg = {
          open: {
            processes: filteredProcessesByStatus.open,
            borderHover: 'hover:border-gold-500/30',
            numberColor: 'text-gold-500',
            badgeBg: 'bg-gold-500/10 border-gold-500/20 text-gold-400',
            badgeText: 'ACTIVO',
            emptyTitle: 'No hay procesos abiertos.',
            renderActions: (p: Process) => (
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
            ),
          },
          in_progress: {
            processes: filteredProcessesByStatus.in_progress,
            borderHover: 'hover:border-orange-500/30',
            numberColor: 'text-orange-400',
            badgeBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
            badgeText: 'TERMINADO',
            emptyTitle: 'No hay procesos terminados.',
            renderActions: (p: Process) => (
              <button
                onClick={() => { setManagingProcessId(p.id); setView('detail'); }}
                className="w-full py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider hover:bg-orange-500/20 transition-all"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Settings className="w-3 h-3" />
                  Ingresar G
                </span>
              </button>
            ),
          },
          closed: {
            processes: filteredProcessesByStatus.closed,
            borderHover: 'hover:border-blue-500/30',
            numberColor: 'text-slate-400',
            badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
            badgeText: 'CERRADO',
            emptyTitle: 'No hay procesos cerrados.',
            renderActions: (p: Process) => (
              <button
                onClick={() => setViewingProcessId(p.id)}
                className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  Ver Detalle
                </span>
              </button>
            ),
          },
        } as const;

        const list = cfg[activeTab].processes;

        return list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((p) => {
              const lotCount = p.lots.length;
              const barCount = p.lots.reduce((s, l) => s + l.barIds.length, 0);
              const gCount = p.lots.filter((l) => l.recovered !== null).length;
              return (
                <div key={p.id} className={`glass-panel p-4 transition-all ${cfg[activeTab].borderHover}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`text-lg font-bold font-mono ${cfg[activeTab].numberColor}`}>#{p.number}</p>
                      <p className="text-sm text-slate-300 mt-0.5">
                        {suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${cfg[activeTab].badgeBg}`}>
                      {cfg[activeTab].badgeText}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mb-3">
                    <span>{lotCount} lote{lotCount !== 1 ? 's' : ''}</span>
                    <span>{barCount} barra{barCount !== 1 ? 's' : ''}</span>
                    {activeTab === 'in_progress' && (
                      <span>G: {gCount}/{lotCount} guardado{gCount !== 1 ? 's' : ''}</span>
                    )}
                    {activeTab === 'closed' && p.closedAt ? (
                      <span>Cerrado {new Date(p.closedAt).toLocaleDateString('es-PE')}</span>
                    ) : (
                      <span>Creado {new Date(p.createdAt).toLocaleDateString('es-PE')}</span>
                    )}
                  </div>
                  {cfg[activeTab].renderActions(p)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center">
            <p className="text-sm text-slate-500">{cfg[activeTab].emptyTitle}</p>
            {activeTab === 'open' && (
              <p className="text-[10px] text-slate-600 mt-1">Selecciona un proveedor y abre un nuevo proceso.</p>
            )}
          </div>
        );
      })()}

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
