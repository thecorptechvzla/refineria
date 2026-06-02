'use client';

import { useState, FormEvent } from 'react';
import { useGold } from '@/lib/GoldContext';
import { useTransactions, useCreateTransaction } from '@/lib/hooks/useTransactions';
import { WeightUnit } from '@/types';
import { calculateFineWeight, formatDate, parseLocaleNumber } from '@/lib/utils';
import { ArrowLeftRight, CheckCircle, Crosshair, Weight, Thermometer } from 'lucide-react';

export default function TransaccionesPage() {
  const { data: transactions } = useTransactions();
  const createTx = useCreateTransaction();

  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('g');
  const [purity, setPurity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const parsedWeight = parseLocaleNumber(weight);
  const parsedPurity = parseLocaleNumber(purity);
  const fineWeight = calculateFineWeight(parsedWeight, parsedPurity / 100);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (parsedWeight <= 0 || parsedPurity <= 0 || parsedPurity > 100) return;

    try {
      await createTx.mutateAsync({
        type: 'OUT',
        weight: parsedWeight,
        weightUnit: unit,
        purity: parsedPurity / 100,
      });

      setSuccessMessage('Egreso Confirmado');
      setWeight('');
      setPurity('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // Silently handle
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
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Registro de Egresos / Salidas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider tracking-wider">Nueva Salida</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Weight className="w-3 h-3 inline mr-1" />
                  Peso Bruto (g)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                    placeholder="Ej. 1.500,00"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as WeightUnit)}
                    className="px-3 py-2.5 bg-midnight-800 border border-l-0 border-blue-500/20 text-slate-400 text-xs outline-none"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Thermometer className="w-3 h-3 inline mr-1" />
                  Pureza (%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 99,95"
                />
              </div>

              {parsedWeight > 0 && parsedPurity > 0 && (
                <div className="bg-gold-500/5 border border-gold-500/20 p-4">
                  <p className="text-[10px] font-semibold text-gold-400/80 uppercase tracking-widest">Peso Fino Calculado</p>
                  <p className="hud-number text-2xl text-gold-500 mt-1">
                    {fineWeight >= 1 ? `${fineWeight.toFixed(2)} g` : `${(fineWeight * 1000).toFixed(1)} mg`}
                  </p>
                  <div className="h-[2px] w-full bg-gold-500/20 mt-2" />
                  <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
                    {parsedWeight} {unit} × {parsedPurity}% pureza
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={createTx.isPending || parsedWeight <= 0 || parsedPurity <= 0}
                className="w-full py-2.5 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {createTx.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                    Procesando
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Salida
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

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
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso</th>
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
                          {tx.supplierId || '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">
                          {tx.weight} {tx.weightUnit}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">
                          {(tx.purity * 100).toFixed(0)}%
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
