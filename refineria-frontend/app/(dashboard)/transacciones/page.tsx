'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useClosedProcessesBySupplier } from '@/lib/hooks/useProcesses';
import { useCreateEgresoLot } from '@/lib/hooks/useTransactions';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { formatNumber, formatLocaleNumber, formatDate } from '@/lib/utils';
import { ArrowLeftRight, CheckCircle, Crosshair, Package, ChevronDown } from 'lucide-react';
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
  const [confirmLotId, setConfirmLotId] = useState<string | null>(null);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

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

  const handleEgresar = async (lotId: string) => {
    setConfirmLotId(null);
    setErrorMessage('');
    try {
      await createEgreso.mutateAsync(lotId);
      setSuccessMessage('Egreso registrado correctamente');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('Error al registrar el egreso');
      setShakeKey((k) => k + 1);
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
                        return (
                          <div key={proc.id} className="border border-blue-500/10">
                            <button
                              type="button"
                              onClick={() => setExpandedProcess(expandedProcess === proc.id ? null : proc.id)}
                              className="w-full px-3 py-2 bg-midnight-800/50 flex items-center justify-between text-left"
                            >
                              <span className="text-xs font-semibold text-slate-300">
                                Proceso #{proc.number} — {procLots.length} lote{procLots.length !== 1 ? 's' : ''}
                              </span>
                              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${expandedProcess === proc.id ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedProcess === proc.id && (
                              <div className="divide-y divide-blue-500/5">
                                {procLots.map(({ lot }) => {
                                  const available = (lot.recovered ?? 0) - lot.egresadoG;
                                  return (
                                    <div key={lot.id} className="px-3 py-2.5 flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <p className="text-xs font-mono text-gold-500 font-bold">
                                          Lote #{lot.number}
                                        </p>
                                        <div className="flex gap-3 text-[10px] text-slate-500">
                                          <span>G: <span className="text-slate-300 font-mono">{formatLocaleNumber(lot.recovered ?? 0)}</span></span>
                                          <span>Egresado: <span className="text-slate-300 font-mono">{formatLocaleNumber(lot.egresadoG)}</span></span>
                                          <span>Disponible: <span className="text-green-400 font-mono">{formatLocaleNumber(available)}</span></span>
                                        </div>
                                      </div>
                                      {confirmLotId === lot.id ? (
                                        <div className="flex gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleEgresar(lot.id)}
                                            className="px-2.5 py-1.5 bg-green-500/20 border border-green-500/40 text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/30 transition-all"
                                          >
                                            Confirmar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmLotId(null)}
                                            className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmLotId(lot.id)}
                                          className="px-2.5 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/30 transition-all"
                                        >
                                          Egresar
                                        </button>
                                      )}
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
    </div>
  );
}
