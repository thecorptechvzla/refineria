'use client';

import { useState, Fragment } from 'react';
import { getSupplierName, formatNumber } from '@/lib/utils';
import type { Process, ProcessLot, GoldBar } from '@/types/refinery';
import { ChevronDown, ChevronUp, Crosshair, X, FileText } from 'lucide-react';

export type LotDetail = ProcessLot & {
  bars: GoldBar[];
  grossWeight: number;
  e: number;
  f: number;
  g: number;
  pct: number;
  dif: number;
  totalAg: number;
  leyAg: number;
};

export type ProcessDetail = Process & {
  lotDetails: LotDetail[];
  totalGrossWeight: number;
  totalE: number;
  totalF: number;
  totalG: number;
  totalPct: number;
  totalDif: number;
  totalAg: number;
  totalLeyAg: number;
};

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function computeLotDetail(lot: ProcessLot, allBars: GoldBar[]): LotDetail {
  const bars = allBars.filter((b) => lot.barIds.includes(b.id));
  const grossWeight = round2(bars.reduce((s, b) => s + b.grossWeight, 0));
  const e = round2(bars.reduce((s, b) => s + b.analytical, 0));
  const f = round2(bars.reduce((s, b) => s + b.expected, 0));
  const g = round2(lot.recovered ?? bars.reduce((s, b) => s + b.recovered, 0));
  const totalAg = round2(bars.reduce((s, b) => {
    if (b.analyticalAg != null) return s + b.analyticalAg;
    if (b.leyAg != null) return s + b.grossWeight * b.leyAg / 1000;
    return s;
  }, 0));
  const leyAg = grossWeight > 0 ? round2((totalAg / grossWeight) * 1000) : 0;
  return {
    ...lot,
    bars,
    grossWeight,
    e,
    f,
    g,
    pct: e > 0 ? (g / e) * 100 : 0,
    dif: g - f,
    totalAg,
    leyAg,
  };
}

export function buildProcessDetail(p: Process, allBars: GoldBar[]): ProcessDetail {
  const lotDetails = p.lots.map((l) => computeLotDetail(l, allBars));
  const totalGrossWeight = lotDetails.reduce((s, l) => s + l.grossWeight, 0);
  const totalE = lotDetails.reduce((s, l) => s + l.e, 0);
  const totalF = lotDetails.reduce((s, l) => s + l.f, 0);
  const totalG = lotDetails.reduce((s, l) => s + l.g, 0);
  const totalAg = round2(lotDetails.reduce((s, l) => s + l.totalAg, 0));
  const totalLeyAg = totalGrossWeight > 0 ? round2((totalAg / totalGrossWeight) * 1000) : 0;
  return {
    ...p,
    lotDetails,
    totalGrossWeight,
    totalE,
    totalF,
    totalG,
    totalPct: totalE > 0 ? (totalG / totalE) * 100 : 0,
    totalDif: totalG - totalF,
    totalAg,
    totalLeyAg,
  };
}

const TH = 'px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] font-semibold uppercase tracking-widest';
const TH_LEFT = `${TH.replace('text-right', 'text-left')} sticky left-0 z-20 bg-midnight-800 border-r border-blue-500/10 shadow-[2px_0_6px_-3px_rgba(0,0,0,0.6)]`;
const TD = 'px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-mono';
const TD_LEFT = `${TD.replace('text-right', 'text-left').replace('px-2 sm:px-3 py-2 sm:py-3', 'sticky left-0 z-20 bg-midnight-800 px-2 sm:px-3 py-2 sm:py-3 border-r border-blue-500/10 shadow-[2px_0_6px_-3px_rgba(0,0,0,0.6)]')}`;
const BAR_TD = 'px-2 sm:px-3 py-1 whitespace-nowrap text-right text-[11px] font-mono';
const BAR_TD_LEFT = `${BAR_TD.replace('text-right', 'text-left').replace('px-2 sm:px-3 py-1', 'sticky left-0 z-20 bg-midnight-800 px-2 sm:px-3 py-1 border-r border-blue-500/10 shadow-[2px_0_6px_-3px_rgba(0,0,0,0.6)]')}`;

export function ProcessModal({
  detail,
  suppliers,
  onClose,
  variant = 'default',
}: {
  detail: ProcessDetail;
  suppliers: { id: string; name: string }[] | undefined;
  onClose: () => void;
  variant?: 'dashboard' | 'default';
}) {
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);
  const [lotsOpen, setLotsOpen] = useState(false);

  const sortedLots = [...detail.lotDetails].sort((a, b) => a.number - b.number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between shrink-0 bg-midnight-800/95 backdrop-blur z-30">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
                Proceso #{detail.number} &mdash; {suppliers ? getSupplierName(suppliers, detail.supplierId) : '\u2014'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  CERRADO
                </span>
                <span className="text-[10px] text-slate-400">
                  {detail.lotDetails.length} lote{detail.lotDetails.length !== 1 ? 's' : ''}
                </span>
                {detail.closedAt && (
                  <span className="text-[10px] text-slate-400">
                    Cerrado el {new Date(detail.closedAt).toLocaleDateString('es-PE')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
            {/* Documentos de Validacion */}
            <div className="border border-blue-500/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Documentos de Validaci&oacute;n</h3>
              </div>
              {detail.actaRecepcion || detail.actaFundicion || detail.actaConformidad ? (
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'recepcion', label: 'Acta de Recepci\u00f3n', url: detail.actaRecepcion },
                    { type: 'fundicion', label: 'Acta de Fundici\u00f3n', url: detail.actaFundicion },
                    { type: 'conformidad', label: 'Acta de Conformidad', url: detail.actaConformidad },
                  ].map((acta) => (
                    acta.url ? (
                      <a
                        key={acta.label}
                        href={`${process.env.NEXT_PUBLIC_API_URL || '/api'}/processes/${detail.id}/actas/${acta.type}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-widest bg-blue-500/5 border border-blue-500/20 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
                      >
                        <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{acta.label}</span>
                      </a>
                    ) : null
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">No hay documentos de validaci&oacute;n asociados.</p>
              )}
            </div>

            {/* Tabla con scroll horizontal y primera columna sticky */}
            <div className="relative">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/10">
                      <th className={TH_LEFT}>Lote / Barra</th>
                      <th className={TH}><span className="hidden sm:inline">Bruto</span><span className="sm:hidden">BRU.</span></th>
                      <th className={TH}>FA</th>
                      <th className={TH}>FE</th>
                      <th className={TH}>R</th>
                      <th className={`${TH} text-blue-400`}><span className="hidden sm:inline">% Recup.</span><span className="sm:hidden">%REC</span></th>
                      <th className={`${TH} text-blue-400`}>Dif</th>
                      <th className={`${TH} whitespace-nowrap`}><span className="hidden sm:inline">Ley Ag</span><span className="sm:hidden">AG (g)</span></th>
                      <th className={TH}>Ag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant === 'dashboard' ? (
                      <>
                        <tr
                          onClick={() => setLotsOpen(!lotsOpen)}
                          className="border-t border-gold-500/20 bg-gold-500/10 cursor-pointer select-none border-b-2 border-gold-500/30"
                        >
                          <td className={`${TD_LEFT} bg-gold-500/10 font-bold text-gold-500`}>
                            <span className="inline-flex items-center gap-1.5">
                              {lotsOpen ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                              <span>Total</span>
                            </span>
                          </td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalGrossWeight)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalE, 1)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalF, 1)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalG, 1)}</td>
                          <td className={`${TD} font-bold text-gold-400`}>{formatNumber(detail.totalPct)}%</td>
                          <td className={`${TD} font-bold`} style={{ color: detail.totalDif < 0 ? '#EF4444' : '#22C55E' }}>
                            {detail.totalDif >= 0 ? '+' : ''}{formatNumber(detail.totalDif, 1)}
                          </td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalLeyAg)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalAg)}</td>
                        </tr>
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div
                              className="transition-all duration-300 ease-in-out overflow-hidden"
                              style={{ maxHeight: lotsOpen ? `${detail.lotDetails.length * 120}px` : '0' }}
                            >
                              <table className="min-w-full">
                                <thead>
                                  <tr className="border-b border-blue-500/5">
                                    <th className="sticky left-0 z-20 bg-midnight-800 px-2 sm:px-3 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-r border-blue-500/10" />
                                    <th className={TH.replace('py-2 sm:py-3', 'py-1.5')}><span className="hidden sm:inline">Bruto</span><span className="sm:hidden">BRU.</span></th>
                                    <th className={TH.replace('py-2 sm:py-3', 'py-1.5')}>FA</th>
                                    <th className={TH.replace('py-2 sm:py-3', 'py-1.5')}>FE</th>
                                    <th className={TH.replace('py-2 sm:py-3', 'py-1.5')}>R</th>
                                    <th className={`${TH.replace('py-2 sm:py-3', 'py-1.5')} text-blue-400`}><span className="hidden sm:inline">% Recup.</span><span className="sm:hidden">%REC</span></th>
                                    <th className={`${TH.replace('py-2 sm:py-3', 'py-1.5')} text-blue-400`}>Dif</th>
                                    <th className={`${TH.replace('py-2 sm:py-3', 'py-1.5')} whitespace-nowrap`}><span className="hidden sm:inline">Ley Ag</span><span className="sm:hidden">AG (g)</span></th>
                                    <th className={TH.replace('py-2 sm:py-3', 'py-1.5')}>Ag</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedLots.map((lot) => {
                                    const isExpanded = expandedLotId === lot.id;
                                    return (
                                      <Fragment key={lot.id}>
                                        <tr
                                          onClick={() => setExpandedLotId(isExpanded ? null : lot.id)}
                                          className="terminal-row cursor-pointer select-none"
                                        >
                                          <td className={`${TD_LEFT} bg-midnight-900/80 font-bold text-gold-500`}>
                                            <span className="inline-flex items-center gap-1.5">
                                              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                              <span>#{lot.number}</span>
                                            </span>
                                          </td>
                                          <td className={TD}>{formatNumber(lot.grossWeight)}</td>
                                          <td className={TD}>{formatNumber(lot.e, 1)}</td>
                                          <td className={TD}>{formatNumber(lot.f, 1)}</td>
                                          <td className={TD}>{formatNumber(lot.g, 1)}</td>
                                          <td className={`${TD} text-gold-500 font-semibold`}>{formatNumber(lot.pct)}%</td>
                                          <td className={TD} style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                                            {lot.dif >= 0 ? '+' : ''}{formatNumber(lot.dif, 1)}
                                          </td>
                                          <td className={`${TD} text-slate-400`}>{formatNumber(lot.leyAg)}</td>
                                          <td className={`${TD} text-slate-400`}>{formatNumber(lot.totalAg)}</td>
                                        </tr>
                                        {isExpanded && [...lot.bars].sort((a, b) => a.grossWeight - b.grossWeight).map((bar) => {
                                          const barPct = bar.analytical > 0 ? (bar.recovered / bar.analytical) * 100 : 0;
                                          const barDif = bar.recovered - bar.expected;
                                          const barAgG = bar.analyticalAg != null ? bar.analyticalAg : (bar.leyAg != null ? bar.grossWeight * bar.leyAg / 1000 : null);
                                          return (
                                            <tr key={bar.id} className="bg-midnight-900/40">
                                              <td className={`${BAR_TD_LEFT} bg-midnight-900/40 text-slate-400`}>
                                                <span className="truncate max-w-[80px] sm:max-w-none">{bar.code}</span>
                                              </td>
                                              <td className={BAR_TD}>{formatNumber(bar.grossWeight)}</td>
                                              <td className={BAR_TD}>{formatNumber(bar.analytical, 1)}</td>
                                              <td className={BAR_TD}>{formatNumber(bar.expected, 1)}</td>
                                              <td className={BAR_TD}>{formatNumber(bar.recovered, 1)}</td>
                                              <td className={BAR_TD}>{formatNumber(barPct)}%</td>
                                              <td className={BAR_TD} style={{ color: barDif < 0 ? '#EF444488' : '#22C55E88' }}>
                                                {barDif >= 0 ? '+' : ''}{formatNumber(barDif, 1)}
                                              </td>
                                              <td className={BAR_TD}>{bar.leyAg != null ? formatNumber(bar.leyAg) : '\u2014'}</td>
                                              <td className={BAR_TD}>{barAgG != null ? formatNumber(barAgG) : '\u2014'}</td>
                                            </tr>
                                          );
                                        })}
                                      </Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        {sortedLots.map((lot) => {
                          const isExpanded = expandedLotId === lot.id;
                          return (
                            <Fragment key={lot.id}>
                              <tr
                                onClick={() => setExpandedLotId(isExpanded ? null : lot.id)}
                                className="terminal-row cursor-pointer select-none"
                              >
                                <td className={`${TD_LEFT} bg-midnight-900/80 font-bold text-gold-500`}>
                                  <span className="inline-flex items-center gap-1.5">
                                    <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                    <span>#{lot.number}</span>
                                  </span>
                                </td>
                                <td className={TD}>{formatNumber(lot.grossWeight)}</td>
                                <td className={TD}>{formatNumber(lot.e, 1)}</td>
                                <td className={TD}>{formatNumber(lot.f, 1)}</td>
                                <td className={TD}>{formatNumber(lot.g, 1)}</td>
                                <td className={`${TD} text-gold-500 font-semibold`}>{formatNumber(lot.pct)}%</td>
                                <td className={TD} style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                                  {lot.dif >= 0 ? '+' : ''}{formatNumber(lot.dif, 1)}
                                </td>
                                <td className={`${TD} text-slate-400`}>{formatNumber(lot.leyAg)}</td>
                                <td className={`${TD} text-slate-400`}>{formatNumber(lot.totalAg)}</td>
                              </tr>
                              {isExpanded && [...lot.bars].sort((a, b) => a.grossWeight - b.grossWeight).map((bar) => {
                                const barPct = bar.analytical > 0 ? (bar.recovered / bar.analytical) * 100 : 0;
                                const barDif = bar.recovered - bar.expected;
                                const barAgG = bar.analyticalAg != null ? bar.analyticalAg : (bar.leyAg != null ? bar.grossWeight * bar.leyAg / 1000 : null);
                                return (
                                  <tr key={bar.id} className="bg-midnight-900/40">
                                    <td className={`${BAR_TD_LEFT} bg-midnight-900/40 text-slate-400`}>
                                      <span className="truncate max-w-[80px] sm:max-w-none">{bar.code}</span>
                                    </td>
                                    <td className={BAR_TD}>{formatNumber(bar.grossWeight)}</td>
                                    <td className={BAR_TD}>{formatNumber(bar.analytical, 1)}</td>
                                    <td className={BAR_TD}>{formatNumber(bar.expected, 1)}</td>
                                    <td className={BAR_TD}>{formatNumber(bar.recovered, 1)}</td>
                                    <td className={BAR_TD}>{formatNumber(barPct)}%</td>
                                    <td className={BAR_TD} style={{ color: barDif < 0 ? '#EF444488' : '#22C55E88' }}>
                                      {barDif >= 0 ? '+' : ''}{formatNumber(barDif, 1)}
                                    </td>
                                    <td className={BAR_TD}>{bar.leyAg != null ? formatNumber(bar.leyAg) : '\u2014'}</td>
                                    <td className={BAR_TD}>{barAgG != null ? formatNumber(barAgG) : '\u2014'}</td>
                                  </tr>
                                );
                              })}
                            </Fragment>
                          );
                        })}
                        <tr className="border-t border-gold-500/20 bg-gold-500/5 border-b-2 border-gold-500/30">
                          <td className={`${TD_LEFT} bg-gold-500/5 font-bold text-gold-500`}>Total</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalGrossWeight)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalE, 1)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalF, 1)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalG, 1)}</td>
                          <td className={`${TD} font-bold text-gold-400`}>{formatNumber(detail.totalPct)}%</td>
                          <td className={`${TD} font-bold`} style={{ color: detail.totalDif < 0 ? '#EF4444' : '#22C55E' }}>
                            {detail.totalDif >= 0 ? '+' : ''}{formatNumber(detail.totalDif, 1)}
                          </td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalLeyAg)}</td>
                          <td className={`${TD} font-bold text-slate-100`}>{formatNumber(detail.totalAg)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-midnight-900/70 to-transparent z-10" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-30 p-4 sm:p-5 border-t border-blue-500/10 bg-midnight-800/80 backdrop-blur flex sm:justify-end shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-3 sm:py-2 bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
