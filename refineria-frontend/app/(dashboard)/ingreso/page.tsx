'use client';

import { useState, FormEvent } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useCreateTransaction } from '@/lib/hooks/useTransactions';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName } from '@/lib/utils';
import { ClipboardList, CheckCircle, Package, Weight, Ruler, Crosshair } from 'lucide-react';

export default function IngresoPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, addBar } = useProcess();
  const createTx = useCreateTransaction();

  const [supplierId, setSupplierId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [pesoBruto, setPesoBruto] = useState('');
  const [analitico, setAnalitico] = useState('');
  const [esperado, setEsperado] = useState('');
  const [recuperado, setRecuperado] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const parseNum = (v: string) => parseFloat(v) || 0;
  const pBruto = parseNum(pesoBruto);
  const pAnalitico = parseNum(analitico);
  const pEsperado = parseNum(esperado);
  const pRecuperado = parseNum(recuperado);

  const canSubmit = supplierId && codigo.trim().length >= 2 && pBruto > 0 && pAnalitico > 0 && pEsperado > 0 && pRecuperado > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    addBar({
      codigo: codigo.trim(),
      supplierId,
      pesoBruto: pBruto,
      analitico: pAnalitico,
      esperado: pEsperado,
      recuperado: pRecuperado,
    });

    try {
      await createTx.mutateAsync({
        type: 'IN',
        weight: pBruto,
        weightUnit: 'g',
        purity: pBruto > 0 ? pAnalitico / pBruto : 0,
        supplierId,
      });
    } catch {
      // Silently handle — bar already registered locally
    }

    setSuccessMessage(`Barra ${codigo.trim()} registrada correctamente`);
    setCodigo('');
    setPesoBruto('');
    setAnalitico('');
    setEsperado('');
    setRecuperado('');
    setSupplierId('');
    setTimeout(() => setSuccessMessage(''), 4000);
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
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={pesoBruto}
                  onChange={(e) => setPesoBruto(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Analítico — E (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={analitico}
                  onChange={(e) => setAnalitico(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3325.0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Esperado — F (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={esperado}
                  onChange={(e) => setEsperado(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3335.0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Recuperado — G (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={recuperado}
                  onChange={(e) => setRecuperado(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3320.0"
                />
              </div>

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
                  </tr>
                </thead>
                <tbody>
                  {filteredBars.length > 0 ? (
                    filteredBars.map((bar) => (
                      <tr key={bar.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.codigo}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                          {suppliers ? getSupplierName(suppliers, bar.supplierId) : '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.pesoBruto}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.analitico}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.esperado}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{bar.recuperado}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                            bar.disponible
                              ? 'text-gold-500 bg-gold-500/10 border border-gold-500/20'
                              : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                          }`}>
                            {bar.disponible ? 'DISPONIBLE' : 'EN LOTE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
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
