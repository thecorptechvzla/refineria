'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle, Beaker, Cylinder, Fuel, FlaskConical,
  ChevronRight, X,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
} from 'recharts';
import { useCriticos } from '@/lib/CriticosContext';
import { formatNumber } from '@/lib/utils';

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

function generateMockTrend(baseValue: number, length: number, volatility = 0.18): { v: number }[] {
  const trend: { v: number }[] = [];
  for (let i = 0; i < length; i++) {
    const ratio = length > 1 ? i / (length - 1) : 0;
    const curveFactor = Math.sin(Math.PI * ratio);
    const dip = 0.85 + 0.15 * curveFactor;
    const val = baseValue * dip;
    const jitter = val * (Math.random() - 0.5) * volatility;
    trend.push({ v: Math.round(Math.max(1, val + jitter) * 10) / 10 });
  }
  return trend;
}

/* ───── Mini KPI Card ───── */

function KpiCard({
  icon: Icon,
  label,
  value,
  valueClass,
  subtext,
  iconClass,
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
  isMounted?: boolean;
  sparklineData?: { v: number }[];
  sparklineColor?: string;
  children?: React.ReactNode;
}) {
  const grdId = `qspark-${label.replace(/\s+/g, '-')}`;
  return (
    <div className="bg-midnight-900/50 border border-white/10 backdrop-blur-md p-4 text-left relative overflow-hidden">
      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 h-16 opacity-50">
          <ResponsiveContainer width="100%" height={64}>
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={grdId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor || '#0ea5e9'} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={sparklineColor || '#0ea5e9'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparklineColor || '#0ea5e9'}
                strokeWidth={2.5}
                fill={`url(#${grdId})`}
                dot={false}
                style={{ filter: `drop-shadow(0px 0px 4px ${sparklineColor || '#0ea5e9'})` }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${iconClass ?? 'text-blue-400'}`} />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
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
        </div>
      </div>
    </div>
  );
}

/* ───── Modal Component ───── */

export function CriticosQuickView({ onClose }: { onClose: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const { quimicos, gases, combustible } = useCriticos();

  useEffect(() => { setIsMounted(true); }, []);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-xl p-4" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[85vh] flex flex-col glass-panel rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between shrink-0 bg-midnight-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Reporte de Insumos Críticos</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Almacén Padre de la Patria</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              icon={FlaskConical}
              label="DÍAS DE OPERACIÓN"
              isMounted={isMounted}
              iconClass={isMounted && minAutonomy !== null ? autonomyColor(minAutonomy).text : 'text-blue-400'}
              valueClass={isMounted && minAutonomy !== null ? autonomyColor(minAutonomy).text : 'text-white'}
              value={minAutonomy !== null ? minAutonomy.toFixed(1) : '—'}
              sparklineData={isMounted ? autonomySparkline : []}
              sparklineColor="#3B82F6"
            >
              {isMounted && minAutonomy !== null && (
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {autonomyColor(minAutonomy).label} — Limitado por: {criticalItem?.name ?? '—'}
                </p>
              )}
            </KpiCard>

            <KpiCard
              icon={AlertTriangle}
              label="Críticos"
              isMounted={isMounted}
              value={criticosBajos.length.toString()}
              subtext="con &lt;5 días de autonomía"
              sparklineData={isMounted ? criticosSparkline : []}
              sparklineColor="#EF4444"
            />

            <KpiCard
              icon={Cylinder}
              label="Gases"
              isMounted={isMounted}
              value={gases.length.toString()}
              subtext="tipos registrados"
              sparklineData={isMounted ? gasesSparkline : []}
              sparklineColor="#06B6D4"
            />

            <KpiCard
              icon={Fuel}
              label="Combustible"
              isMounted={isMounted}
              value={combustible.currentStock.toLocaleString()}
              subtext="litros disponibles"
              sparklineData={isMounted ? combustibleSparkline : []}
              sparklineColor="#F59E0B"
            />
          </div>

          {/* Estado de Químicos */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Químicos</h2>
            </div>

            <div className="overflow-x-auto">
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
                              {isMounted ? formatNumber(q.currentStock || 0) : '—'}
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
          </div>
        </div>
      </div>
    </div>
  );
}
