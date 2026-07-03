'use client';

import { useGold } from '@/lib/GoldContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDashboardMetrics, type ProcessSummaryItem } from '@/lib/hooks/useDashboardMetrics';
import { useProcessDetail } from '@/lib/hooks/useProcessDetail';

import { useMemo, useState, useRef, useEffect } from 'react';
import { getSupplierName, formatDate, formatNumber, formatLocaleWeight, formatLocaleNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ProcessModal, type ProcessDetail, type LotDetail } from '@/components/shared/ProcessModal';
import {
  Wallet, Activity, Crosshair, Settings, ChevronDown, ChevronLeft, ChevronRight, Database, Shield, CheckCircle,
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

  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous' | 'last_two' | 'custom'>('current');
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

  const [activeStatusFilter, setActiveStatusFilter] = useState<'in_progress' | 'open' | 'closed' | null>(null);
  const [viewingProcessId, setViewingProcessId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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

  const { data: metrics, isLoading: metricsLoading, isError: metricsError, refetch: refetchMetrics } =
    useDashboardMetrics(params, !!user && !authLoading);
  const { data: processDetail, isLoading: detailLoading } = useProcessDetail(viewingProcessId);

  const filteredProcessList = useMemo(() => {
    if (!activeStatusFilter || !metrics?.processSummary) return [];
    return metrics.processSummary.filter((p: ProcessSummaryItem) => p.status === activeStatusFilter);
  }, [activeStatusFilter, metrics?.processSummary]);

  const totalPages = Math.max(1, Math.ceil(filteredProcessList.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProcessList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProcessList, safePage]);

  const enrichedDetail = useMemo(() => {
    if (!processDetail) return null;
    const round2 = (v: number) => Math.round(v * 100) / 100;
    const lotDetails = processDetail.lotDetails.map((lot) => {
      const grossWeight = round2(lot.bars.reduce((s, b) => s + b.grossWeight, 0));
      const e = round2(lot.bars.reduce((s, b) => s + b.analytical, 0));
      const f = round2(lot.bars.reduce((s, b) => s + b.expected, 0));
      const g = round2(lot.recovered ?? lot.bars.reduce((s, b) => s + b.recovered, 0));
      const totalAg = round2(lot.bars.reduce((s, b) => {
        if (b.analyticalAg != null) return s + b.analyticalAg;
        if (b.leyAg != null) return s + b.grossWeight * b.leyAg / 1000;
        return s;
      }, 0));
      const leyAg = grossWeight > 0 ? round2((totalAg / grossWeight) * 1000) : 0;
      return { ...lot, grossWeight, e, f, g, pct: e > 0 ? (g / e) * 100 : 0, dif: g - f, totalAg, leyAg } as LotDetail;
    });
    const totalGrossWeight = lotDetails.reduce((s, l) => s + l.grossWeight, 0);
    const totalE = lotDetails.reduce((s, l) => s + l.e, 0);
    const totalF = lotDetails.reduce((s, l) => s + l.f, 0);
    const totalG = lotDetails.reduce((s, l) => s + l.g, 0);
    const totalAg = round2(lotDetails.reduce((s, l) => s + l.totalAg, 0));
    const totalLeyAg = totalGrossWeight > 0 ? round2((totalAg / totalGrossWeight) * 1000) : 0;
    return {
      ...processDetail,
      lotDetails,
      totalGrossWeight, totalE, totalF, totalG,
      totalPct: totalE > 0 ? (totalG / totalE) * 100 : 0,
      totalDif: totalG - totalF,
      totalAg, totalLeyAg,
    } as ProcessDetail;
  }, [processDetail]);

  if (authLoading) {
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

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8 max-w-sm w-full mx-4 text-center">
          <Shield className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold mb-1">Sesión expirada</p>
          <p className="text-xs text-slate-500 mb-5">Tu sesión ha expirado. Inicia sesión nuevamente.</p>
          <a href="/login" className="inline-block px-6 py-2.5 bg-gold-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-gold-400 transition-all">
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  if (metricsError && !metrics) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8 max-w-sm w-full mx-4 text-center">
          <Activity className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold mb-1">Error al cargar métricas</p>
          <p className="text-xs text-slate-500 mb-5">No se pudieron obtener los datos del panel de mando.</p>
          <button onClick={() => refetchMetrics()} className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all">
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = metrics ? [
    { label: 'Oro Ingresado', value: formatLocaleWeight(metrics.oroIngresado), icon: Database, accent: 'gold', subtitle: `${formatNumber(metrics.totalBarCount, 0)} barras registradas` },
    { label: 'Oro en Bóveda', value: formatLocaleWeight(metrics.oroEnBoveda), icon: Shield, accent: 'gold', subtitle: 'Procesos Terminados y Cerrados' },
    { label: 'Oro en Proceso', value: formatLocaleWeight(metrics.oroEnProceso), icon: Settings, accent: 'blue', subtitle: 'Procesos Abiertos' },
    { label: 'Oro Faltante / Por Refinar', value: formatLocaleWeight(metrics.faltaPorRefinar), icon: Wallet, accent: 'blue', subtitle: `${formatNumber(metrics.availableBarCount, 0)} barras sin procesar` },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">{kpi.subtitle}</p>
              )}
              <div className={`mt-3 h-[2px] w-full ${isGold ? 'bg-gold-500/30' : 'bg-blue-500/30'}`} />
            </div>
          );
        })}
      </div>

      {/* Status Cards with Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {([
          { key: 'in_progress' as const, label: 'ABIERTOS', icon: Settings, count: metrics?.processCounts.inProgress ?? 0, desc: 'Procesos en curso', border: 'border-blue-500/50', shadow: 'shadow-blue-500/20', bgActive: 'bg-blue-500/10', textLabel: 'text-blue-400/70', textIcon: 'text-blue-500', bar: 'bg-blue-500/30' },
          { key: 'open' as const, label: 'TERMINADOS', icon: CheckCircle, count: metrics?.processCounts.open ?? 0, desc: 'Listos para cerrar', border: 'border-green-500/50', shadow: 'shadow-green-500/20', bgActive: 'bg-green-500/10', textLabel: 'text-green-400/70', textIcon: 'text-green-500', bar: 'bg-green-500/30' },
          { key: 'closed' as const, label: 'CERRADOS', icon: Crosshair, count: metrics?.processCounts.closed ?? 0, desc: 'Procesos finalizados', border: 'border-gold-500/50', shadow: 'shadow-gold-500/20', bgActive: 'bg-gold-500/10', textLabel: 'text-gold-400/70', textIcon: 'text-gold-500', bar: 'bg-gold-500/30' },
        ]).map((card) => {
          const isActive = activeStatusFilter === card.key;
          return (
            <div
              key={card.key}
              onClick={() => { setCurrentPage(1); setActiveStatusFilter(isActive ? null : card.key); }}
              className={`glass-panel p-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? `ring-2 ${card.border} shadow-lg ${card.shadow} ${card.bgActive}`
                  : 'hover:bg-white/5 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${card.textLabel}`}>{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.textIcon}`} />
              </div>
              <p className="hud-number text-lg sm:text-xl text-white">{card.count}</p>
              <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">{card.desc}</p>
              <div className={`mt-3 h-[2px] w-full ${card.bar}`} />
            </div>
          );
        })}
      </div>

      {/* In-page Process List — animated slide */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: activeStatusFilter && filteredProcessList.length > 0 ? '600px' : '0' }}
      >
        {activeStatusFilter && filteredProcessList.length > 0 && (
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeStatusFilter === 'in_progress' ? 'Procesos en Curso' : activeStatusFilter === 'open' ? 'Procesos Terminados' : 'Procesos Cerrados'}
              </h3>
            </div>
            <div className="p-3 min-h-[340px] flex flex-col">
              <div className="space-y-2 flex-1">
                {paginatedList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveStatusFilter(null); setViewingProcessId(p.id); }}
                    className="w-full text-left terminal-row px-3 py-3 cursor-pointer hover:bg-blue-500/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-gold-500">#{p.number}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        p.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                        p.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {p.status === 'open' ? 'A' : p.status === 'in_progress' ? 'T' : 'C'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-slate-300">{suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}</span>
                      <span className="text-[10px] text-slate-300">
                        {formatNumber(p.lotCount, 0)} lote{p.lotCount !== 1 ? 's' : ''} &middot; {formatNumber(p.barCount, 0)} barra{p.barCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 mt-auto">
                <span className="text-[10px] text-slate-400">
                  Mostrando {(safePage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(safePage * ITEMS_PER_PAGE, filteredProcessList.length)} de {formatNumber(filteredProcessList.length, 0)} procesos
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="p-1.5 border border-blue-500/20 text-slate-400 hover:text-slate-200 hover:border-blue-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="p-1.5 border border-blue-500/20 text-slate-400 hover:text-slate-200 hover:border-blue-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart + Supplier Table — Full Width */}
      <div className="glass-panel">
        <div className="p-4 sm:p-5 border-b border-blue-500/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Volumen por Proveedor</h2>
          </div>
        </div>
        <div className="p-4 sm:p-5 w-full overflow-x-auto pb-4">
          <div style={{ minWidth: '700px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={(metrics?.supplierChartData ?? [])} barCategoryGap="20%" maxBarSize={35}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(59,130,246,0.15)' }} tickFormatter={(v: number) => formatNumber(v, 0)} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 0, fontSize: '12px', color: '#e2e8f0' }}
                  cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                  formatter={(v) => [formatNumber(v as number, 2), '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '8px' }}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar dataKey="ingresado" name="Oro Ingresado" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="boveda" name="Oro en Bóveda" fill="#22C55E" radius={[2, 2, 0, 0]} />
                <Bar dataKey="proceso" name="Oro en Proceso" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="porRefinar" name="Por Refinar" fill="#64748B" radius={[2, 2, 0, 0]} />
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
                    <tr key={row.id} className="terminal-row">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{row.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500">{formatLocaleNumber(row.grossIn)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-amber-400">{formatLocaleNumber(row.fineIn)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-blue-400">{formatLocaleNumber(row.fineOut)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-mono ${row.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {row.balance >= 0 ? '+' : ''}{formatLocaleNumber(row.balance)}
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
                    {formatNumber(tx.purity * 100, 0)}%
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
          variant="dashboard"
        />
      )}
    </div>
  );
}
