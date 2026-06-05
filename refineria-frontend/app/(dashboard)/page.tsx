'use client';

import { useGold } from '@/lib/GoldContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useTransactions } from '@/lib/hooks/useTransactions';

import { useProcess } from '@/lib/ProcessContext';
import { useMemo, useState, useRef, useEffect } from 'react';
import { toGrams, getSupplierName, formatDate, formatLocaleWeight, formatLocaleNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Wallet, Activity, Crosshair, Settings, ChevronDown, Database, Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useGold();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: suppliers } = useSuppliers();
  const { goldBars, processes } = useProcess();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectOpen]);

  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous' | 'last_two' | 'custom'>('last_two');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!periodOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [periodOpen]);

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
      switch (selectedPeriod) {
        case 'current':
          return d >= startOfCurrent && d <= endOfCurrent;
        case 'previous':
          return d >= startOfPrevious && d < startOfCurrent;
        case 'custom':
          if (!startDate && !endDate) return true;
          if (startDate && d < new Date(startDate + 'T00:00:00')) return false;
          if (endDate && d > new Date(endDate + 'T23:59:59.999')) return false;
          return true;
        case 'last_two':
        default:
          return d >= startOfPrevious;
      }
    };
  }, [monthRange, selectedPeriod, startDate, endDate]);

  const filteredBars = useMemo(() =>
    goldBars.filter((b) => {
      if (selectedSupplierId !== 'all' && b.supplierId !== selectedSupplierId) return false;
      return dateFilterFn(b.registrationDate);
    }),
    [goldBars, selectedSupplierId, dateFilterFn]);

  const filteredProcesses = useMemo(() =>
    processes.filter((p) => {
      if (selectedSupplierId !== 'all' && p.supplierId !== selectedSupplierId) return false;
      return dateFilterFn(p.createdAt);
    }),
    [processes, selectedSupplierId, dateFilterFn]);

  const oroEnInventario = useMemo(
    () => filteredBars.filter((b) => b.available).reduce((s, b) => s + b.grossWeight, 0),
    [filteredBars]
  );

  const oroIngresado = useMemo(
    () => filteredBars.reduce((s, b) => s + b.grossWeight, 0),
    [filteredBars]
  );

  const oroEnProceso = useMemo(() => {
    const inProgressLotBarIds = filteredProcesses
      .filter((p) => p.status === 'in_progress')
      .flatMap((p) => p.lots.flatMap((l) => l.barIds));
    return filteredBars
      .filter((b) => inProgressLotBarIds.includes(b.id))
      .reduce((s, b) => s + b.grossWeight, 0);
  }, [filteredProcesses, filteredBars]);

  const oroEnProcesosAbiertos = useMemo(() => {
    const openLotBarIds = filteredProcesses
      .filter((p) => p.status === 'open')
      .flatMap((p) => p.lots.flatMap((l) => l.barIds));
    return filteredBars
      .filter((b) => openLotBarIds.includes(b.id))
      .reduce((s, b) => s + b.grossWeight, 0);
  }, [filteredProcesses, filteredBars]);

  const oroRefinado = useMemo(() => {
    const closedLots = filteredProcesses
      .filter((p) => p.status === 'closed')
      .flatMap((p) => p.lots);
    return closedLots.reduce((sum, lot) => {
      return sum + filteredBars
        .filter((b) => lot.barIds.includes(b.id))
        .reduce((s, b) => s + b.recovered, 0);
    }, 0);
  }, [filteredProcesses, filteredBars]);

  const faltaPorRefinar = oroEnInventario + oroEnProceso;

  const processCounts = useMemo(() => ({
    open: filteredProcesses.filter((p) => p.status === 'open').length,
    inProgress: filteredProcesses.filter((p) => p.status === 'in_progress').length,
    closed: filteredProcesses.filter((p) => p.status === 'closed').length,
  }), [filteredProcesses]);

const processBySupplier = useMemo(() => {
  if (!suppliers) return [];
  return suppliers
    .map((s) => {
      const sp = filteredProcesses.filter((p) => p.supplierId === s.id);
      return {
        id: s.id,
        name: s.name,
        open: sp.filter((p) => p.status === 'open').length,
        inProgress: sp.filter((p) => p.status === 'in_progress').length,
        closed: sp.filter((p) => p.status === 'closed').length,
      };
    })
    .filter((s) => s.open > 0 || s.inProgress > 0 || s.closed > 0);
}, [filteredProcesses, suppliers]);

  const supplierChartData = useMemo(() => {
    if (!suppliers || !transactions) return [];
    const map: Record<string, { id: string; name: string; in: number; out: number }> = {};
    suppliers.forEach((s) => {
      map[s.id] = { id: s.id, name: s.name.split(' ').slice(0, 2).join(' '), in: 0, out: 0 };
    });
    transactions.forEach((tx) => {
      const grams = toGrams(tx.weight, tx.weightUnit);
      if (tx.type === 'IN' && tx.supplierId && map[tx.supplierId]) {
        map[tx.supplierId].in += grams;
      }
      if (tx.type === 'OUT' && tx.supplierId && map[tx.supplierId]) {
        map[tx.supplierId].out += grams;
      }
    });
    const result = Object.values(map).filter((d) => d.in > 0 || d.out > 0);
    return selectedSupplierId === 'all'
      ? result
      : result.filter((d) => d.id === selectedSupplierId);
  }, [suppliers, transactions, selectedSupplierId]);

  const recentTransactions = useMemo(
    () => (transactions ?? []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [transactions]
  );

  const isLoading = authLoading || txLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-blue-500/30 animate-ping rounded-sm" />
            <div className="absolute inset-1 border-t-2 border-gold-500 animate-spin rounded-sm" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">Sincronizando Bóveda</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Oro Ingresado', value: formatLocaleWeight(oroIngresado), icon: Database, accent: 'gold', subtitle: `${filteredBars.length} barras registradas` },
    { label: 'Oro en Bóveda', value: formatLocaleWeight(oroEnInventario), icon: Shield, accent: 'gold', subtitle: `${filteredBars.filter((b) => b.available).length} barras sin procesar` },
    { label: 'Oro en Proceso', value: formatLocaleWeight(oroEnProceso), icon: Settings, accent: 'blue', subtitle: `${processCounts.inProgress} procesos terminados` },
    { label: 'Oro Refinado', value: formatLocaleWeight(oroRefinado), icon: Crosshair, accent: 'gold', subtitle: `${processCounts.closed} procesos cerrados` },
    { label: 'Falta por Refinar', value: formatLocaleWeight(faltaPorRefinar), icon: Wallet, accent: 'blue', subtitle: 'Bóveda + En proceso' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-gold-500" />
            Panel de Mando
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Resumen Ejecutivo — Tiempo Real</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={selectRef} className="relative w-full sm:w-auto">
            <button
              onClick={() => setSelectOpen(!selectOpen)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:border-blue-500/40 focus:outline-none focus:border-blue-500/50 text-left flex items-center justify-between gap-3 min-w-[200px]"
            >
              <span className="truncate">{selectedSupplierId === 'all' ? 'Todos los clientes' : suppliers?.find((s) => s.id === selectedSupplierId)?.name}</span>
              <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${selectOpen ? 'rotate-180' : ''}`} />
            </button>
            {selectOpen && (
              <ul className="absolute z-50 right-0 mt-1 w-full min-w-[200px] bg-[#0f172a] border border-blue-500/20 shadow-xl">
                <li
                  className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedSupplierId === 'all' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                  onClick={() => { setSelectedSupplierId('all'); setSelectOpen(false); }}
                >Todos los clientes</li>
                {suppliers?.map((s) => (
                  <li
                    key={s.id}
                    className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedSupplierId === s.id ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                    onClick={() => { setSelectedSupplierId(s.id); setSelectOpen(false); }}
                  >{s.name}</li>
                ))}
              </ul>
            )}
          </div>
          <div ref={periodRef} className="relative w-full sm:w-auto">
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:border-blue-500/40 focus:outline-none focus:border-blue-500/50 text-left flex items-center justify-between gap-3 min-w-[200px]"
            >
              <span className="truncate">
                {selectedPeriod === 'current' ? 'Mes actual' : selectedPeriod === 'previous' ? 'Mes anterior' : selectedPeriod === 'custom' ? 'Personalizado' : 'Últimos 2 meses'}
              </span>
              <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${periodOpen ? 'rotate-180' : ''}`} />
            </button>
            {periodOpen && (
              <ul className="absolute z-50 right-0 mt-1 w-full min-w-[200px] bg-[#0f172a] border border-blue-500/20 shadow-xl">
                <li
                  className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedPeriod === 'last_two' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                  onClick={() => { setSelectedPeriod('last_two'); setPeriodOpen(false); }}
                >Últimos 2 meses</li>
                <li
                  className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedPeriod === 'current' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                  onClick={() => { setSelectedPeriod('current'); setPeriodOpen(false); }}
                >Mes actual</li>
                <li
                  className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedPeriod === 'previous' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                  onClick={() => { setSelectedPeriod('previous'); setPeriodOpen(false); }}
                >Mes anterior</li>
                <li
                  className={`px-3 py-2.5 text-xs font-medium uppercase tracking-widest cursor-pointer ${selectedPeriod === 'custom' ? 'text-gold-400 bg-blue-500/10' : 'text-slate-300 hover:bg-blue-500/10'}`}
                  onClick={() => { setSelectedPeriod('custom'); setPeriodOpen(false); }}
                >Personalizado</li>
              </ul>
            )}
          </div>
          {selectedPeriod === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-[7px] text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
              <span className="text-slate-600 text-[10px] shrink-0">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-[7px] text-xs font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const isGold = kpi.accent === 'gold';
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`relative ${isGold ? 'glass-panel-gold' : 'glass-panel'} p-4 sm:p-5 hover:border-opacity-60 transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${isGold ? 'text-gold-400/70' : 'text-blue-400/70'}`}>
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${isGold ? 'text-gold-500' : 'text-blue-500'}`} />
              </div>
              <p className="hud-number text-lg sm:text-xl text-white tracking-tight break-all">{kpi.value}</p>
              {kpi.subtitle && kpi.subtitle.length > 0 && (
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">{kpi.subtitle}</p>
              )}
              <div className={`mt-3 h-[2px] w-full ${isGold ? 'bg-gold-500/30' : 'bg-blue-500/30'}`} />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-3 glass-panel">
          <div className="p-4 sm:p-5 border-b border-blue-500/10">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Volumen por Proveedor</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="h-64 sm:h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierChartData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 0, fontSize: '12px', color: '#e2e8f0' }}
                    cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  />
                  <Bar dataKey="in" name="Ingresos" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="out" name="Egresos" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t border-blue-500/10 p-4 sm:p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ingresos (g)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Egresos (g)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Balance (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierChartData.length > 0 ? (
                    supplierChartData.map((row) => (
                      <tr key={row.id} className="terminal-row">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{row.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500">{formatLocaleNumber(row.in)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-blue-400">{formatLocaleNumber(row.out)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-mono ${(row.in - row.out) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(row.in - row.out) >= 0 ? '+' : ''}{formatLocaleNumber(row.in - row.out)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                        No hay datos de proveedores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel">
          <div className="p-4 sm:p-5 border-b border-blue-500/10">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estado de los Procesos</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5 max-h-[360px] overflow-y-auto space-y-2">
            {processBySupplier.length > 0 ? (
              processBySupplier.map((s) => (
                <div key={s.id} className="terminal-row flex items-center justify-between py-2.5 px-3">
                  <span className="text-sm font-medium text-slate-300 truncate min-w-0">{s.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {s.open > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        {s.open} A
                      </span>
                    )}
                    {s.inProgress > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        {s.inProgress} T
                      </span>
                    )}
                    {s.closed > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-400">
                        {s.closed} C
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-6">No hay procesos activos.</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="p-4 sm:p-5 border-b border-blue-500/10">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-gold-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Feed de Actividad — Últimas Transacciones</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
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
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="terminal-row">
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      tx.type === 'IN' ? 'text-gold-500' : 'text-blue-400'
                    }`}>
                      {tx.type === 'IN' ? '▲ IN' : '▼ OUT'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                    {suppliers ? getSupplierName(suppliers, tx.supplierId) : '—'}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">
                    {formatLocaleNumber(tx.weight)} {tx.weightUnit}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">
                    {(tx.purity * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(tx.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
