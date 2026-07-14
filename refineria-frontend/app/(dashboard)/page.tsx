'use client';

import { useGold } from '@/lib/GoldContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDashboardMetrics, type ProcessSummaryItem } from '@/lib/hooks/useDashboardMetrics';
import { useProcessDetail } from '@/lib/hooks/useProcessDetail';
import { useGoldBars } from '@/lib/hooks/useGoldBars';
import { useCriticos } from '@/lib/CriticosContext';

import { useMemo, useState, useRef, useEffect } from 'react';
import { getSupplierName, formatDate, formatNumber, formatLocaleWeight, formatLocaleNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { ProcessModal, type ProcessDetail, type LotDetail } from '@/components/shared/ProcessModal';
import { SupplierDirectory } from '@/components/inventory/SupplierDirectory';
import { CriticosQuickView } from '@/components/criticos/CriticosQuickView';
import {
  Wallet, Activity, Crosshair, Settings, ChevronDown, ChevronLeft, ChevronRight, Database, Shield, CheckCircle,
  AlertTriangle, CircleAlert, EyeOff, X, Beaker, History, Fuel, ArrowUpRight,
} from 'lucide-react';

function generateDashboardTrend(currentValue: number, points = 8): { v: number }[] {
  const trend: { v: number }[] = [];
  const centerVal = Math.max(Math.abs(currentValue) * 0.15, 1.5);
  for (let i = 0; i < points; i++) {
    const ratio = i / (points - 1);
    const bell = Math.sin(ratio * Math.PI);
    const base = 0.85 + bell * 0.15;
    const jitter = 1 + (Math.random() - 0.5) * 0.1;
    const val = centerVal * base * jitter;
    trend.push({ v: Math.round(Math.max(0.01, val) * 100) / 100 });
  }
  return trend;
}

function autonomyColor(days: number | null): { text: string; bar: string; border: string; bg: string; label: string } {
  if (days === null) return { text: 'text-slate-500', bar: 'bg-slate-500', border: 'border-slate-500/20', bg: 'bg-slate-500/10', label: '—' };
  if (days < 5) return { text: 'text-red-400', bar: 'bg-red-500', border: 'border-red-500/20', bg: 'bg-red-500/10', label: 'Crítico' };
  if (days < 10) return { text: 'text-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', label: 'Advertencia' };
  return { text: 'text-emerald-400', bar: 'bg-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', label: 'Estable' };
}

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

  const { quimicos, combustible, historial } = useCriticos();
  const [showCriticos, setShowCriticos] = useState(false);
  const criticosRef = useRef<HTMLDivElement>(null);
  const [selectedCriticoId, setSelectedCriticoId] = useState<string | null>(null);
  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [showCriticosQuickView, setShowCriticosQuickView] = useState(false);
  const { data: goldBars, isLoading: barsLoading } = useGoldBars();

  const gasoilDays = useMemo(() => {
    const log = combustible.log;
    if (log.length < 2) return null;
    const sorted = [...log].sort((a, b) => {
      const [ad, am, ay] = a.date.split('/');
      const [bd, bm, by] = b.date.split('/');
      return new Date(+by, +bm - 1, +bd).getTime() - new Date(+ay, +am - 1, +ad).getTime();
    });
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const daysDiff = (
      new Date(+last.date.split('/')[2], +last.date.split('/')[1] - 1, +last.date.split('/')[0]).getTime() -
      new Date(+first.date.split('/')[2], +first.date.split('/')[1] - 1, +first.date.split('/')[0]).getTime()
    ) / (1000 * 60 * 60 * 24);
    const totalConsumption = sorted.reduce((s, e) => s + Math.abs(e.consumption), 0);
    const avgDaily = daysDiff > 0 ? totalConsumption / daysDiff : 0;
    return avgDaily > 0 ? combustible.currentStock / avgDaily : null;
  }, [combustible]);

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

  const kpiCards = useMemo(() => {
    if (!metrics) return [];
    const trends = [
      generateDashboardTrend(metrics.oroIngresado),
      generateDashboardTrend(metrics.oroEnBoveda),
      generateDashboardTrend(metrics.oroEnProceso),
      generateDashboardTrend(metrics.faltaPorRefinar),
    ];
    return [
      { label: 'Oro Ingresado', value: formatLocaleWeight(metrics.oroIngresado), icon: Database, accent: 'gold', subtitle: `${formatNumber(metrics.totalBarCount, 0)} barras registradas`, sparkColor: '#f59e0b', trend: trends[0], onClick: () => setShowIngresoModal(true) },
      { label: 'Oro en Boveda', value: formatLocaleWeight(metrics.oroEnBoveda), icon: Shield, accent: 'gold', subtitle: 'Procesos Terminados y Cerrados', sparkColor: '#10b981', trend: trends[1] },
      { label: 'Oro en Proceso', value: formatLocaleWeight(metrics.oroEnProceso), icon: Settings, accent: 'blue', subtitle: 'Procesos Abiertos', sparkColor: '#0ea5e9', trend: trends[2] },
      { label: 'Oro Faltante / Por Refinar', value: formatLocaleWeight(metrics.faltaPorRefinar), icon: Wallet, accent: 'blue', subtitle: `${formatNumber(metrics.availableBarCount, 0)} barras sin procesar`, sparkColor: '#ef4444', trend: trends[3] },
    ];
  }, [metrics]);

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
          {(user.role === 'OWNER' || user.role === 'SUPERADMIN') && (
            <button
              onClick={() => { setShowCriticosQuickView(true); }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/40 text-amber-500 hover:bg-amber-500/20 transition-all rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <CircleAlert className="w-4 h-4" />
              Reporte de Críticos
            </button>
          )}
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
          {user.role === 'OWNER' && (
            <button
              onClick={() => { setShowCriticos((v) => !v); if (!showCriticos) setTimeout(() => criticosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${
                showCriticos
                  ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400'
                  : 'bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:border-blue-500/40'
              }`}
            >
              {showCriticos ? <EyeOff className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {showCriticos ? 'Ocultar Críticos' : 'Ver Insumos Críticos'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const isGold = kpi.accent === 'gold';
          const Icon = kpi.icon;
          const grdId = `kpi-spark-${kpi.label.replace(/\s+/g, '-')}`;
          const sc = kpi.sparkColor;
          return (
          <div
            key={kpi.label}
            onClick={kpi.onClick}
            role={kpi.onClick ? 'button' : undefined}
            tabIndex={kpi.onClick ? 0 : undefined}
            onKeyDown={kpi.onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kpi.onClick?.(); } } : undefined}
            className={`relative ${isGold ? 'glass-panel-gold' : 'glass-panel'} p-4 sm:p-5 pb-16 sm:pb-5 overflow-hidden hover:border-opacity-60 transition-all ${kpi.onClick ? 'cursor-pointer' : 'cursor-default'} active:scale-95 sm:active:scale-100 group`}
          >
            {/* Arrow indicator */}
            {kpi.onClick && (
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpRight className={`w-4 h-4 ${isGold ? 'text-gold-400' : 'text-blue-400'}`} />
              </div>
            )}
            {/* Mobile: background sparkline at bottom */}
            <div className="absolute bottom-0 left-0 right-0 sm:hidden pointer-events-none z-0 h-16 opacity-50">
              <ResponsiveContainer width="100%" height={64}>
                <AreaChart data={kpi.trend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`${grdId}-mobile`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={sc} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={sc} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={sc}
                    strokeWidth={2.5}
                    fill={`url(#${grdId}-mobile)`}
                    dot={false}
                    style={{ filter: `drop-shadow(0px 0px 4px ${sc})` }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Content + Desktop sparkline */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
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
              {/* Desktop: sparkline to the right */}
              <div className="hidden sm:block w-32 h-16 flex-shrink-0 self-center">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.trend}>
                    <defs>
                      <linearGradient id={grdId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={sc} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={sc} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis hide />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={sc}
                      strokeWidth={2.5}
                      fill={`url(#${grdId})`}
                      dot={false}
                      style={{ filter: `drop-shadow(0px 0px 4px ${sc})` }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* Estado de Operación — Insumos Críticos (Owner) */}
      {/* ════════════════════════════════════════════════ */}
      {user.role === 'OWNER' && (
        <div
          ref={criticosRef}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showCriticos ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="glass-panel p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Operación — Insumos Críticos</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {quimicos.map((q) => {
                const ac = autonomyColor(q.daysOfAutonomy);
                const maxStock = q.initialStock + q.ajuste;
                const pct = maxStock > 0 ? Math.min(100, (q.currentStock / maxStock) * 100) : 0;
                const barColor = q.daysOfAutonomy === null ? '#6B7280' : q.daysOfAutonomy < 5 ? '#EF4444' : q.daysOfAutonomy < 10 ? '#F59E0B' : '#10B981';
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedCriticoId(q.id)}
                    className={`glass-panel p-3 text-left active:scale-95 transition-all cursor-pointer hover:border-opacity-60 group border ${ac.border}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1 truncate">{q.name}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-number text-sm text-white">{formatLocaleNumber(q.currentStock)}</span>
                      <span className="text-[10px] text-slate-500">{q.unit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-500/10 rounded-full mb-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${ac.bg} ${ac.text}`}>
                        {q.daysOfAutonomy !== null ? `${Math.round(q.daysOfAutonomy)}d` : '—'}
                      </span>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">{ac.label}</span>
                    </div>
                  </button>
                );
              })}
              {/* Gasoil card */}
              {(() => {
                const gDays = gasoilDays;
                const gAc = gDays !== null ? autonomyColor(gDays) : null;
                const gPct = combustible.initialAmount > 0 ? Math.min(100, (combustible.currentStock / combustible.initialAmount) * 100) : 0;
                return (
                  <button
                    onClick={() => setSelectedCriticoId('__gasoil__')}
                    className={`glass-panel p-3 text-left active:scale-95 transition-all cursor-pointer hover:border-opacity-60 group border ${gAc ? gAc.border : 'border-amber-500/20'}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Gasoil</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-number text-sm text-white">{formatLocaleNumber(combustible.currentStock)}</span>
                      <span className="text-[10px] text-slate-500">Lts</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-500/10 rounded-full mb-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${gPct}%`, backgroundColor: '#F59E0B' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${gAc ? gAc.bg : 'bg-amber-500/10'} ${gAc ? gAc.text : 'text-amber-400'}`}>
                        {gDays !== null ? `${Math.round(gDays)}d` : `${formatLocaleNumber(combustible.currentStock)}`}
                      </span>
                      <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                        {gDays !== null ? gAc!.label : 'Disponible'}
                      </span>
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* Bottom Sheet — Historial de Insumo */}
      {/* ════════════════════════════════════════════════ */}
      {selectedCriticoId !== null && (() => {
        const isGasoil = selectedCriticoId === '__gasoil__';
        const quimico = isGasoil ? null : quimicos.find((q) => q.id === selectedCriticoId) ?? null;
        const itemName = isGasoil ? 'Gasoil' : quimico?.name ?? '';
        const fuelKeywords = ['gasoil', 'diesel', 'combustible', 'gasolina'];
        const relatedHistory = historial.filter((h) =>
          isGasoil
            ? fuelKeywords.some((kw) => h.insumo.toLowerCase().includes(kw))
            : h.insumo.toLowerCase().includes(itemName.toLowerCase())
        );
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCriticoId(null)} />
            <div className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto glass-panel p-5 sm:p-6 z-10 rounded-xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {isGasoil ? <Fuel className="w-5 h-5 text-amber-400" /> : <Beaker className="w-5 h-5 text-blue-400" />}
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">{itemName}</h2>
                </div>
                <button onClick={() => setSelectedCriticoId(null)} className="p-1 hover:bg-blue-500/10 rounded-sm transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              {/* Detail */}
              {isGasoil ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Disponible</p>
                    <p className="text-lg font-bold text-amber-400 hud-number">{formatLocaleNumber(combustible.currentStock)} <span className="text-xs text-slate-400">Lts</span></p>
                  </div>
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Inicial</p>
                    <p className="text-lg font-bold text-white hud-number">{formatLocaleNumber(combustible.initialAmount)} <span className="text-xs text-slate-400">Lts</span></p>
                  </div>
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Consumido</p>
                    <p className="text-lg font-bold text-red-400 hud-number">{formatLocaleNumber(Math.max(0, combustible.initialAmount - combustible.currentStock))} <span className="text-xs text-slate-400">Lts</span></p>
                  </div>
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Autonomía</p>
                    <p className={`text-lg font-bold hud-number ${gasoilDays !== null && gasoilDays < 5 ? 'text-red-400' : gasoilDays !== null && gasoilDays < 10 ? 'text-amber-400' : gasoilDays !== null ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {gasoilDays !== null ? `${gasoilDays.toFixed(1)}d` : '—'}
                    </p>
                  </div>
                </div>
              ) : quimico ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-midnight-900/60 border ${autonomyColor(quimico.daysOfAutonomy).border} p-3 text-center`}>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Stock Actual</p>
                    <p className="text-lg font-bold text-white hud-number">{formatLocaleNumber(quimico.currentStock)} <span className="text-xs text-slate-400">{quimico.unit}</span></p>
                  </div>
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Consumo Diario</p>
                    <p className="text-lg font-bold text-white hud-number">{quimico.dailyConsumption > 0 ? quimico.dailyConsumption : <span className="text-slate-500">—</span>} <span className="text-xs text-slate-400">{quimico.unit}</span></p>
                  </div>
                  <div className={`bg-midnight-900/60 border ${autonomyColor(quimico.daysOfAutonomy).border} p-3 text-center`}>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Autonomía</p>
                    <p className={`text-lg font-bold hud-number ${autonomyColor(quimico.daysOfAutonomy).text}`}>
                      {quimico.daysOfAutonomy !== null ? `${quimico.daysOfAutonomy.toFixed(1)}d` : '—'}
                    </p>
                  </div>
                  <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Mínimo</p>
                    <p className="text-lg font-bold text-slate-300 hud-number">{quimico.minimum} <span className="text-xs text-slate-400">{quimico.unit}</span></p>
                  </div>
                </div>
              ) : null}
              {/* History */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Historial de Consumo</h3>
                </div>
                {relatedHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Sin movimientos registrados.</p>
                ) : (
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {relatedHistory.map((h) => (
                      <div key={h.id} className="flex items-center justify-between bg-midnight-900/40 border border-blue-500/5 px-3 py-2">
                        <span className="text-[10px] font-mono text-slate-500">{h.date}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-mono font-bold ${h.tipo === 'CARGO' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {h.tipo === 'CARGO' ? '+' : '-'}{formatLocaleNumber(h.cantidad)}
                          </span>
                          {h.observacion && (
                            <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{h.observacion}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Status Cards with Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {([
          { key: 'open' as const, label: 'ABIERTOS', icon: Settings, count: metrics?.processCounts.open ?? 0, desc: 'Procesos en curso', border: 'border-blue-500/50', shadow: 'shadow-blue-500/20', bgActive: 'bg-blue-500/10', textLabel: 'text-blue-400/70', textIcon: 'text-blue-500', bar: 'bg-blue-500/30' },
          { key: 'in_progress' as const, label: 'TERMINADOS', icon: CheckCircle, count: metrics?.processCounts.inProgress ?? 0, desc: 'Listos para cerrar', border: 'border-green-500/50', shadow: 'shadow-green-500/20', bgActive: 'bg-green-500/10', textLabel: 'text-green-400/70', textIcon: 'text-green-500', bar: 'bg-green-500/30' },
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
                {activeStatusFilter === 'open' ? 'PROCESOS ABIERTOS' : activeStatusFilter === 'in_progress' ? 'PROCESOS EN CURSO / TERMINADOS' : 'PROCESOS CERRADOS'}
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
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Volumen por Cliente</h2>
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
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cliente</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ingreso Bruto (g)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Recuperado R (g)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Egresos (g)</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Balance (g)</th>
                </tr>
              </thead>
              <tbody>
                {(metrics?.supplierChartData ?? []).length > 0 ? (
                  (metrics?.supplierChartData ?? []).map((row) => (
                    <tr key={row.id} className="terminal-row">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{row.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500">{formatNumber(row.ingresado)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-amber-400">{formatNumber(row.recuperadoR)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-blue-400">{formatNumber(row.egresos)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-mono ${row.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {row.balance >= 0 ? '+' : ''}{formatNumber(row.balance)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                      No hay datos de clientes.
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
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cliente</th>
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

      {/* ════════════════════════════════════════════════ */}
      {/* Modal — Desglose de Oro Ingresado */}
      {/* ════════════════════════════════════════════════ */}
      {showIngresoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-md p-4" onClick={() => setShowIngresoModal(false)}>
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-panel rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between shrink-0 bg-midnight-900/50 backdrop-blur-md rounded-t-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Desglose de Oro Ingresado</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">
                    {barsLoading ? 'Cargando...' : `${goldBars?.length ?? 0} barras registradas`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowIngresoModal(false)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <SupplierDirectory
                goldBars={goldBars ?? []}
                suppliers={suppliers}
                isLoading={barsLoading}
                purityFirst={true}
                filterSupplierId={selectedSupplierId !== 'all' ? selectedSupplierId : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {showCriticosQuickView && (
        <CriticosQuickView onClose={() => setShowCriticosQuickView(false)} />
      )}

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
