'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  Beaker,
  Flame,
  ClipboardList,
  CircleAlert,
  Fuel,
  Cylinder,
  Calendar,
  TrendingDown,
  Gauge,
  FlaskConical,
  Wrench,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCriticos } from '@/lib/CriticosContext';

const TABS = [
  { id: 'resumen', label: 'RESUMEN', icon: LayoutDashboard },
  { id: 'quimicos', label: 'QUÍMICOS', icon: Beaker },
  { id: 'gases', label: 'GASES / COMBUSTIBLE', icon: Flame },
  { id: 'novedades', label: 'NOVEDADES', icon: ClipboardList },
];

/* ───── Helpers ───── */

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function autonomyColor(days: number | null): { text: string; bar: string; label: string; icon: 'critical' | 'warning' | 'safe' | 'none' } {
  if (days === null) return { text: 'text-slate-500', bar: 'bg-slate-500', label: '—', icon: 'none' };
  if (days < 5) return { text: 'text-red-400', bar: 'bg-red-500', label: 'Crítico', icon: 'critical' };
  if (days < 10) return { text: 'text-amber-400', bar: 'bg-amber-500', label: 'Advertencia', icon: 'warning' };
  return { text: 'text-emerald-400', bar: 'bg-emerald-500', label: 'Estable', icon: 'safe' };
}

function generateMockTrend(baseValue: number, length: number, volatility: number = 0.18): { v: number }[] {
  const trend: { v: number }[] = [];
  let current = baseValue;
  for (let i = 0; i < length; i++) {
    const change = current * (Math.random() - 0.5) * volatility;
    current = Math.max(1, current + change);
    trend.push({ v: Math.round(current * 10) / 10 });
  }
  return trend;
}

/* ───── Modal Component ───── */

function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-panel p-5 sm:p-6 z-10 rounded-t-xl sm:rounded-none mt-auto sm:mt-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gold-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-500/10 rounded-sm transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───── KPI Card Component ───── */

function KpiCard({
  icon: Icon,
  label,
  value,
  valueClass,
  subtext,
  iconClass,
  onClick,
  isMounted,
  sparklineData,
  sparklineColor,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  valueClass?: string;
  subtext?: string;
  iconClass?: string;
  onClick?: () => void;
  isMounted?: boolean;
  sparklineData?: { v: number }[];
  sparklineColor?: string;
  children?: React.ReactNode;
}) {
  const Comp = onClick ? 'button' : 'div';
  const grdId = `spark-grd-${label.replace(/\s+/g, '-')}`;
  return (
    <Comp
      onClick={onClick}
      className={`bg-midnight-900/50 border border-white/10 backdrop-blur-md p-4 text-left transition-all duration-200 relative ${
        onClick
          ? 'cursor-pointer hover:bg-midnight-700/40 hover:shadow-lg hover:shadow-blue-500/5 active:scale-95 group'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${iconClass ?? 'text-blue-400'}`} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
            {onClick && (
              <ChevronRight className="w-3 h-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            )}
          </div>
          {value != null && (
            <p className={`text-2xl font-bold hud-number ${valueClass ?? 'text-white'}`}>
              {isMounted ? value : '—'}
            </p>
          )}
          {children}
          {subtext && (
            <p className="text-[10px] text-slate-500 mt-0.5">{subtext}</p>
          )}
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <div className="w-28 sm:w-32 h-14 sm:h-16 flex-shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={grdId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sparklineColor || '#3B82F6'} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={sparklineColor || '#3B82F6'} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis hide />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Area type="monotone" dataKey="v" stroke={sparklineColor || '#3B82F6'} strokeWidth={2} fill={`url(#${grdId})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Comp>
  );
}

/* ───── Page Component ───── */

export default function CriticosPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const { quimicos, gases, combustible, novedades, addNovedad } = useCriticos();

  useEffect(() => { setIsMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  /* ── Modal state ── */
  const [modal, setModal] = useState<'autonomia' | 'criticos' | 'gases' | 'combustible' | null>(null);

  /* ── Novedades form state ── */
  const [showNovedadForm, setShowNovedadForm] = useState(false);
  const [nfEquipo, setNfEquipo] = useState('');
  const [nfDiagnostico, setNfDiagnostico] = useState('');
  const [nfAccion, setNfAccion] = useState('');

  /* ── Computed KPIs ── */

  const quimicosActivos = useMemo(() => quimicos.filter((q) => q.dailyConsumption > 0), [quimicos]);

  const minAutonomy = useMemo(() => {
    const valid = quimicosActivos.filter((q) => q.daysOfAutonomy !== null);
    if (valid.length === 0) return null;
    return Math.min(...valid.map((q) => q.daysOfAutonomy!)) || 0;
  }, [quimicosActivos]);

  const criticalItem = useMemo(() => {
    if (minAutonomy === null) return null;
    return quimicosActivos.find((q) => q.daysOfAutonomy === minAutonomy);
  }, [quimicosActivos, minAutonomy]);

  const criticosBajos = useMemo(() => {
    return quimicosActivos
      .filter((q) => q.daysOfAutonomy !== null && q.daysOfAutonomy < 5)
      .sort((a, b) => (a.daysOfAutonomy ?? 0) - (b.daysOfAutonomy ?? 0));
  }, [quimicosActivos]);

  const top3Criticos = useMemo(() => {
    return quimicosActivos
      .filter((q) => q.daysOfAutonomy !== null)
      .sort((a, b) => (a.daysOfAutonomy ?? 0) - (b.daysOfAutonomy ?? 0))
      .slice(0, 3);
  }, [quimicosActivos]);

  const combustibleWeeklyAvg = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = combustible.log.filter((e) => {
      const [d, m, y] = e.date.split('/');
      const dt = new Date(+(y || '2026'), +m - 1, +d);
      return dt >= weekAgo;
    });
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((s, e) => s + e.consumption, 0) / recent.length);
  }, [combustible]);

  /* ── Sparkline data ── */
  const autonomySparkline = useMemo(() => {
    if (minAutonomy === null) return [];
    return generateMockTrend(minAutonomy, 7);
  }, [minAutonomy]);

  const criticosSparkline = useMemo(() => {
    return criticosBajos.length > 0 ? generateMockTrend(criticosBajos.length, 7) : [];
  }, [criticosBajos.length]);

  const gasesSparkline = useMemo(() => {
    const total = gases.reduce((s, g) => s + g.full + g.inUse + g.available, 0);
    return total > 0 ? generateMockTrend(total, 7) : [];
  }, [gases]);

  const combustibleSparkline = useMemo(() => {
    if (combustible.log.length >= 3) {
      return combustible.log.slice(-7).map((entry) => ({ v: entry.remaining }));
    }
    return generateMockTrend(combustible.currentStock, 7);
  }, [combustible]);

  const handleAddNovedad = () => {
    if (!nfEquipo.trim()) return;
    addNovedad(nfEquipo.trim(), nfDiagnostico.trim(), nfAccion.trim());
    setNfEquipo('');
    setNfDiagnostico('');
    setNfAccion('');
    setShowNovedadForm(false);
  };

  return (
    <div className="space-y-5 mx-auto max-w-7xl px-1">

      {/* ───── Header ───── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CircleAlert className="w-5 h-5 text-red-400" />
          Reporte de Insumos Críticos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
          Almacén Padre de la Patria
        </p>
      </div>

      {/* ───── Tab Navigation ───── */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                  : 'bg-midnight-800/50 border border-blue-500/10 text-slate-500 hover:text-slate-300 hover:border-blue-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: RESUMEN */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'resumen' && (
        <div className="space-y-5">

          {/* KPI Cards — Interactive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

            {/* DÍAS DE OPERACIÓN */}
            <KpiCard
              icon={FlaskConical}
              label="DÍAS DE OPERACIÓN"
              isMounted={isMounted}
              iconClass={isMounted && minAutonomy !== null ? autonomyColor(minAutonomy).text : 'text-blue-400'}
              valueClass={isMounted && minAutonomy !== null ? autonomyColor(minAutonomy).text : 'text-white'}
              value={minAutonomy !== null ? minAutonomy.toFixed(1) : '—'}
              onClick={() => setModal('autonomia')}
              sparklineData={isMounted ? autonomySparkline : []}
              sparklineColor="#3B82F6"
            >
              {isMounted && minAutonomy !== null && (
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {autonomyColor(minAutonomy).label} — Limitado por: {criticalItem?.name ?? '—'}
                </p>
              )}
            </KpiCard>

            {/* CRÍTICOS */}
            <KpiCard
              icon={AlertTriangle}
              label="Críticos"
              isMounted={isMounted}
              value={criticosBajos.length.toString()}
              subtext="con &lt;5 días de autonomía"
              onClick={() => setModal('criticos')}
              sparklineData={isMounted ? criticosSparkline : []}
              sparklineColor="#EF4444"
            />

            {/* GASES */}
            <KpiCard
              icon={Cylinder}
              label="Gases"
              isMounted={isMounted}
              value={gases.length.toString()}
              subtext="tipos registrados"
              onClick={() => setModal('gases')}
              sparklineData={isMounted ? gasesSparkline : []}
              sparklineColor="#06B6D4"
            />

            {/* COMBUSTIBLE */}
            <KpiCard
              icon={Fuel}
              label="Combustible"
              isMounted={isMounted}
              value={combustible.currentStock.toLocaleString()}
              subtext="litros disponibles"
              onClick={() => setModal('combustible')}
              sparklineData={isMounted ? combustibleSparkline : []}
              sparklineColor="#F59E0B"
            />
          </div>

          {/* Estado de Químicos — Desktop: tabla, Mobile: cards */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Químicos</h2>
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Insumo</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Stock / Existencia</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unidad</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Consumo Diario</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Mínimo</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Días Autonomía</th>
                  </tr>
                </thead>
                <tbody>
                  {quimicos.map((q) => {
                    const ac = autonomyColor(isMounted ? q.daysOfAutonomy : null);
                    const pct = isMounted && q.initialStock > 0 ? Math.min(100, (q.currentStock / q.initialStock) * 100) : 0;
                    const depletionDate = isMounted && q.daysOfAutonomy !== null ? addDays(new Date(), q.daysOfAutonomy) : null;
                    return (
                      <tr key={q.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-200">{q.name}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap min-w-[130px]">
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-mono font-bold ${ac.text}`}>
                              {isMounted ? Number(q.currentStock || 0).toLocaleString('de-DE') : '—'}
                            </span>
                            {ac.icon === 'critical' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 blink-warning" />
                            )}
                          </div>
                          {isMounted && q.initialStock > 0 && (
                            <div className="w-full h-1.5 bg-midnight-800 rounded-sm overflow-hidden mt-1 max-w-[160px]">
                              <div className={`h-full rounded-sm transition-all duration-500 ${ac.bar}`} style={{ width: `${pct}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">{q.unit}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                          {isMounted && q.dailyConsumption > 0 ? q.dailyConsumption : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">{q.minimum}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          {isMounted && q.daysOfAutonomy !== null ? (
                            <div className="group relative inline-block">
                              <span className={`text-sm font-mono font-bold ${ac.text} cursor-help`}>
                                {q.daysOfAutonomy.toFixed(1)}
                              </span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                <div className="bg-midnight-800 border border-blue-500/20 px-3 py-2 text-xs text-slate-300 whitespace-nowrap rounded-sm shadow-xl">
                                  Fecha estimada de agotamiento:<br />
                                  <span className="text-amber-400 font-semibold">{depletionDate ? formatDate(depletionDate) : '—'}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden divide-y divide-blue-500/10">
              {quimicos.map((q) => {
                const ac = autonomyColor(isMounted ? q.daysOfAutonomy : null);
                const pct = isMounted && q.initialStock > 0 ? Math.min(100, (q.currentStock / q.initialStock) * 100) : 0;
                const depletionDate = isMounted && q.daysOfAutonomy !== null ? addDays(new Date(), q.daysOfAutonomy) : null;
                return (
                  <div key={q.id} className="p-4 hover:bg-midnight-800/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-200 truncate">{q.name}</h3>
                        <p className="text-[10px] font-mono text-slate-500">{q.unit}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ac.icon === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-red-400 blink-warning" />}
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${ac.text} ${
                          ac.icon === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                          ac.icon === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                          ac.icon === 'safe' ? 'bg-emerald-500/10 border-emerald-500/20' :
                          'bg-slate-500/10 border-slate-500/20'
                        }`}>
                          {isMounted && q.daysOfAutonomy !== null ? `${q.daysOfAutonomy.toFixed(1)}d` : '—'}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar + stock indicator */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-midnight-800 rounded-sm overflow-hidden">
                        <div className={`h-full rounded-sm transition-all duration-500 ${ac.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-mono w-14 text-right ${ac.text}`}>
                        {isMounted ? `${Number(q.currentStock || 0).toLocaleString('de-DE')}/${q.initialStock}` : '—'}
                      </span>
                    </div>
                    {/* Tooltip / depletion info */}
                    {isMounted && depletionDate && (
                      <p className="text-[9px] text-slate-600 mt-1 font-mono">
                        Agotamiento estimado: {formatDate(depletionDate)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gases + Combustible */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Gases — Mini-cards tipo cilindro */}
            <div className="glass-panel">
              <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
                <Cylinder className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gases</h2>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gases.map((g) => {
                  const total = g.full + g.inUse + g.available;
                  const fullPct = total > 0 ? (g.full / total) * 100 : 0;
                  return (
                    <div key={g.id} className="bg-midnight-800/60 border border-cyan-500/15 p-4 rounded-sm flex flex-col items-center gap-3 hover:border-cyan-500/30 transition-colors group">
                      {/* Cylinder icon */}
                      <div className="relative w-12 h-20 bg-midnight-900 border-2 border-cyan-500/20 rounded-full overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                          style={{
                            height: `${fullPct}%`,
                            background: 'linear-gradient(to top, #06B6D4, #22D3EE)',
                            boxShadow: '0 0 8px rgba(6,182,212,0.2)',
                          }}
                        />
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-cyan-500/30 rounded-full" />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-cyan-500/30 rounded-full" />
                      </div>
                      <h3 className="text-sm font-bold text-white text-center">{g.name}</h3>
                      {/* Stats row */}
                      <div className="w-full grid grid-cols-3 gap-1 text-center">
                        <div className="bg-midnight-900/60 border border-amber-500/10 p-2 rounded-sm">
                          <p className="text-sm font-bold font-mono text-amber-400">{g.full}</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Llenas</p>
                        </div>
                        <div className="bg-midnight-900/60 border border-blue-500/10 p-2 rounded-sm">
                          <p className="text-sm font-bold font-mono text-blue-400">{g.inUse}</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">En Uso</p>
                        </div>
                        <div className="bg-midnight-900/60 border border-green-500/10 p-2 rounded-sm">
                          <p className={`text-sm font-bold font-mono ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>{g.available}</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Disp.</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combustible — fuel dispenser */}
            <div className="glass-panel">
              <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Combustible</h2>
                </div>
                <span className="text-[10px] font-mono text-slate-600 border border-blue-500/10 px-2 py-0.5">GASOIL</span>
              </div>
              <div className="p-4 sm:p-5">
                {isMounted ? (
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="relative w-16 h-52 bg-midnight-900 border-2 border-blue-500/15 rounded-sm overflow-hidden">
                      <div className="absolute inset-0 flex flex-col justify-between py-1">
                        {[100, 75, 50, 25, 0].map((pct) => (
                          <div key={pct} className="flex items-center gap-1">
                            <span className="text-[7px] font-mono text-slate-600 w-5 text-right leading-none">{pct}%</span>
                            <div className="flex-1 border-t border-blue-500/8" />
                          </div>
                        ))}
                      </div>
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out fuel-glow"
                        style={{
                          height: `${Math.round((combustible.currentStock / combustible.initialAmount) * 100)}%`,
                          background: 'linear-gradient(to top, #D97706, #F59E0B, #FBBF24)',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                    </div>
                    <Fuel className="w-5 h-5 text-amber-500/60 -rotate-45" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-midnight-900 border border-blue-500/15 p-4 text-center">
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-1">Disponible</p>
                      <p className="text-3xl font-bold text-amber-400 hud-number tracking-wider font-mono tabular-nums">
                        {combustible.currentStock.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">LITROS</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-midnight-900/60 border border-blue-500/10 p-2.5 text-center">
                        <p className="text-[8px] text-slate-600 uppercase tracking-widest">Inicial</p>
                        <p className="text-xs font-mono font-bold text-slate-300">{combustible.initialAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-midnight-900/60 border border-blue-500/10 p-2.5 text-center">
                        <p className="text-[8px] text-slate-600 uppercase tracking-widest">Consumido</p>
                        <p className="text-xs font-mono font-bold text-red-400">{(combustible.initialAmount - combustible.currentStock).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-midnight-800 rounded-sm h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-sm transition-all duration-700"
                        style={{ width: `${Math.min(100, (combustible.currentStock / combustible.initialAmount) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 text-center font-mono">
                      {((combustible.currentStock / combustible.initialAmount) * 100).toFixed(1)}% · {combustible.log.length} movimientos
                    </p>
                  </div>
                </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Fuel className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Cargando datos de combustible...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: QUÍMICOS */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'quimicos' && (
        <div className="space-y-5">
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registro de Consumo Diario</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest sticky left-0 bg-midnight-900/90 backdrop-blur-sm z-10">Insumo</th>
                    {quimicos[0]?.history.map((h) => (
                      <th key={h.date} className="px-2 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h.date}</th>
                    ))}
                    <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-l border-blue-500/20">Existencia</th>
                  </tr>
                </thead>
                <tbody>
                  {quimicos.filter((q) => q.history.length > 0).map((q) => {
                    const ac = autonomyColor(isMounted ? q.daysOfAutonomy : null);
                    return (
                    <tr key={q.id} className="terminal-row">
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-200 font-medium sticky left-0 bg-midnight-900/90 backdrop-blur-sm z-10">{q.name}</td>
                      {q.history.map((h, i) => (
                        <td key={i} className="px-2 py-2.5 text-center font-mono text-slate-400">{h.v}</td>
                      ))}
                      <td className={`px-3 py-2.5 text-center font-mono font-bold ${ac.text} border-l border-blue-500/20`}>
                        {isMounted ? Number(q.currentStock || 0).toLocaleString('de-DE') : '—'}
                        {ac.icon === 'critical' && <AlertTriangle className="inline-block w-3 h-3 ml-1 text-red-400" />}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart: Consumo por químico */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tendencia de Consumo</h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quimicos[0]?.history.map((h, i) => ({
                    date: h.date,
                    [quimicos[0].name]: h.v,
                    [quimicos[2]?.name ?? '']: quimicos[2]?.history[i]?.v ?? 0,
                    [quimicos[3]?.name ?? '']: quimicos[3]?.history[i]?.v ?? 0,
                  })) ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '4px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey={quimicos[0].name} stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={quimicos[2]?.name ?? ''} stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={quimicos[3]?.name ?? ''} stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Consumo diario — {quimicos[0]?.name}, {quimicos[2]?.name}, {quimicos[3]?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: GASES / COMBUSTIBLE */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'gases' && (
        <div className="space-y-5">

          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Cylinder className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Control de Cilindros</h2>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {gases.map((g) => {
                const total = g.full + g.inUse + g.available;
                const fullPct = total > 0 ? (g.full / total) * 100 : 0;
                return (
                  <div key={g.id} className="bg-midnight-800/60 border border-cyan-500/15 p-4 rounded-sm flex flex-col items-center gap-3 hover:border-cyan-500/30 transition-colors">
                    {/* Cylinder visual */}
                    <div className="relative w-14 h-24 bg-midnight-900 border-2 border-cyan-500/20 rounded-full overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                        style={{
                          height: `${fullPct}%`,
                          background: 'linear-gradient(to top, #06B6D4, #22D3EE)',
                          boxShadow: '0 0 8px rgba(6,182,212,0.2)',
                        }}
                      />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-500/30 rounded-full" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-cyan-500/30 rounded-full" />
                    </div>
                    <h3 className="text-sm font-bold text-white text-center">{g.name}</h3>
                    <div className="w-full grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-midnight-900/60 border border-amber-500/10 p-2 rounded-sm">
                        <p className="text-base font-bold font-mono text-amber-400">{g.full}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Llenas</p>
                      </div>
                      <div className="bg-midnight-900/60 border border-blue-500/10 p-2 rounded-sm">
                        <p className="text-base font-bold font-mono text-blue-400">{g.inUse}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">En Uso</p>
                      </div>
                      <div className="bg-midnight-900/60 border border-green-500/10 p-2 rounded-sm">
                        <p className={`text-base font-bold font-mono ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>{g.available}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Disp.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bar chart gases */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Distribución de Cilindros</h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gases.map((g) => ({ name: g.name, Llenas: g.full, 'En Uso': g.inUse, Disponibles: g.available }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '4px', fontSize: '12px' }} />
                    <Bar dataKey="Llenas" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="En Uso" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Disponibles" fill="#10B981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Combustible */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Control Diario de Combustible</h2>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-blue-500/10">
              {isMounted ? (
                <>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cantidad Inicial</p>
                    <p className="text-lg font-bold text-white hud-number">{combustible.initialAmount.toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Disponible</p>
                    <p className="text-lg font-bold text-amber-400 hud-number">{combustible.currentStock.toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Consumido</p>
                    <p className="text-lg font-bold text-red-400 hud-number">{(combustible.initialAmount - combustible.currentStock).toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
                  </div>
                </>
              ) : (
                <div className="col-span-3 flex items-center justify-center py-6">
                  <p className="text-sm text-slate-500">Cargando...</p>
                </div>
              )}
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10 bg-midnight-800/50 sticky top-0">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest"><Calendar className="w-3 h-3 inline-block mr-1" />Fecha</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Consumo (Lts)</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Disponible (Lts)</th>
                  </tr>
                </thead>
                <tbody>
                  {combustible.log.map((entry, i) => (
                    <tr key={i} className="terminal-row">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-300">{entry.date}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-red-400 text-right">{entry.consumption.toLocaleString()}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-300 text-right">{entry.remaining.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: NOVEDADES */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'novedades' && (
        <div className="glass-panel">
          <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bitácora de Incidencias</h2>
            </div>
            <button
              onClick={() => setShowNovedadForm(!showNovedadForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-midnight-900 text-[10px] font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 transition-all"
            >
              {showNovedadForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {showNovedadForm ? 'Cerrar' : 'Nueva'}
            </button>
          </div>

          {showNovedadForm && (
            <div className="p-4 sm:p-5 border-b border-blue-500/10 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Equipo</label>
                <input
                  type="text"
                  value={nfEquipo}
                  onChange={(e) => setNfEquipo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none uppercase"
                  placeholder="NOMBRE DEL EQUIPO"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Diagnóstico</label>
                <textarea
                  value={nfDiagnostico}
                  onChange={(e) => setNfDiagnostico(e.target.value.toUpperCase())}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none uppercase resize-none"
                  placeholder="DESCRIPCIÓN DEL DIAGNÓSTICO"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Acción</label>
                <textarea
                  value={nfAccion}
                  onChange={(e) => setNfAccion(e.target.value.toUpperCase())}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none uppercase resize-none"
                  placeholder="ACCIÓN REALIZADA O PENDIENTE"
                />
              </div>
              <button
                onClick={handleAddNovedad}
                disabled={!nfEquipo.trim()}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
              >
                Registrar Incidencia
              </button>
            </div>
          )}

          <div className="divide-y divide-blue-500/10">
            {novedades.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 space-y-3 hover:bg-midnight-800/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-200">{n.equipo}</h3>
                    <div className="mt-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Diagnóstico</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{n.diagnostico}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Acción</p>
                      <p className="text-xs text-amber-400/90 leading-relaxed">{n.accion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ════════════════════════════════════════════════ */}

      {/* Modal: Proyección de Agotamiento */}
      <Modal open={modal === 'autonomia'} onClose={() => setModal(null)} title="Proyección de Agotamiento" icon={Calendar}>
        <div className="space-y-3">
          {top3Criticos.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No hay insumos con consumo activo.</p>
          )}
          {top3Criticos.map((q, i) => {
            if (q.daysOfAutonomy === null) return null;
            const depletionDate = addDays(new Date(), q.daysOfAutonomy);
            return (
              <div key={q.id} className="bg-midnight-800/60 border border-blue-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">#{i + 1}</span>
                  {q.daysOfAutonomy < 5 && (
                    <span className="text-[10px] text-red-400 font-semibold uppercase tracking-widest blink-warning">Crítico</span>
                  )}
                </div>
                <p className="text-sm font-bold text-white">{q.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Stock actual:</span>
                    <span className="ml-1 font-mono text-slate-200">{Number(q.currentStock || 0).toLocaleString('de-DE')} {q.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Consumo/día:</span>
                    <span className="ml-1 font-mono text-slate-200">{q.dailyConsumption}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Autonomía:</span>
                    <span className={`ml-1 font-mono ${autonomyColor(q.daysOfAutonomy).text}`}>{q.daysOfAutonomy.toFixed(1)} días</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Se agota:</span>
                    <span className="ml-1 font-mono text-amber-400">{formatDate(depletionDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Modal: Insumos Críticos (< 5 días) */}
      <Modal open={modal === 'criticos'} onClose={() => setModal(null)} title="Insumos Críticos" icon={AlertTriangle}>
        {criticosBajos.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No hay insumos con autonomía crítica.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {criticosBajos.map((q) => (
              <div key={q.id} className="flex items-center justify-between bg-midnight-800/60 border border-red-500/10 p-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-bold text-slate-200 truncate">{q.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{q.unit}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Stock</p>
                    <p className="text-xs font-mono font-bold text-gold-500">{Number(q.currentStock || 0).toLocaleString('de-DE')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Consumo</p>
                    <p className="text-xs font-mono text-slate-300">{q.dailyConsumption}/día</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Autonomía</p>
                    <p className={`text-xs font-mono font-bold ${autonomyColor(q.daysOfAutonomy).text}`}>{q.daysOfAutonomy?.toFixed(1)}d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal: Desglose de Gases */}
      <Modal open={modal === 'gases'} onClose={() => setModal(null)} title="Desglose de Cilindros" icon={Cylinder}>
        <div className="space-y-3">
          {gases.map((g) => (
            <div key={g.id} className="bg-midnight-800/60 border border-blue-500/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{g.name}</h3>
                <span className={`text-xs font-mono font-bold ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {g.available} disponibles
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-amber-400 hud-number">{g.full}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Llenas</p>
                </div>
                <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-blue-400 hud-number">{g.inUse}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">En Uso</p>
                </div>
                <div className="bg-midnight-900/60 border border-blue-500/10 p-3 text-center">
                  <p className={`text-lg font-bold hud-number ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>{g.available}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Vacíos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Detalle de Combustible */}
      <Modal open={modal === 'combustible'} onClose={() => setModal(null)} title="Detalle de Combustible" icon={Fuel}>
        <div className="space-y-4">
          {/* Tank gauge */}
          <div className="bg-midnight-800/60 border border-blue-500/10 p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-40 bg-midnight-900 border border-blue-500/15 rounded-sm overflow-hidden flex-shrink-0">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                  style={{
                    height: `${Math.round((combustible.currentStock / combustible.initialAmount) * 100)}%`,
                    background: 'linear-gradient(to top, #D97706, #F59E0B, #FBBF24)',
                    boxShadow: '0 0 12px rgba(245,158,11,0.3)',
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-amber-400 hud-number">{combustible.currentStock.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 font-mono">de {combustible.initialAmount.toLocaleString()} Lts</p>
                <div className="mt-2 w-full bg-midnight-800 rounded-sm h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-sm"
                    style={{ width: `${Math.min(100, (combustible.currentStock / combustible.initialAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {((combustible.currentStock / combustible.initialAmount) * 100).toFixed(1)}% de capacidad
                </p>
              </div>
            </div>
          </div>

          {/* Weekly average */}
          <div className="bg-midnight-800/60 border border-blue-500/10 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Consumo Promedio (última semana)</p>
            <p className="text-2xl font-bold text-white hud-number">{combustibleWeeklyAvg.toLocaleString()} <span className="text-sm text-slate-400">Lts/día</span></p>
            <p className="text-[10px] text-slate-500 mt-1">
              Proyección restante: ~{combustibleWeeklyAvg > 0 ? Math.round(combustible.currentStock / combustibleWeeklyAvg) : '—'} días
            </p>
          </div>

          {/* Last 5 entries */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Últimos movimientos</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {combustible.log.slice(-5).reverse().map((entry, i) => (
                <div key={i} className="flex items-center justify-between bg-midnight-900/40 border border-blue-500/5 px-3 py-2">
                  <span className="text-xs font-mono text-slate-400">{entry.date}</span>
                  <span className="text-xs font-mono text-red-400">-{entry.consumption.toLocaleString()} Lts</span>
                  <span className="text-xs font-mono text-slate-500">{entry.remaining.toLocaleString()} restantes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ───── Global Styles ───── */}
      <style>{`
        @keyframes blinkWarning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .blink-warning {
          animation: blinkWarning 1s ease-in-out infinite;
        }
        @keyframes fuelGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.4); }
        }
        .fuel-glow {
          animation: fuelGlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
