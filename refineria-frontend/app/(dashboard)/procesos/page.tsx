'use client';

import { useState, useMemo } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName } from '@/lib/utils';
import { Settings, Package, Crosshair, CheckCircle } from 'lucide-react';

export default function ProcesosPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, lots, assignToLot } = useProcess();

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const availableBars = useMemo(
    () => goldBars.filter((b) => b.disponible && (!selectedSupplierId || b.supplierId === selectedSupplierId)),
    [goldBars, selectedSupplierId]
  );

  const toggleBar = (barId: string) => {
    setSelectedBarIds((prev) =>
      prev.includes(barId) ? prev.filter((id) => id !== barId) : [...prev, barId]
    );
  };

  const handleAssign = () => {
    if (selectedBarIds.length === 0 || !selectedSupplierId) return;

    assignToLot(selectedSupplierId, selectedBarIds);
    const count = selectedBarIds.length;
    setSuccessMessage(`${count} barra${count !== 1 ? 's' : ''} asignada${count !== 1 ? 's' : ''} al Lote N° ${lots.length + 1}`);
    setSelectedBarIds([]);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const lotDetails = useMemo(() => {
    return lots.map((lot) => {
      const bars = goldBars.filter((b) => lot.barIds.includes(b.id));
      const pesoBruto = bars.reduce((s, b) => s + b.pesoBruto, 0);
      const e = bars.reduce((s, b) => s + b.analitico, 0);
      const f = bars.reduce((s, b) => s + b.esperado, 0);
      const g = bars.reduce((s, b) => s + b.recuperado, 0);
      const pct = e > 0 ? (g / e) * 100 : 0;
      const dif = g - f;
      return { ...lot, bars, pesoBruto, e, f, g, pct, dif };
    });
  }, [lots, goldBars]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-500" />
            Configuración de Procesos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Asignación de Barras y Consolidado de Lotes</p>
        </div>
      </div>

      {successMessage && (
        <div className="glass-panel-gold p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
            <p className="text-[10px] text-gold-500/60 uppercase tracking-wider mt-0.5">Lote generado en consolidado</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Apertura de Proceso</h2>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Package className="w-3 h-3 inline mr-1" />
                  Empresa / Proveedor
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    setSelectedBarIds([]);
                  }}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id} className="bg-midnight-800">{s.name}</option>
                  ))}
                </select>
              </div>

              {selectedSupplierId && (
                <>
                  <div className="border-t border-blue-500/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Barras Disponibles</h3>
                      <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                        {String(availableBars.length).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                      {availableBars.length > 0 ? (
                        availableBars.map((bar) => (
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
                                <span className="text-sm font-mono text-slate-200">{bar.codigo}</span>
                                <span className="text-xs font-mono text-slate-400">{bar.pesoBruto} g</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono mt-0.5">
                                <span>E: {bar.analitico}</span>
                                <span>F: {bar.esperado}</span>
                                <span>G: {bar.recuperado}</span>
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-center text-sm text-slate-500 py-6">
                          No hay barras disponibles para este proveedor.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAssign}
                    disabled={selectedBarIds.length === 0}
                    className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      Asignar a Lote Nuevo ({selectedBarIds.length})
                    </span>
                  </button>
                </>
              )}
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
                {String(lotDetails.length).padStart(2, '0')} lote{lotDetails.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lote N°</th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Barras</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso Bruto (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">F (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">G (g)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recup.</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Diferencia (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {lotDetails.length > 0 ? (
                    [...lotDetails].reverse().map((lot) => (
                      <tr key={lot.id} className="terminal-row">
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">
                          #{lot.numero}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-300 max-w-[140px] truncate">
                          {suppliers ? getSupplierName(suppliers, lot.supplierId) : '—'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {lot.bars.map((b) => (
                              <span key={b.id} className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/10">
                                {b.codigo}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.pesoBruto}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.e.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.f.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.g.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">
                          {lot.pct.toFixed(2)}%
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono" style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                          {lot.dif >= 0 ? '+' : ''}{lot.dif.toFixed(1)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay lotes generados. Selecciona un proveedor y asigna barras para crear el primer lote.
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
