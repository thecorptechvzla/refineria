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
import { ProcessModal, buildProcessDetail } from '@/components/shared/ProcessModal';
import type { ProcessDetail, LotDetail } from '@/components/shared/ProcessModal';
import { validateProcessBars } from '@/lib/processValidation';

type PageView = 'list' | 'detail';

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
  saveLotBarsLeyAg,
  uploadFile,
  saveActaUrl,
}: {
  processDetail: ProcessDetail;
  availableBars: GoldBar[];
  allBars: GoldBar[];
  suppliers: { id: string; name: string }[] | undefined;
  onBack: () => void;
  onCloseProcess: (lots?: { id: string; recovered: number }[]) => void;
  onCloseProcessWithActas: (actas: { actaRecepcion: string; actaFundicion: string; actaConformidad: string }, lots: { id: string; recovered: number }[]) => void;
  onAssign: (barIds: string[]) => void;
  onMarkComplete: () => Promise<void>;
  saveLotRecovered: (processId: string, lotId: string, recovered: number) => Promise<unknown>;
  saveLotBarsLeyAg: (processId: string, lotId: string, bars: { barId: string; leyAg: number }[]) => Promise<unknown>;
  uploadFile: (file: File) => Promise<{ url: string }>;
  saveActaUrl: (data: { processId: string; actaRecepcion?: string | null; actaFundicion?: string | null; actaConformidad?: string | null }) => Promise<unknown>;
}) {
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);
  const [lotLeyAg, setLotLeyAg] = useState<Record<string, Record<string, string>>>({});
  const [closeWarning, setCloseWarning] = useState('');
  const [closeError, setCloseError] = useState<string | null>(null);
  const [assignWarning, setAssignWarning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [lotG, setLotG] = useState<Record<string, string>>({});
  const [savingG, setSavingG] = useState<Record<string, boolean>>({});
  const [editingG, setEditingG] = useState<Record<string, boolean>>({});
  const [expandedLots, setExpandedLots] = useState<Record<string, boolean>>({});
  const [confirmDeleteBarId, setConfirmDeleteBarId] = useState<string | null>(null);
  const [actaUrls, setActaUrls] = useState<Record<string, string>>({});
  const [uploadingActa, setUploadingActa] = useState<Record<string, boolean>>({});
  const removeBarsFromLot = useRemoveBarsFromLot();
  const [sortBy, setSortBy] = useState<'lot-asc' | 'lot-desc'>('lot-asc');
  const [filterLot, setFilterLot] = useState<string | null>(null);
  const [showLeyAgWarning, setShowLeyAgWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const availableLotNumbers = useMemo(() => {
    const lots = new Set<string>();
    for (const bar of availableBars) {
      if (bar.originalLot) lots.add(bar.originalLot);
    }
    return [...lots].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [availableBars]);

  const sortedAvailableBars = useMemo(() => {
    let copy = filterLot
      ? availableBars.filter((b) => b.originalLot === filterLot)
      : [...availableBars];
    copy.sort((a, b) => {
      const lotCmp = (() => {
        if (!a.originalLot && !b.originalLot) return 0;
        if (!a.originalLot) return 1;
        if (!b.originalLot) return -1;
        return sortBy === 'lot-asc'
          ? a.originalLot.localeCompare(b.originalLot, undefined, { numeric: true, sensitivity: 'base' })
          : b.originalLot.localeCompare(a.originalLot, undefined, { numeric: true, sensitivity: 'base' });
      })();
      return lotCmp !== 0 ? lotCmp : b.grossWeight - a.grossWeight;
    });
    return copy;
  }, [availableBars, sortBy, filterLot]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const lot of processDetail.lotDetails) {
      if (lot.recovered != null && lot.recovered > 0) {
        initial[lot.id] = formatLocaleNumber(lot.recovered);
      }
    }
    setLotG(initial);
    setSavingG({});
    const editingInitial: Record<string, boolean> = {};
    for (const lot of processDetail.lotDetails) {
      editingInitial[lot.id] = !(lot.recovered != null && lot.recovered > 0);
    }
    setEditingG(editingInitial);
    setSavingLeyAg({});
    setEditingLeyAg({});
    setLotLeyAg({});
    setActaUrls({
      ...(processDetail.actaRecepcion ? { recepcion: processDetail.actaRecepcion } : {}),
      ...(processDetail.actaFundicion ? { fundicion: processDetail.actaFundicion } : {}),
      ...(processDetail.actaConformidad ? { conformidad: processDetail.actaConformidad } : {}),
    });
    setUploadingActa({});
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

  const handleToggleAllFiltered = () => {
    const visibleIds = sortedAvailableBars.map((b) => b.id);
    const allSelected = visibleIds.every((id) => selectedBarIds.includes(id));
    setSelectedBarIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  const handleAssign = () => {
    if (selectedBarIds.length === 0) return;

    const selectedBars = availableBars.filter((b) => selectedBarIds.includes(b.id));
    const totalWeight = selectedBars.reduce((s, b) => s + b.grossWeight, 0);
    const totalWeightedLey = selectedBars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
    const avgLey = totalWeight > 0 ? totalWeightedLey / totalWeight : 0;

    const warnings: string[] = [];

    if (totalWeight < 2000 || avgLey < 900) {
      const reasons: string[] = [];
      if (totalWeight < 2000) reasons.push(`peso mínimo de 2.000 g (faltan ${(2000 - totalWeight).toFixed(2)} g)`);
      if (avgLey < 900) reasons.push(`ley promedio de 900 (actual: ${avgLey.toFixed(2)})`);
      warnings.push(`Las barras seleccionadas no cumplen: ${reasons.join(' y ')}.`);
    }

    const existingBars = processDetail.lotDetails.flatMap((l) => l.bars);
    const processValidation = validateProcessBars(existingBars, selectedBars);
    if (!processValidation.valid) {
      warnings.push(processValidation.errors.join(' '));
    }

    if (warnings.length > 0) {
      setAssignWarning(warnings.join(' '));
      setTimeout(() => setAssignWarning(''), 5000);
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
      setEditingG((prev) => ({ ...prev, [lotId]: false }));
      const lotGNum = processDetail.lotDetails.find((l) => l.id === lotId)?.number;
      setSuccessMessage(`Peso fino recuperado guardado correctamente para el Lote #${lotGNum}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Error al guardar el peso recuperado');
      setShakeKey((k) => k + 1);
    } finally {
      setSavingG((prev) => ({ ...prev, [lotId]: false }));
    }
  };

  const [savingLeyAg, setSavingLeyAg] = useState<Record<string, boolean>>({});
  const [editingLeyAg, setEditingLeyAg] = useState<Record<string, boolean>>({});

  const handleSaveLotLeyAg = async (lotId: string) => {
    const lot = processDetail.lotDetails.find((l) => l.id === lotId);
    if (!lot) return;

    const typedValues = lotLeyAg[lotId] || {};

    const entries = lot.bars
      .map((bar) => {
        const raw = typedValues[bar.id] ?? (bar.leyAg != null ? String(bar.leyAg) : '');
        if (!raw || !raw.trim()) return null;
        const parsed = parseLocaleNumber(raw);
        if (isNaN(parsed)) return null;
        return { barId: bar.id, leyAg: parsed };
      })
      .filter((b): b is { barId: string; leyAg: number } => b !== null);

    if (entries.length === 0) {
      setShowLeyAgWarning(true);
      return;
    }

    setSavingLeyAg((prev) => ({ ...prev, [lotId]: true }));
    try {
      await saveLotBarsLeyAg(processDetail.id, lotId, entries);
      setEditingLeyAg((prev) => ({ ...prev, [lotId]: false }));
      const lotLeyAgNum = processDetail.lotDetails.find((l) => l.id === lotId)?.number;
      setSuccessMessage(`Ley Ag guardada correctamente para el Lote #${lotLeyAgNum}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Error al guardar Ley Ag');
      setShakeKey((k) => k + 1);
    } finally {
      setSavingLeyAg((prev) => ({ ...prev, [lotId]: false }));
    }
  };

  const handleEditLeyAg = (lotId: string) => {
    setEditingLeyAg((prev) => ({ ...prev, [lotId]: true }));
  };

  const handleCloseClick = async () => {
    if (!hasBars) {
      setCloseWarning('No se puede cerrar el proceso porque no contiene barras asignadas.');
      return;
    }

    if (anyLotBlocked) {
      setCloseWarning('Hay lotes que no cumplen con el peso mínimo de 2.000 g o la ley promedio de 900.');
    }

    if (isInProgress) {
      const missingG = processDetail.lotDetails.some(
        (lot) => getLotG(lot.id) === null,
      );
      if (missingG) {
        setCloseWarning('Debe ingresar el Peso Fino Recuperado para todos los lotes antes de cerrar el proceso.');
        return;
      }
    }

    const missingLots = processDetail.lotDetails
      .filter((lot) =>
        lot.bars.some((bar) => bar.leyAg == null),
      )
      .map((lot) => lot.number);

    if (missingLots.length > 0) {
      const lotList = missingLots.map((n) => `Lote #${n}`).join(', ');
      setCloseError(`No se puede cerrar el proceso. Faltan barras por asignarles la Ley de Plata (Ley Ag) en los siguientes lotes: ${lotList}.`);
      return;
    }

    if (!actaUrls.recepcion || !actaUrls.fundicion || !actaUrls.conformidad) {
      setCloseWarning('Debe subir las 3 actas de validación (Recepción, Fundición y Conformidad) antes de cerrar el proceso.');
      return;
    }

    setErrorMessage('');
    try {
      const lots = processDetail.lotDetails.map((lot) => ({
        id: lot.id,
        recovered: getLotG(lot.id)!,
      }));
      await onCloseProcessWithActas(
        { actaRecepcion: actaUrls.recepcion, actaFundicion: actaUrls.fundicion, actaConformidad: actaUrls.conformidad },
        lots,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cerrar el proceso';
      setErrorMessage(msg);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <><div className="space-y-5">
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{sortedAvailableBars.length} barra{sortedAvailableBars.length !== 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={filterLot ?? ''}
                          onChange={(e) => setFilterLot(e.target.value || null)}
                          className="bg-midnight-800 border border-midnight-700 text-white text-[10px] font-mono px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value="">Todos los Lotes</option>
                          {availableLotNumbers.map((lot) => (
                            <option key={lot} value={lot}>Lote {lot}</option>
                          ))}
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'lot-asc' | 'lot-desc')}
                          className="bg-midnight-800 border border-midnight-700 text-white text-[10px] font-mono px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value="lot-asc">Lote: Ascendente (1, 2, 3…)</option>
                          <option value="lot-desc">Lote: Descendente (…3, 2, 1)</option>
                        </select>
                      </div>
                    </div>
                    {filterLot && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleToggleAllFiltered}
                          className="text-[10px] font-mono text-slate-400 bg-midnight-700 hover:bg-midnight-600 px-2 py-1 border border-midnight-600 transition-all"
                        >
                          {sortedAvailableBars.every((b) => selectedBarIds.includes(b.id))
                            ? 'Deseleccionar Todo'
                            : 'Seleccionar Todo'}
                        </button>
                      </div>
                    )}
                    {sortedAvailableBars.length > 0 ? (
                      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                        {sortedAvailableBars.map((bar) => (
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
                                {bar.originalLot && (
                                  <span className="bg-midnight-700 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-mono leading-none">Lote: {bar.originalLot}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                ) : (
                  <p className="text-center text-sm text-slate-500 py-6">
                    {filterLot ? `No hay barras en el lote ${filterLot}.` : 'No hay barras disponibles para este proveedor.'}
                  </p>
                )}

                {selectedBarIds.length > 0 && (() => {
                  const selBars = availableBars.filter((b) => selectedBarIds.includes(b.id));
                  const selWeight = selBars.reduce((s, b) => s + b.grossWeight, 0);
                  const selWeightedLey = selBars.reduce((s, b) => s + (b.ley ?? 0) * b.grossWeight, 0);
                  const selAvgLey = selWeight > 0 ? selWeightedLey / selWeight : 0;
                  const existingBars = processDetail.lotDetails.flatMap((l) => l.bars);
                  const processVal = validateProcessBars(existingBars, selBars);
                  const selValid = selWeight >= 2000 && selAvgLey >= 900 && processVal.valid;
                  return (
                    <div className="space-y-1">
                      <div className={`px-3 py-2 text-[10px] font-mono border ${selValid ? 'border-emerald-500/20 text-emerald-400' : 'border-yellow-500/20 text-yellow-400'}`}>
                        Σ Peso: {formatLocaleNumber(selWeight)} g &middot; Ley prom: {selAvgLey.toFixed(1)} &permil;
                        {!selValid && <span className="ml-1">→ Advertencia de Ley/Peso</span>}
                      </div>
                      {processVal.errors.length > 0 && (
                        <div className="px-3 py-1.5 text-[10px] font-mono border border-orange-500/20 text-orange-400">
                          {processVal.errors.join(' ')}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {assignWarning && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-2">
                    <p className="text-xs text-yellow-400">{assignWarning}</p>
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
                    [...processDetail.lotDetails].sort((a, b) => a.number - b.number).map((lot) => {
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
          [...processDetail.lotDetails].sort((a, b) => a.number - b.number).map((lot) => {
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
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 mt-2">
                          <p className="text-xs text-yellow-400">
                            ⚠️ Advertencia: El lote no cumple con el estándar de calidad (mín. 2.000 g y ley prom. 900). Puede registrar el peso recuperado y trabajar el lote.
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
                              const ctrl = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
                              if (ctrl.includes(e.key)) return;
                              if (e.key === ',' || e.key === '.') return;
                              if (e.key >= '0' && e.key <= '9') return;
                              e.preventDefault();
                              if (e.key === 'Enter' && (isOpen || isInProgress)) {
                                handleSaveLotG(lot.id);
                              }
                            }}
                            placeholder="0,00"
                            disabled={!editingG[lot.id]}
                            className="w-28 px-2.5 py-1.5 bg-midnight-900 border border-gold-500/20 text-slate-200 text-sm font-mono text-right outline-none transition-all focus:border-gold-500/50 placeholder-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
        {(isOpen || isInProgress) && (
                          <button
                            onClick={() => {
                              if (!editingG[lot.id]) {
                                setEditingG((prev) => ({ ...prev, [lot.id]: true }));
                              } else {
                                handleSaveLotG(lot.id);
                              }
                            }}
                            disabled={savingG[lot.id]}
                            className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                              !editingG[lot.id]
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : savingG[lot.id]
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 opacity-50 cursor-not-allowed'
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {savingG[lot.id] ? (
                              <Save className="w-3 h-3 animate-spin" />
                            ) : !editingG[lot.id] ? (
                              <span className="flex items-center gap-1">
                                <Save className="w-3 h-3" />
                                Editar
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
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">E (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">F (g)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Ley Ag (‰)</th>
                            <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Ag (g)</th>
                            {isOpen && <th className="px-3 py-2" />}
                          </tr>
                        </thead>
                        <tbody>
                           {[...lot.bars].sort((a, b) => a.grossWeight - b.grossWeight).map((bar) => {
                             const leyAgVal = lotLeyAg[lot.id]?.[bar.id] ?? (bar.leyAg != null ? String(bar.leyAg) : '');
                            const leyAgNum = parseLocaleNumber(leyAgVal);
                            const calculatedAg = !isNaN(leyAgNum) && leyAgNum > 0
                              ? bar.grossWeight * leyAgNum / 1000
                              : (bar.analyticalAg ?? null);
                            return (
                            <tr key={bar.id} className="terminal-row">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-slate-300">{bar.code}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.grossWeight)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{bar.ley != null ? formatLocaleNumber(bar.ley) : '—'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.analytical)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">{formatLocaleNumber(bar.expected)}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                    {(isOpen || isInProgress) && (
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={leyAgVal}
                                        onChange={(e) => setLotLeyAg((prev) => ({
                                          ...prev,
                                          [lot.id]: { ...(prev[lot.id] || {}), [bar.id]: formatInputNumber(e.target.value) },
                                        }))}
                                        onKeyDown={(e) => {
                                          const ctrl = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                                          if (ctrl.includes(e.key)) return;
                                          if (e.key === ',' || e.key === '.') return;
                                          if (e.key >= '0' && e.key <= '9') return;
                                          e.preventDefault();
                                        }}
                                        disabled={lot.bars.every((b) => b.leyAg != null) && !editingLeyAg[lot.id]}
                                        className="w-16 px-1.5 py-0.5 bg-midnight-900 border border-blue-500/20 text-slate-200 text-[11px] font-mono text-center outline-none text-right disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="—"
                                      />
                                    )}
                                {!isOpen && !isInProgress && (
                                  <span className="text-sm font-mono text-slate-400">{bar.leyAg != null ? formatLocaleNumber(bar.leyAg) : '—'}</span>
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-mono text-slate-400">
                                {calculatedAg !== null ? formatLocaleNumber(calculatedAg) : '—'}
                              </td>
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
                            );
                          })}
                        </tbody>
                      </table>
                      {(isOpen || isInProgress) && (
                        <div className="flex justify-end px-3 py-2 border-t border-blue-500/10">
                          {lot.bars.every((b) => b.leyAg != null) && !editingLeyAg[lot.id] ? (
                            <button
                              onClick={() => handleEditLeyAg(lot.id)}
                              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Editar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveLotLeyAg(lot.id)}
                              disabled={savingLeyAg[lot.id]}
                              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                            >
                              {savingLeyAg[lot.id] ? (
                                <Save className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-3 h-3" />
                                  Guardar Ley Ag
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
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
                <><div className="flex flex-wrap gap-3">
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
                <p className="text-[9px] text-slate-400 mt-2">Peso máximo: 10 MB por PDF</p></>
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
                  { key: 'recepcion', label: 'Acta de Recepción' },
                  { key: 'fundicion', label: 'Acta de Fundición' },
                  { key: 'conformidad', label: 'Acta de Conformidad' },
                ] as const).map(({ key, label }) => {
                  const existingUrl = actaUrls[key];
                  const isUploading = uploadingActa[key];

                  return (
                    <div key={key}>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        {label}
                      </label>
                      {existingUrl ? (
                        <div className="flex items-center justify-between px-3 py-2.5 bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-green-400 shrink-0" />
                            <a
                              href={`/api/processes/${processDetail.id}/actas/${key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-300 truncate hover:text-green-400 underline underline-offset-2"
                            >
                              Ver PDF
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer transition-colors">
                              <Upload className="w-3 h-3" />
                              <span>Reemplazar</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingActa((prev) => ({ ...prev, [key]: true }));
                                  try {
                                    const { url } = await uploadFile(file);
                                    await saveActaUrl({
                                      processId: processDetail.id,
                                      [`acta${key.charAt(0).toUpperCase() + key.slice(1)}`]: url,
                                    });
                                    setActaUrls((prev) => ({ ...prev, [key]: url }));
                                  } catch {
                                    setErrorMessage(`Error al subir ${label}. Intente de nuevo.`);
                                    setShakeKey((k) => k + 1);
                                  } finally {
                                    setUploadingActa((prev) => ({ ...prev, [key]: false }));
                                  }
                                }}
                              />
                            </label>
                            <button
                              onClick={() => {
                                setActaUrls((prev) => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                });
                                saveActaUrl({
                                  processId: processDetail.id,
                                  [`acta${key.charAt(0).toUpperCase() + key.slice(1)}`]: null,
                                }).catch(() => {});
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                              title="Eliminar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : isUploading ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/5 border border-dashed border-slate-700">
                          <Save className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Subiendo...</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-500/5 border border-dashed border-slate-700 text-slate-500 hover:bg-blue-500/10 hover:border-slate-600 hover:text-slate-400 transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wider">Seleccionar PDF</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingActa((prev) => ({ ...prev, [key]: true }));
                              try {
                                const { url } = await uploadFile(file);
                                await saveActaUrl({
                                  processId: processDetail.id,
                                  [`acta${key.charAt(0).toUpperCase() + key.slice(1)}`]: url,
                                });
                                setActaUrls((prev) => ({ ...prev, [key]: url }));
                              } catch {
                                setErrorMessage(`Error al subir ${label}. Intente de nuevo.`);
                                setShakeKey((k) => k + 1);
                              } finally {
                                setUploadingActa((prev) => ({ ...prev, [key]: false }));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-400">Peso máximo: 10 MB por PDF</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <div className={`w-2 h-2 rounded-full ${actaUrls.recepcion ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Recepci&oacute;n</span>
                <div className={`w-2 h-2 rounded-full ${actaUrls.fundicion ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Fundici&oacute;n</span>
                <div className={`w-2 h-2 rounded-full ${actaUrls.conformidad ? 'bg-green-500' : 'bg-slate-700'}`} />
                <span>Conformidad</span>
              </div>

              {errorMessage && (
                <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
              )}
              {closeWarning && (
                <div className="bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-xs text-red-400">{closeWarning}</p>
                </div>
              )}
              {closeError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                  <div className="glass-panel p-6 max-w-sm w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Ley Ag pendiente</span>
                      <button onClick={() => setCloseError(null)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-300">{closeError}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-blue-500/10">
                <button
                  onClick={handleCloseClick}
                  disabled={!actaUrls.recepcion || !actaUrls.fundicion || !actaUrls.conformidad}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    actaUrls.recepcion && actaUrls.fundicion && actaUrls.conformidad
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Cerrar Proceso
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>

      {showLeyAgWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center">
            <p className="text-sm text-slate-300 mb-4">
              Debes ingresar la Ley Ag para al menos una barra antes de guardar.
            </p>
            <button
              onClick={() => setShowLeyAgWarning(false)}
              className="px-5 py-2 bg-gold-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-gold-400 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center">
            <CheckCircle className="w-8 h-8 text-gold-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 mb-4">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="px-5 py-2 bg-gold-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-gold-400 transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export default function ProcesosPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, processes, openProcess, closeProcess, closeProcessWithActas, uploadFile, saveActaUrl, assignToLot, updateProcessStatus, saveLotRecovered, saveLotBarsLeyAg } = useProcess();

  const [view, setView] = useState<PageView>('list');
  const [managingProcessId, setManagingProcessId] = useState<string | null>(null);
  const [viewingProcessId, setViewingProcessId] = useState<string | null>(null);
  const [newProcessSupplierId, setNewProcessSupplierId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [closeSuccessMessage, setCloseSuccessMessage] = useState('');
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
    actas: { actaRecepcion: string; actaFundicion: string; actaConformidad: string },
    lots: { id: string; recovered: number }[],
  ) => {
    if (!managingProcessId) return;
    try {
      const proc = processes.find((p) => p.id === managingProcessId);
      await closeProcessWithActas(managingProcessId, actas);
      setCloseSuccessMessage(`Proceso #${proc?.number} cerrado exitosamente`);
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
          saveLotBarsLeyAg={saveLotBarsLeyAg}
          uploadFile={uploadFile}
          saveActaUrl={saveActaUrl}
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
          detail={buildProcessDetail(viewingProcess, goldBars)}
          suppliers={suppliers}
          onClose={() => setViewingProcessId(null)}
        />
      )}

      {closeSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center">
            <CheckCircle className="w-8 h-8 text-gold-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 mb-4">{closeSuccessMessage}</p>
            <button
              onClick={() => { setCloseSuccessMessage(''); setManagingProcessId(null); setView('list'); }}
              className="px-5 py-2 bg-gold-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-gold-400 transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
