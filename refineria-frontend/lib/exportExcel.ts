interface LotRow {
  number: number;
  grossWeight: number;
  e: number;
  f: number;
  g: number;
  pct: number;
  dif: number;
}

function computeLotDetail(
  lot: { id: string; number: number; barIds: string[]; recovered?: number | null },
  bars: { id: string; grossWeight: number; analytical: number; expected: number; recovered: number }[],
) {
  const lotBars = bars.filter((b) => lot.barIds.includes(b.id));
  const grossWeight = lotBars.reduce((s, b) => s + b.grossWeight, 0);
  const e = lotBars.reduce((s, b) => s + b.analytical, 0);
  const f = lotBars.reduce((s, b) => s + b.expected, 0);
  const g = lot.recovered ?? lotBars.reduce((s, b) => s + b.recovered, 0);
  return { grossWeight, e, f, g, pct: e > 0 ? (g / e) * 100 : 0, dif: g - f };
}

export async function exportConsolidado(
  supplierName: string,
  processes: { lots: { id: string; number: number; barIds: string[]; recovered?: number | null }[]; allBars: { id: string; grossWeight: number; analytical: number; expected: number; recovered: number }[] }[],
) {
  const rows: LotRow[] = [];
  let counter = 1;

  for (const proc of processes) {
    for (const lot of proc.lots) {
      const detail = computeLotDetail(lot, proc.allBars);
      rows.push({ number: counter++, ...detail });
    }
  }

  if (rows.length === 0) return;

  const res = await fetch('/api/export/excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supplierName, rows }),
  });

  if (!res.ok) {
    throw new Error('Error al generar el Excel');
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="(.+)"/);
  const fileName = match ? match[1] : `${supplierName.replace(/[^a-zA-Z0-9]/g, '_')}_CONSOLIDADO.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
