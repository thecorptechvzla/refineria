'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ───── Mock Data ───── */

const QUIMICOS_DATA = [
  { id: '1', name: 'Ácido Clorhídrico', unit: 'Lts', initialStock: 6235, dailyConsumption: 216, minimum: 860, currentStock: 902, history: [
    { date: '28/05', v: 216 }, { date: '29/05', v: 216 }, { date: '30/05', v: 216 }, { date: '31/05', v: 216 },
    { date: '01/06', v: 216 }, { date: '02/06', v: 216 }, { date: '03/06', v: 216 }, { date: '04/06', v: 216 },
    { date: '05/06', v: 216 }, { date: '06/06', v: 216 }, { date: '07/06', v: 216 }, { date: '08/06', v: 216 },
    { date: '09/06', v: 216 }, { date: '10/06', v: 216 }, { date: '11/06', v: 216 }, { date: '12/06', v: 216 },
    { date: '13/06', v: 216 }, { date: '14/06', v: 216 }, { date: '15/06', v: 216 }, { date: '16/06', v: 216 },
    { date: '17/06', v: 216 }, { date: '18/06', v: 216 }, { date: '19/06', v: 216 }, { date: '20/06', v: 216 },
    { date: '21/06', v: 216 }, { date: '22/06', v: 216 }, { date: '23/06', v: 216 },
  ]},
  { id: '2', name: 'Ácido Nítrico', unit: 'Lts', initialStock: 3510, dailyConsumption: 120, minimum: 500, currentStock: 1018, history: [
    { date: '28/05', v: 120 }, { date: '29/05', v: 102 }, { date: '30/05', v: 102 }, { date: '31/05', v: 102 },
    { date: '01/06', v: 102 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
    { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 72 }, { date: '08/06', v: 72 },
    { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
    { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
    { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
    { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
  ]},
  { id: '3', name: 'Metabisulfito', unit: 'kg', initialStock: 1625, dailyConsumption: 75, minimum: 300, currentStock: 2553, history: [
    { date: '28/05', v: 75 }, { date: '29/05', v: 75 }, { date: '30/05', v: 74 }, { date: '31/05', v: 75 },
    { date: '01/06', v: 72 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
    { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 72 }, { date: '08/06', v: 72 },
    { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
    { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
    { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
    { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
  ]},
  { id: '4', name: 'Urea', unit: 'kg', initialStock: 5900, dailyConsumption: 72, minimum: 600, currentStock: 4028, history: [
    { date: '28/05', v: 70 }, { date: '29/05', v: 72 }, { date: '30/05', v: 72 }, { date: '31/05', v: 72 },
    { date: '01/06', v: 72 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
    { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 42 }, { date: '08/06', v: 72 },
    { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
    { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
    { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
    { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
  ]},
  { id: '5', name: 'Soda Caustica (Lts)', unit: 'Lts', initialStock: 350, dailyConsumption: 0, minimum: 120, currentStock: 350, history: [] },
  { id: '6', name: 'Soda Caustica (Kg)', unit: 'Kg', initialStock: 1800, dailyConsumption: 0, minimum: 250, currentStock: 1804, history: [] },
  { id: '7', name: 'Amoniaco', unit: 'Lts', initialStock: 1880, dailyConsumption: 60, minimum: 500, currentStock: 340, history: [
    { date: '28/05', v: 60 }, { date: '29/05', v: 60 }, { date: '30/05', v: 54 }, { date: '31/05', v: 60 },
    { date: '01/06', v: 60 }, { date: '02/06', v: 60 }, { date: '03/06', v: 60 }, { date: '04/06', v: 60 },
    { date: '05/06', v: 60 }, { date: '06/06', v: 60 }, { date: '07/06', v: 60 }, { date: '08/06', v: 60 },
    { date: '09/06', v: 60 }, { date: '10/06', v: 60 }, { date: '11/06', v: 60 }, { date: '12/06', v: 60 },
    { date: '13/06', v: 60 }, { date: '14/06', v: 60 }, { date: '15/06', v: 60 }, { date: '16/06', v: 60 },
    { date: '17/06', v: 60 }, { date: '18/06', v: 60 }, { date: '19/06', v: 60 }, { date: '20/06', v: 60 },
    { date: '21/06', v: 60 }, { date: '22/06', v: 60 }, { date: '23/06', v: 60 },
  ]},
  { id: '8', name: 'Alcohol Etilico', unit: 'Lts', initialStock: 190, dailyConsumption: 4, minimum: 40, currentStock: 80, history: [
    { date: '28/05', v: 4 }, { date: '29/05', v: 0 }, { date: '30/05', v: 4 }, { date: '31/05', v: 0 },
    { date: '01/06', v: 4 }, { date: '02/06', v: 0 }, { date: '03/06', v: 0 }, { date: '04/06', v: 20 },
    { date: '09/06', v: 8 },
  ]},
];

const GASES_DATA = [
  { id: '1', name: 'Propano', full: 1, inUse: 2, available: 1 },
  { id: '2', name: 'Oxígeno', full: 0, inUse: 1, available: 7 },
  { id: '3', name: 'Argón', full: 0, inUse: 1, available: 4 },
];

const COMBUSTIBLE_DATA = {
  initialAmount: 21449,
  currentStock: 5067,
  log: [
    { date: '01/06/26', consumption: 3000, remaining: 18449 },
    { date: '02/06/26', consumption: 473, remaining: 17976 },
    { date: '05/06/26', consumption: 2050, remaining: 15926 },
    { date: '08/06/26', consumption: 2046, remaining: 13880 },
    { date: '13/06/26', consumption: 1000, remaining: 12880 },
    { date: '15/06/26', consumption: 1000, remaining: 11880 },
    { date: '19/06/26', consumption: 3813, remaining: 8067 },
    { date: '21/06/26', consumption: 1000, remaining: 7067 },
    { date: '23/06/26', consumption: 2000, remaining: 5067 },
  ],
};

const NOVEDADES_DATA = [
  { id: '1', equipo: 'Generador del campamento', diagnostico: 'No encendía, se reemplazó el módulo EIM, queda corregida la falla. El radiador está totalmente tapado con peluza (se debe lavar externamente). La velocidad del motor no es estable, la bomba de inyección requiere servicio. Ruido irregular en el motor (será necesario desmontar la cámara para evaluar).', accion: 'Ya está en manos de Nelson desde el sábado 20/06/2026.' },
  { id: '2', equipo: 'Extractor', diagnostico: 'Persisten las rupturas de correas por falla en diseño de poleas.', accion: 'En espera de que baje equipo de Contreras para corregir falla.' },
  { id: '3', equipo: 'Horno azul grande', diagnostico: 'Presenta falla en la bobina. Al parecer no es 100% cobre — las tuberías que están vendiendo tienen aleación y eso afecta la inducción.', accion: 'Hoy terminaron de entregar la otra bobina.' },
  { id: '4', equipo: 'Casting bar', diagnostico: 'Presenta goteo interno (sudoración en las paredes). No se pudo hacer prueba por falla en el generador grande por el sensor de presión de aceite y que estaban en uso los hornos por fundición.', accion: 'Pendiente de reprogramar prueba.' },
];

/* ───── Helpers ───── */

function calcDays( stock: number, daily: number ): number | null {
  if (daily <= 0) return null;
  return stock / daily;
}

const TABS = [
  { id: 'resumen', label: 'RESUMEN', icon: LayoutDashboard },
  { id: 'quimicos', label: 'QUÍMICOS', icon: Beaker },
  { id: 'gases', label: 'GASES / COMBUSTIBLE', icon: Flame },
  { id: 'novedades', label: 'NOVEDADES', icon: ClipboardList },
];

/* ───── Page Component ───── */

export default function CriticosPage() {
  const [activeTab, setActiveTab] = useState('resumen');

  /* Químicos con días calculados */
  const quimicosConDias = useMemo(() =>
    QUIMICOS_DATA.map((q) => ({
      ...q,
      daysOfAutonomy: calcDays(q.currentStock, q.dailyConsumption),
    })),
  []);

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

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <FlaskConical className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Químicos</span>
              </div>
              <p className="text-2xl font-bold text-white hud-number">{QUIMICOS_DATA.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">insumos registrados</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Críticos</span>
              </div>
              <p className="text-2xl font-bold text-white hud-number">
                {quimicosConDias.filter((q) => q.daysOfAutonomy !== null && q.daysOfAutonomy < 5).length}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">con &lt;5 días de autonomía</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Cylinder className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Gases</span>
              </div>
              <p className="text-2xl font-bold text-white hud-number">{GASES_DATA.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">tipos registrados</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Fuel className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Combustible</span>
              </div>
              <p className="text-2xl font-bold text-white hud-number">{COMBUSTIBLE_DATA.currentStock.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">litros disponibles</p>
            </div>
          </div>

          {/* Tabla Químicos */}
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
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unidad</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Stock Inicial</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Consumo Diario</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Mínimo</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Existencia</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Días Autonomía</th>
                  </tr>
                </thead>
                <tbody>
                  {quimicosConDias.map((q) => {
                    const isCritical = q.daysOfAutonomy !== null && q.daysOfAutonomy < 5;
                    return (
                      <tr key={q.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-200">{q.name}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">{q.unit}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">{q.initialStock}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                          {q.dailyConsumption > 0 ? q.dailyConsumption : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">{q.minimum}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : 'text-gold-500'}`}>
                            {q.currentStock}
                          </span>
                          {isCritical && (
                            <AlertTriangle className="inline-block w-4 h-4 ml-2 text-red-400 blink-warning" />
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          {q.daysOfAutonomy !== null ? (
                            <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : 'text-slate-300'}`}>
                              {q.daysOfAutonomy.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla Resumen Gases + Gasoil */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="glass-panel">
              <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
                <Cylinder className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gases</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-blue-500/10">
                      <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Gas</th>
                      <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Llenas</th>
                      <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">En Uso</th>
                      <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Disponibles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GASES_DATA.map((g) => (
                      <tr key={g.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-200">{g.name}</td>
                        <td className="px-4 sm:px-5 py-3 text-center text-sm font-mono text-slate-300">{g.full}</td>
                        <td className="px-4 sm:px-5 py-3 text-center text-sm font-mono text-slate-300">{g.inUse}</td>
                        <td className="px-4 sm:px-5 py-3 text-center">
                          <span className={`text-sm font-mono font-bold ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {g.available}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-panel">
              <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Combustible</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-widest">Disponible</span>
                  <span className="text-xl font-bold text-white hud-number">
                    {COMBUSTIBLE_DATA.currentStock.toLocaleString()} <span className="text-sm text-slate-400">Lts</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-widest">Inicial</span>
                  <span className="text-sm font-mono text-slate-400">
                    {COMBUSTIBLE_DATA.initialAmount.toLocaleString()} Lts
                  </span>
                </div>
                <div className="w-full bg-midnight-800 rounded-sm h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-sm transition-all"
                    style={{ width: `${Math.min(100, (COMBUSTIBLE_DATA.currentStock / COMBUSTIBLE_DATA.initialAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {((COMBUSTIBLE_DATA.currentStock / COMBUSTIBLE_DATA.initialAmount) * 100).toFixed(0)}% del stock inicial
                </p>
              </div>
              {/* Chart placeholder */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="border border-dashed border-blue-500/20 rounded-sm h-32 flex items-center justify-center bg-midnight-800/30">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                    <TrendingDown className="w-4 h-4 inline-block mr-1" />
                    Gráfica de Consumo (próximamente)
                  </p>
                </div>
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
                    {quimicosConDias[0]?.history.map((h) => (
                      <th key={h.date} className="px-2 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h.date}</th>
                    ))}
                    <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-l border-blue-500/20">Existencia</th>
                  </tr>
                </thead>
                <tbody>
                  {quimicosConDias.filter((q) => q.history.length > 0).map((q) => (
                    <tr key={q.id} className="terminal-row">
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-200 font-medium sticky left-0 bg-midnight-900/90 backdrop-blur-sm z-10">
                        {q.name}
                      </td>
                      {q.history.map((h, i) => (
                        <td key={i} className="px-2 py-2.5 text-center font-mono text-slate-400">
                          {h.v}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-gold-500 border-l border-blue-500/20">
                        {q.currentStock}
                      </td>
                    </tr>
                  ))}
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
                  <LineChart data={quimicosConDias[0].history.map((h, i) => ({
                    date: h.date,
                    [quimicosConDias[0].name]: h.v,
                    [quimicosConDias[2].name]: quimicosConDias[2].history[i]?.v ?? 0,
                    [quimicosConDias[3].name]: quimicosConDias[3].history[i]?.v ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey={quimicosConDias[0].name} stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={quimicosConDias[2].name} stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={quimicosConDias[3].name} stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Consumo diario — Ácido Clorhídrico, Metabisulfito, Urea
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

          {/* Gases */}
          <div className="glass-panel">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
              <Cylinder className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Control de Cilindros</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Gas</th>
                    <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Llenas</th>
                    <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">En Uso</th>
                    <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Disponibles</th>
                  </tr>
                </thead>
                <tbody>
                  {GASES_DATA.map((g) => (
                    <tr key={g.id} className="terminal-row">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-200">{g.name}</td>
                      <td className="px-4 sm:px-5 py-3 text-center text-sm font-mono text-slate-300">{g.full}</td>
                      <td className="px-4 sm:px-5 py-3 text-center text-sm font-mono text-slate-300">{g.inUse}</td>
                      <td className="px-4 sm:px-5 py-3 text-center">
                        <span className={`text-sm font-mono font-bold ${g.available === 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {g.available}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <BarChart data={GASES_DATA.map((g) => ({
                    name: g.name,
                    Llenas: g.full,
                    'En Uso': g.inUse,
                    Disponibles: g.available,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
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
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cantidad Inicial</p>
                <p className="text-lg font-bold text-white hud-number">{COMBUSTIBLE_DATA.initialAmount.toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Disponible</p>
                <p className="text-lg font-bold text-amber-400 hud-number">{COMBUSTIBLE_DATA.currentStock.toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Consumido</p>
                <p className="text-lg font-bold text-red-400 hud-number">{(COMBUSTIBLE_DATA.initialAmount - COMBUSTIBLE_DATA.currentStock).toLocaleString()} <span className="text-sm text-slate-400">Lts</span></p>
              </div>
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10 bg-midnight-800/50 sticky top-0">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      <Calendar className="w-3 h-3 inline-block mr-1" />
                      Fecha
                    </th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Consumo (Lts)</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Disponible (Lts)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMBUSTIBLE_DATA.log.map((entry, i) => (
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
          <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bitácora de Incidencias</h2>
          </div>
          <div className="divide-y divide-blue-500/10">
            {NOVEDADES_DATA.map((n) => (
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

      {/* ───── Global Styles ───── */}
      <style>{`
        @keyframes blinkWarning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .blink-warning {
          animation: blinkWarning 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
