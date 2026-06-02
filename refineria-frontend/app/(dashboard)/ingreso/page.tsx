'use client';

import { useState, FormEvent } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useCreateTransaction } from '@/lib/hooks/useTransactions';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDeleteGoldBar } from '@/lib/hooks/useGoldBars';
import { getSupplierName, parseLocaleNumber, formatLocaleNumber } from '@/lib/utils';
import { ClipboardList, CheckCircle, Package, Weight, Ruler, Crosshair, Trash2 } from 'lucide-react';

export default function IngresoPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, addBar } = useProcess();
  const createTx = useCreateTransaction();

  const [supplierId, setSupplierId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [pesoBruto, setPesoBruto] = useState(''); // eslint-disable-line
  const [analitico, setAnalitico] = useState('');
  const [esperado, setEsperado] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const parseNum = (v: string) => parseLocaleNumber(v);
  const pBruto = parseNum(pesoBruto);
  const pAnalitico = parseNum(analitico);
  const pEsperado = parseNum(esperado);
  const displayedG = esperado;
  const pDisplayedG = pEsperado;

  const canSubmit = supplierId && codigo.trim().length >= 2 && pBruto > 0 && pAnalitico > 0 && pEsperado > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await addBar({
        code: codigo.trim(),
        supplierId,
        grossWeight: pBruto,
        analytical: pAnalitico,
        expected: pEsperado,
        recovered: 0,
      });

      await createTx.mutateAsync({
        type: 'IN',
        weight: pBruto,
        weightUnit: 'g',
        purity: pBruto > 0 ? pAnalitico / pBruto : 0,
        supplierId,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al registrar';
      alert(msg);
      return;
    }

    setSuccessMessage(`Barra ${codigo.trim()} registrada correctamente`);
    setCodigo('');
    setPesoBruto('');
    setAnalitico('');
    setEsperado('');
    setSupplierId('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const deleteGoldBar = useDeleteGoldBar();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteBar = async (barId: string) => {
    try {
      await deleteGoldBar.mutateAsync(barId);
      setConfirmDeleteId(null);
    } catch {
      alert('Error al eliminar la barra');
    }
  };

  const filteredBars = supplierId ? goldBars.filter((b) => b.supplierId === supplierId) : goldBars;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gold-500" />
            Ingreso de Material
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Registro de Barras de Oro — Bóveda</p>
        </div>
      </div>

      {successMessage && (
        <div className="glass-panel-gold p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
            <p className="text-[10px] text-gold-500/60 uppercase tracking-wider mt-0.5">Barra registrada en bóveda</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nueva Barra</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Package className="w-3 h-3 inline mr-1" />
                  Proveedor / Empresa
                </label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
                >
                  <option value="" disabled>Seleccionar proveedor...</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id} className="bg-midnight-800">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  Código de Barra
                </label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. BAR-011"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Weight className="w-3 h-3 inline mr-1" />
                  Peso Bruto (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={pesoBruto}
                  onChange={(e) => setPesoBruto(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3.500,00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Analítico — E (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={analitico}
                  onChange={(e) => setAnalitico(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3.325,00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Esperado — F (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={esperado}
                  onChange={(e) => setEsperado(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3.335,00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Recuperado — G (g)
                  <span className="ml-1.5 text-[9px] text-slate-600 italic">(proyección)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={displayedG}
                  className="w-full px-3 py-2.5 bg-midnight-900 border border-blue-500/10 text-slate-400 text-sm outline-none cursor-not-allowed"
                  placeholder="—"
                />
              </div>

              {pDisplayedG > 0 && pAnalitico > 0 && (
                <div className="bg-gold-500/5 border border-gold-500/20 p-4">
                  <p className="text-[10px] font-semibold text-gold-400/80 uppercase tracking-widest mb-2">Previsualización</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">% Recuperación</p>
                      <p className="hud-number text-xl text-gold-500 mt-0.5">
                        {((pDisplayedG / pAnalitico) * 100).toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{formatLocaleNumber(pDisplayedG)} / {formatLocaleNumber(pAnalitico)} × 100</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Diferencia</p>
                      <p className={`hud-number text-xl mt-0.5 ${(pDisplayedG - pEsperado) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {(pDisplayedG - pEsperado) >= 0 ? '+' : ''}{formatLocaleNumber(pDisplayedG - pEsperado)} g
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{formatLocaleNumber(pDisplayedG)} − {formatLocaleNumber(pEsperado)}</p>
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-gold-500/20 mt-3" />
                  <p className="text-[10px] text-slate-600 mt-2 font-mono">
                    Bruto: {formatLocaleNumber(pBruto)} g &middot; E: {formatLocaleNumber(pAnalitico)} g &middot; F: {formatLocaleNumber(pEsperado)} g &middot; G: {formatLocaleNumber(pDisplayedG)} g
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Registrar Barra
                </span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Barras Registradas</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
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
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Código</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">F (g)</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">G (g)</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBars.length > 0 ? (
                    filteredBars.map((bar) => (
                      <tr key={bar.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.code}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                          {suppliers ? getSupplierName(suppliers, bar.supplierId) : '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(bar.grossWeight)}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(bar.analytical)}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(bar.expected)}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(bar.recovered)}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                            bar.available
                              ? 'text-gold-500 bg-gold-500/10 border border-gold-500/20'
                              : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                          }`}>
                            {bar.available ? 'DISPONIBLE' : 'EN LOTE'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right">
                          {confirmDeleteId === bar.id ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleDeleteBar(bar.id)}
                                className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(bar.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Eliminar barra"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay barras registradas para este proveedor.
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
