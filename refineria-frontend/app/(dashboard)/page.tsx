'use client';

import { useGold } from '@/lib/GoldContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDashboardMetrics, type ProcessSummaryItem } from '@/lib/hooks/useDashboardMetrics';
import { useProcessDetail } from '@/lib/hooks/useProcessDetail';

import { useMemo, useState, useRef, useEffect } from 'react';
import { getSupplierName, formatDate, formatLocaleWeight, formatLocaleNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ProcessModal, type ProcessDetail, type LotDetail } from '@/components/shared/ProcessModal';
import {
  Wallet, Activity, Crosshair, Settings, ChevronDown, Database, Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useGold();
  const { data: suppliers } = useSuppliers();

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

  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [viewingProcessId, setViewingProcessId] = useState<string | null>(null);

  const monthRange = useMemo(() => {
    const now = new Date();
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfCurrent, startOfPrevious, endOfCurrent };
  }, []);

  const params = useMemo(() => {
    const p: { supplierId?: string; startDate?: string; endDate?: string } = {};
    if (selectedSupplierId !== 'all') p.supplierId = selectedSupplierId;
    if (selectedPeriod === 'custom') {
      if (startDate) p.startDate = startDate;
      if (endDate) p.endDate = endDate;
    } else {
      const { startOfPrevious, endOfCurrent } = monthRange;
      const start = selectedPeriod === 'current' ? monthRange.startOfCurrent : startOfPrevious;
      p.startDate = start.toISOString();
      p.endDate = endOfCurrent.toISOString();
    }
    return p;
  }, [selectedSupplierId, selectedPeriod, startDate, endDate, monthRange]);

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(params);
  const { data: processDetail, isLoading: detailLoading } = useProcessDetail(viewingProcessId);

  const processBySupplier = useMemo(() => {
    if (!suppliers || !metrics?.processSummary) return [];
    return suppliers
      .map((s) => {
        const sp = metrics.processSummary.filter((p: ProcessSummaryItem) => p.supplierId === s.id);
        return {
          id: s.id,
          name: s.name,
          open: sp.filter((p) => p.status === 'open').length,
          inProgress: sp.filter((p) => p.status === 'in_progress').length,
          closed: sp.filter((p) => p.status === 'closed').length,
        };
      })
      .filter((s) => s.open > 0 || s.inProgress > 0 || s.closed > 0);
  }, [metrics?.processSummary, suppliers]);

  const supplierProcessMap = useMemo(() => {
    if (!expandedSupplierId || !metrics?.processSummary) return [];
    return metrics.processSummary.filter((p: ProcessSummaryItem) => p.supplierId === expandedSupplierId);
  }, [expandedSupplierId, metrics?.processSummary]);

  const isLoading = authLoading || metricsLoading;

  const enrichedDetail = useMemo(() => {
    if (!processDetail) return null;
    const lotDetails = processDetail.lotDetails.map((lot) => {
      const grossWeight = Number(lot.bars.reduce((s, b) => s + b.grossWeight, 0).toFixed(2));
      const e = Number(lot.bars.reduce((s, b) => s + b.analytical, 0).toFixed(2));
      const f = Number(lot.bars.reduce((s, b) => s + b.expected, 0).toFixed(2));
      const g = Number((lot.recovered ?? lot.bars.reduce((s, b) => s + b.recovered, 0)).toFixed(2));
      const totalAg = Number(lot.bars.reduce((s, b) => {
        if (b.analyticalAg != null) return s + b.analyticalAg;
        if (b.leyAg != null) return s + b.grossWeight * b.leyAg / 1000;
        return s;
      }, 0).toFixed(2));
      const leyAg = grossWeight > 0 ? Number(((totalAg / grossWeight) * 1000).toFixed(2)) : 0;
      return { ...lot, grossWeight, e, f, g, pct: e > 0 ? (g / e) * 100 : 0, dif: g - f, totalAg, leyAg } as LotDetail;
    });
    const totalGrossWeight = lotDetails.reduce((s, l) => s + l.grossWeight, 0);
    const totalE = lotDetails.reduce((s, l) => s + l.e, 0);
    const totalF = lotDetails.reduce((s, l) => s + l.f, 0);
    const totalG = lotDetails.reduce((s, l) => s + l.g, 0);
    const totalAg = Number(lotDetails.reduce((s, l) => s + l.totalAg, 0).toFixed(2));
    const totalLeyAg = totalGrossWeight > 0 ? Number(((totalAg / totalGrossWeight) * 1000).toFixed(2)) : 0;
    return {
      ...processDetail,
      lotDetails,
      totalGrossWeight, totalE, totalF, totalG,
      totalPct: totalE > 0 ? (totalG / totalE) * 100 : 0,
      totalDif: totalG - totalF,
      totalAg, totalLeyAg,
    } as ProcessDetail;
  }, [processDetail]);

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

  const kpiCards = metrics ? [
    { label: 'Oro Ingresado', value: formatLocaleWeight(metrics.oroIngresado), icon: Database, accent: 'gold', subtitle: `${metrics.totalBarCount} barras registradas` },
    { label: 'Oro en Bóveda', value: formatLocaleWeight(metrics.oroEnInventario), icon: Shield, accent: 'gold', subtitle: `${metrics.availableBarCount} barras sin procesar` },
    { label: 'Oro en Proceso', value: formatLocaleWeight(metrics.oroEnProceso), icon: Settings, accent: 'blue', subtitle: `${metrics.processCounts.inProgress} procesos terminados` },
    { label: 'Oro Refinado', value: formatLocaleWeight(metrics.oroRefinado), icon: Crosshair, accent: 'gold', subtitle: `${metrics.processCounts.closed} procesos cerrados` },
    { label: 'Falta por Refinar', value: formatLocaleWeight(metrics.faltaPorRefinar), icon: Wallet, accent: 'blue', subtitle: 'Bóveda + En proceso' },
  ] : [];

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
                <BarChart data={(metrics?.supplierChartData ?? [])} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 0, fontSize: '12px', color: '#e2e8f0' }}
                    cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  />
                  <Bar dataKey="fineIn" name="Oro Fino" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fineOut" name="Egresos Finos" fill="#3B82F6" radius={[2, 2, 0, 0]} />
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
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ingreso Bruto (g)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Oro Fino (g)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Egresos Finos (g)</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Balance (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics?.supplierChartData ?? []).length > 0 ? (
                    (metrics?.supplierChartData ?? []).map((row) => (
                      <tr key={row.supplierId} className="terminal-row">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{row.supplierName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500">{formatLocaleNumber(row.grossIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-amber-400">{formatLocaleNumber(row.fineIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-blue-400">{formatLocaleNumber(row.fineOut)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-mono ${(row.fineIn - row.fineOut) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(row.fineIn - row.fineOut) >= 0 ? '+' : ''}{formatLocaleNumber(row.fineIn - row.fineOut)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
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
          <div className="p-4 sm:p-5 max-h-[600px] overflow-y-auto space-y-2">
            {processBySupplier.length > 0 ? (
              processBySupplier.map((s) => {
                const isSupplierExpanded = expandedSupplierId === s.id;
                return (
                  <div key={s.id}>
                    <div
                      onClick={() => setExpandedSupplierId(isSupplierExpanded ? null : s.id)}
                      className="terminal-row flex items-center justify-between py-2.5 px-3 cursor-pointer select-none"
                    >
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
                        <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform ${isSupplierExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    {isSupplierExpanded && (
                      <div className="border-t border-blue-500/10 pt-2 pb-1 px-3 space-y-1.5">
                        {supplierProcessMap.length > 0 ? (
                          supplierProcessMap.map((p) => {
                            return (
                              <div key={p.id} onClick={() => { if (user.role === 'OWNER') setViewingProcessId(p.id); }} className={`text-[10px] font-mono bg-midnight-900/50 px-2.5 py-1.5 border border-blue-500/10 flex items-center justify-between ${user.role === 'OWNER' ? 'cursor-pointer hover:bg-blue-500/10' : ''}`}>
                                <span className="text-slate-300">#{p.number}</span>
                                <div className="flex items-center gap-2 text-slate-500">
                                  <span>{p.lotCount} lote{p.lotCount !== 1 ? 's' : ''}</span>
                                  <span>{p.barCount} barra{p.barCount !== 1 ? 's' : ''}</span>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    p.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                                    p.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400' :
                                    'bg-gray-500/10 text-gray-400'
                                  }`}>
                                    {p.status === 'open' ? 'A' : p.status === 'in_progress' ? 'T' : 'C'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] text-slate-500 py-1">Sin procesos para este proveedor.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
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
              {(metrics?.recentTransactions ?? []).map((tx) => (
                <tr key={tx.id} className="terminal-row">
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      tx.type === 'IN' ? 'text-gold-500' : 'text-blue-400'
                    }`}>
                      {tx.type === 'IN' ? '▲ IN' : '▼ OUT'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                    {suppliers ? getSupplierName(suppliers, tx.supplierId ?? undefined) : '—'}
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

      {viewingProcessId && !detailLoading && enrichedDetail && (
        <ProcessModal
          detail={enrichedDetail}
          suppliers={suppliers}
          onClose={() => setViewingProcessId(null)}
        />
      )}
    </div>
  );
}
