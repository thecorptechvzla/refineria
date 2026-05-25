'use client';

import { useGold } from '@/lib/GoldContext';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useTransactionMetrics } from '@/lib/hooks/useTransactions';
import { useWorkers } from '@/lib/hooks/useWorkers';
import { useMemo } from 'react';
import { toGrams, getSupplierName, formatDate, formatWeightShort } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, Users, Activity, Crosshair,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useGold();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: metrics } = useTransactionMetrics();
  const { data: suppliers } = useSuppliers();
  const { data: workers } = useWorkers();

  const supplierChartData = useMemo(() => {
    if (!suppliers || !transactions) return [];
    const map: Record<string, { name: string; in: number; out: number }> = {};
    suppliers.forEach((s) => {
      map[s.id] = { name: s.name.split(' ').slice(0, 2).join(' '), in: 0, out: 0 };
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
    return Object.values(map).filter((d) => d.in > 0 || d.out > 0);
  }, [suppliers, transactions]);

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

  const totalIngresos = metrics ? formatWeightShort(metrics.totalIngresos) : '0 g';
  const totalEgresos = metrics ? formatWeightShort(metrics.totalEgresos) : '0 g';
  const balance = metrics ? formatWeightShort(metrics.balance) : '0 g';

  const kpiCards = [
    { label: 'Ingresos', value: `+${totalIngresos}`, icon: TrendingUp, accent: 'gold', subtitle: '' },
    { label: 'Egresos', value: `-${totalEgresos}`, icon: TrendingDown, accent: 'blue', subtitle: '' },
    { label: 'Balance Neto', value: balance, icon: Wallet, accent: 'gold', subtitle: '' },
    { label: 'Personal', value: metrics ? `${metrics.workersActivos}/${metrics.workersTotal}` : '0/0', icon: Users, accent: 'blue', subtitle: metrics ? `${metrics.workersInactivos} inactivos` : '' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-gold-500" />
            Panel de Mando
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Resumen Ejecutivo — Tiempo Real</p>
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
              <p className="hud-number text-2xl sm:text-3xl text-white tracking-tight">{kpi.value}</p>
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
        </div>

        <div className="lg:col-span-2 glass-panel">
          <div className="p-4 sm:p-5 border-b border-blue-500/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Personal</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gold-500/5 border border-gold-500/15 p-4 text-center">
                <p className="hud-number text-3xl text-gold-500">{metrics?.workersActivos ?? 0}</p>
                <p className="text-[10px] text-gold-400/70 uppercase tracking-wider mt-1">Activos</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/15 p-4 text-center">
                <p className="hud-number text-3xl text-blue-400">{metrics?.workersInactivos ?? 0}</p>
                <p className="text-[10px] text-blue-400/70 uppercase tracking-wider mt-1">Inactivos</p>
              </div>
            </div>
            <div className="space-y-1">
              {(workers ?? []).slice(0, 5).map((w) => (
                <div key={w.id} className="terminal-row flex items-center justify-between py-2 px-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate">{w.name}</p>
                    <p className="text-[10px] text-slate-600">{w.position}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                    w.status === 'active'
                      ? 'text-gold-500 bg-gold-500/10 border border-gold-500/20'
                      : 'text-slate-500 bg-slate-500/10 border border-slate-500/20'
                  }`}>
                    {w.status === 'active' ? 'ACT' : 'INA'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="p-4 sm:p-5 border-b border-blue-500/10">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-gold-500" />
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
                    {tx.weight} {tx.weightUnit}
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
