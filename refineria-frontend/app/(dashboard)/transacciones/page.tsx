'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useClosedProcessesBySupplier } from '@/lib/hooks/useProcesses';
import { useCreateEgresoLot } from '@/lib/hooks/useTransactions';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { formatNumber, formatLocaleNumber, formatDate } from '@/lib/utils';
import { ArrowLeftRight, CheckCircle, Crosshair, Package, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import ShakeAlert from '@/components/ShakeAlert';
import type { ProcessLot, Process } from '@/types/refinery';

export default function TransaccionesPage() {
  const { data: suppliers } = useSuppliers();
  const { data: transactions } = useTransactions();
  const createEgreso = useCreateEgresoLot();

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierSelectOpen, setSupplierSelectOpen] = useState(false);
  const { data: closedProcesses } = useClosedProcessesBySupplier(selectedSupplierId || null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [selectedLotIds, setSelectedLotIds] = useState<Set<string>>(new Set());
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [showAuditSheet, setShowAuditSheet] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const supplierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) {
        setSupplierSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedSupplier = suppliers?.find((s) => s.id === selectedSupplierId);

  const availableLots = useMemo(() => {
    if (!closedProcesses) return [];
    const lots: { lot: ProcessLot; process: Process }[] = [];
    for (const p of closedProcesses) {
      for (const lot of p.lots) {
        const available = (lot.recovered ?? 0) - lot.egresadoG;
        if (available > 0) {
          lots.push({ lot, process: p });
        }
      }
    }
    return lots;
  }, [closedProcesses]);

  const toggleLotSelection = useCallback((lotId: string) => {
    setSelectedLotIds((prev) => {
      const next = new Set(prev);
      if (next.has(lotId)) {
        next.delete(lotId);
      } else {
        next.add(lotId);
      }
      return next;
    });
  }, []);

  const isProcessFullySelected = useCallback(
    (procId: string) => {
      const procLots = availableLots.filter((l) => l.process.id === procId);
      return procLots.length > 0 && procLots.every((l) => selectedLotIds.has(l.lot.id));
    },
    [availableLots, selectedLotIds],
  );

  const isProcessPartiallySelected = useCallback(
    (procId: string) => {
      const procLots = availableLots.filter((l) => l.process.id === procId);
      const selected = procLots.filter((l) => selectedLotIds.has(l.lot.id)).length;
      return selected > 0 && selected < procLots.length;
    },
    [availableLots, selectedLotIds],
  );

  const toggleProcessSelection = useCallback(
    (procId: string) => {
      setSelectedLotIds((prev) => {
        const next = new Set(prev);
        const procLots = availableLots.filter((l) => l.process.id === procId);
        const allSelected = procLots.every((l) => prev.has(l.lot.id));
        for (const { lot } of procLots) {
          if (allSelected) {
            next.delete(lot.id);
          } else {
            next.add(lot.id);
          }
        }
        return next;
      });
    },
    [availableLots],
  );

  const totalSelectedWeight = useMemo(
    () =>
      availableLots
        .filter(({ lot }) => selectedLotIds.has(lot.id))
        .reduce((sum, { lot }) => sum + (lot.recovered ?? 0) - lot.egresadoG, 0),
    [availableLots, selectedLotIds],
  );

  const selectedProcessesSummary = useMemo(() => {
    const map = new Map<string, { process: Process; lots: typeof availableLots }>();
    availableLots
      .filter((item) => selectedLotIds.has(item.lot.id))
      .forEach((item) => {
        if (!map.has(item.process.id))
          map.set(item.process.id, { process: item.process, lots: [] });
        map.get(item.process.id)!.lots.push(item);
      });
    return Array.from(map.values());
  }, [availableLots, selectedLotIds]);

  const handleBulkEgreso = async () => {
    setIsBulkProcessing(true);
    setErrorMessage('');
    try {
      const lots = Array.from(selectedLotIds);
      await Promise.all(lots.map((id) => createEgreso.mutateAsync(id)));
      setSelectedLotIds(new Set());
      setShowAuditSheet(false);
      setSuccessMessage(
        `${lots.length} egreso${lots.length !== 1 ? 's' : ''} registrado${lots.length !== 1 ? 's' : ''} correctamente`,
      );
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('Error al procesar egresos masivos');
      setShakeKey((k) => k + 1);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-gold-500" />
            Salida de Material
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Egreso de Oro por Lote — Proveedores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* LEFT PANEL — Egreso por lote */}
        <div className="lg:col-span-2 space-y-4">
          {errorMessage && (
            <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
          )}
          {successMessage && (
            <div className="glass-panel-gold p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
                <p className="text-[10px] text-gold-500/60 uppercase tracking-wider mt-0.5">Transacción Registrada en Bóveda</p>
              </div>
            </div>
          )}

          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Egresar por Lote</h2>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              {/* Supplier Select */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Package className="w-3 h-3 inline mr-1" />
                  Proveedor
                </label>
                <div className="relative" ref={supplierRef}>
                  <button
                    type="button"
                    onClick={() => setSupplierSelectOpen(!supplierSelectOpen)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-sm text-left flex items-center justify-between text-slate-200"
                  >
                    <span className={selectedSupplier ? 'text-slate-200' : 'text-slate-600'}>
                      {selectedSupplier ? selectedSupplier.name : 'Seleccionar proveedor...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${supplierSelectOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {supplierSelectOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-midnight-800 border border-blue-500/20 max-h-48 overflow-y-auto">
                      {suppliers && suppliers.length > 0 ? (
                        suppliers.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSupplierId(s.id);
                              setSupplierSelectOpen(false);
                              setExpandedProcess(null);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                              selectedSupplierId === s.id ? 'bg-blue-500/10 text-gold-400' : 'text-slate-300 hover:bg-midnight-700'
                            }`}
                          >
                            <Package className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            {s.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-500">No hay proveedores registrados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Lots */}
              {selectedSupplierId && (
                <div>
                  {createEgreso.isPending && (
                    <div className="text-xs text-slate-500 py-4 text-center">Procesando egreso...</div>
                  )}

                  {!createEgreso.isPending && closedProcesses && closedProcesses.length === 0 && (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      No hay procesos cerrados para este proveedor.
                    </div>
                  )}

                  {!createEgreso.isPending && availableLots.length === 0 && closedProcesses && closedProcesses.length > 0 && (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      Todos los lotes de este proveedor ya fueron egresados.
                    </div>
                  )}

                  {!createEgreso.isPending && availableLots.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                        Lotes disponibles para egresar
                      </p>
                      {closedProcesses?.map((proc) => {
                        const procLots = availableLots.filter((l) => l.process.id === proc.id);
                        if (procLots.length === 0) return null;
                        const fullySelected = isProcessFullySelected(proc.id);
                        const partiallySelected = isProcessPartiallySelected(proc.id);
                        return (
                          <div key={proc.id} className="border border-blue-500/10">
                            <div className="flex items-center px-3 py-2 bg-midnight-800/50">
                              <div
                                role="checkbox"
                                aria-checked={fullySelected}
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProcessSelection(proc.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleProcessSelection(proc.id);
                                  }
                                }}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 cursor-pointer transition-all flex-shrink-0 ${
                                  fullySelected
                                    ? 'bg-gold-500/20 border-gold-500'
                                    : partiallySelected
                                      ? 'bg-blue-500/10 border-blue-400'
                                      : 'border-blue-500/30 hover:border-blue-400'
                                }`}
                              >
                                {fullySelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                                {partiallySelected && (
                                  <div className="w-2 h-0.5 rounded bg-blue-400" />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedProcess(expandedProcess === proc.id ? null : proc.id)}
                                className="flex-1 flex items-center justify-between text-left"
                              >
                                <span className="text-xs font-semibold text-slate-300">
                                  Proceso #{proc.number} — {procLots.length} lote{procLots.length !== 1 ? 's' : ''}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${expandedProcess === proc.id ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                            {expandedProcess === proc.id && (
                              <div className="divide-y divide-blue-500/5">
                                {procLots.map(({ lot }) => {
                                  const available = (lot.recovered ?? 0) - lot.egresadoG;
                                  const isSelected = selectedLotIds.has(lot.id);
                                  return (
                                    <div
                                      key={lot.id}
                                      className="px-3 flex items-center gap-3 cursor-pointer hover:bg-midnight-800/30 transition-colors"
                                      onClick={() => toggleLotSelection(lot.id)}
                                    >
                                      <div
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleLotSelection(lot.id);
                                          }
                                        }}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                          isSelected
                                            ? 'bg-gold-500/20 border-gold-500'
                                            : 'border-blue-500/30 hover:border-blue-400'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                                      </div>
                                      <div className="py-3 flex-1 min-w-0">
                                        <p className="text-xs font-mono text-gold-500 font-bold">
                                          Lote #{lot.number}
                                        </p>
                                        <div className="flex gap-3 text-[10px] text-slate-500">
                                          <span>R: <span className="text-slate-300 font-mono">{formatLocaleNumber(lot.recovered ?? 0)}</span></span>
                                          <span>Egresado: <span className="text-slate-300 font-mono">{formatLocaleNumber(lot.egresadoG)}</span></span>
                                          <span>Disponible: <span className="text-green-400 font-mono">{formatLocaleNumber(available)}</span></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedLotIds.size > 0 && (
                    <div className="glass-panel border border-gold-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white">
                          {selectedLotIds.size} Lote{selectedLotIds.size !== 1 ? 's' : ''} seleccionado{selectedLotIds.size !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Peso total:{' '}
                          <span className="text-gold-400 font-mono font-bold">{formatLocaleNumber(totalSelectedWeight)} g</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAuditSheet(true)}
                        disabled={isBulkProcessing}
                        className="px-5 py-2.5 sm:py-3 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gold-500/30 transition-all glow-gold-sm active:scale-95"
                      >
                        {isBulkProcessing ? 'Procesando...' : `EJECUTAR SALIDA (${selectedLotIds.size})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Transaction History */}
        <div className="lg:col-span-3">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Historial de Operaciones</h2>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Fino (g)</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Pureza</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${
                            tx.type === 'IN' ? 'text-gold-500' : 'text-blue-400'
                          }`}>
                            {tx.type === 'IN' ? '▲ IN' : '▼ OUT'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                          {tx.supplier?.name || tx.supplierId || '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">
                          {formatLocaleNumber(tx.weight)} {tx.weightUnit}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">
                          {formatNumber(tx.purity * 100, 0)}%
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(tx.date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay operaciones registradas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMACIÓN CENTRADA */}
      {showAuditSheet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-midnight-900/70 backdrop-blur-sm"
            onClick={() => setShowAuditSheet(false)}
          />
          <div className="relative w-full max-w-md glass-panel rounded-xl p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Confirmar Salida Masiva
              </h3>
            </div>

            <div className="space-y-3">
              {selectedProcessesSummary.map(({ process, lots }) => (
                <div
                  key={process.id}
                  className="border border-blue-500/10 rounded-lg p-3 space-y-1.5"
                >
                  <p className="text-xs font-semibold text-slate-300">
                    Proceso #{process.number}
                  </p>
                  <div className="space-y-1">
                    {lots.map(({ lot }) => {
                      const available = (lot.recovered ?? 0) - lot.egresadoG;
                      return (
                        <div
                          key={lot.id}
                          className="flex justify-between text-[11px] text-slate-400"
                        >
                          <span>Lote #{lot.number}</span>
                          <span className="font-mono text-slate-300">
                            {formatLocaleNumber(available)} g
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-500/10 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Peso total a egresar
              </span>
              <span className="text-sm font-mono font-bold text-gold-400">
                {formatLocaleNumber(totalSelectedWeight)} g
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuditSheet(false)}
                className="flex-1 py-3 border border-blue-500/20 text-slate-400 text-xs font-bold uppercase rounded-lg hover:bg-midnight-700/50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkEgreso}
                disabled={isBulkProcessing}
                className="flex-1 py-3 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold uppercase rounded-lg hover:bg-gold-500/30 transition-all glow-gold-sm disabled:opacity-50"
              >
                {isBulkProcessing
                  ? 'Procesando...'
                  : `Confirmar Salida (${selectedLotIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
