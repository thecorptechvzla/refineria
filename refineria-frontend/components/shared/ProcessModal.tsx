'use client';

import { useState, Fragment } from 'react';
import { getSupplierName, formatLocaleNumber } from '@/lib/utils';
import type { Process, ProcessLot, GoldBar } from '@/types/refinery';
import { ChevronDown, Crosshair, X, FileText } from 'lucide-react';

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

function computeLotDetail(lot: ProcessLot, allBars: GoldBar[]): LotDetail {
  const bars = allBars.filter((b) => lot.barIds.includes(b.id));
  const grossWeight = Number(bars.reduce((s, b) => s + b.grossWeight, 0).toFixed(2));
  const e = Number(bars.reduce((s, b) => s + b.analytical, 0).toFixed(2));
  const f = Number(bars.reduce((s, b) => s + b.expected, 0).toFixed(2));
  const g = Number((lot.recovered ?? bars.reduce((s, b) => s + b.recovered, 0)).toFixed(2));
  const totalAg = Number(bars.reduce((s, b) => {
    if (b.analyticalAg != null) return s + b.analyticalAg;
    if (b.leyAg != null) return s + b.grossWeight * b.leyAg / 1000;
    return s;
  }, 0).toFixed(2));
  const leyAg = grossWeight > 0 ? Number(((totalAg / grossWeight) * 1000).toFixed(2)) : 0;
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
  const totalAg = Number(lotDetails.reduce((s, l) => s + l.totalAg, 0).toFixed(2));
  const totalLeyAg = totalGrossWeight > 0 ? Number(((totalAg / totalGrossWeight) * 1000).toFixed(2)) : 0;
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

export function ProcessModal({
  detail,
  suppliers,
  onClose,
}: {
  detail: ProcessDetail;
  suppliers: { id: string; name: string }[] | undefined;
  onClose: () => void;
}) {
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-blue-500/10 flex items-center justify-between sticky top-0 bg-midnight-800/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Proceso #{detail.number} — {suppliers ? getSupplierName(suppliers, detail.supplierId) : '—'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  CERRADO
                </span>
                <span className="text-[10px] text-slate-500">
                  {detail.lotDetails.length} lote{detail.lotDetails.length !== 1 ? 's' : ''}
                </span>
                {detail.closedAt && (
                  <span className="text-[10px] text-slate-600">
                    Cerrado el {new Date(detail.closedAt).toLocaleDateString('es-PE')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Documentos de Validación — moved to top */}
          <div className="border border-blue-500/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Documentos de Validaci&oacute;n</h3>
            </div>
            {detail.actaRecepcion || detail.actaFundicion || detail.actaConformidad ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'recepcion', label: 'Acta de Recepci&oacute;n', url: detail.actaRecepcion },
                  { type: 'fundicion', label: 'Acta de Fundici&oacute;n', url: detail.actaFundicion },
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

          {/* Tabla colapsable de Lotes / Barras */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lote / Barra</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">F (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">G (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">% Recup.</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Dif (g)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">LEY Ag (‰)</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ag (g)</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {[...detail.lotDetails].sort((a, b) => a.number - b.number).map((lot) => {
                  const isExpanded = expandedLotId === lot.id;
                  return (
                    <Fragment key={lot.id}>
                      <tr
                        onClick={() => setExpandedLotId(isExpanded ? null : lot.id)}
                        className="terminal-row cursor-pointer select-none"
                      >
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-mono font-bold text-gold-500">
                          <span className="inline-flex items-center gap-1.5">
                            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                            <span>#{lot.number}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.grossWeight.toFixed(2)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.e.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.f.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-200">{lot.g.toFixed(1)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-gold-500 font-semibold">{lot.pct.toFixed(2)}%</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono" style={{ color: lot.dif < 0 ? '#EF4444' : '#22C55E' }}>
                          {lot.dif >= 0 ? '+' : ''}{lot.dif.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-400">{lot.leyAg.toFixed(2)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-400">{lot.totalAg.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className="text-[10px] text-slate-500 font-mono">{lot.bars.length} barra{lot.bars.length !== 1 ? 's' : ''}</span>
                        </td>
                      </tr>
                      {isExpanded && [...lot.bars].sort((a, b) => a.grossWeight - b.grossWeight).map((bar) => {
                        const barPct = bar.analytical > 0 ? (bar.recovered / bar.analytical) * 100 : 0;
                        const barDif = bar.recovered - bar.expected;
                        const barAgG = bar.analyticalAg != null ? bar.analyticalAg : (bar.leyAg != null ? bar.grossWeight * bar.leyAg / 1000 : null);
                        return (
                          <tr key={bar.id} className="bg-midnight-900/40 border-b border-blue-500/5">
                            <td className="px-3 py-2 whitespace-nowrap text-[11px] font-mono text-slate-500">
                              <span className="inline-flex items-center gap-1.5 pl-6">
                                <span className="w-1 h-1 rounded-full bg-slate-600 inline-block shrink-0" />
                                <span>{bar.code}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{bar.grossWeight.toFixed(2)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{bar.analytical.toFixed(1)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{bar.expected.toFixed(1)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{bar.recovered.toFixed(1)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{barPct.toFixed(2)}%</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono" style={{ color: barDif < 0 ? '#EF444488' : '#22C55E88' }}>
                              {barDif >= 0 ? '+' : ''}{barDif.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{bar.leyAg != null ? bar.leyAg.toFixed(2) : '—'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-[11px] font-mono text-slate-500">{barAgG != null ? barAgG.toFixed(2) : '—'}</td>
                            <td />
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
                <tr className="border-t border-gold-500/20 bg-gold-500/5">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gold-500">Total</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalGrossWeight.toFixed(2)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalE.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalF.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalG.toFixed(1)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-gold-400">{detail.totalPct.toFixed(2)}%</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold" style={{ color: detail.totalDif < 0 ? '#EF4444' : '#22C55E' }}>
                    {detail.totalDif >= 0 ? '+' : ''}{detail.totalDif.toFixed(1)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalLeyAg.toFixed(2)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-100">{detail.totalAg.toFixed(2)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 border-t border-blue-500/10 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
