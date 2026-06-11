import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

interface LotRow {
  number: number;
  grossWeight: number;
  e: number;
  f: number;
  g: number;
  pct: number;
  dif: number;
}

function thinBorder() {
  return {
    top: { style: 'thin' as const },
    left: { style: 'thin' as const },
    bottom: { style: 'thin' as const },
    right: { style: 'thin' as const },
  };
}

export async function POST(req: NextRequest) {
  const { supplierName, rows }: { supplierName: string; rows: LotRow[] } = await req.json();

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: 'No data' }, { status: 400 });
  }

  const totalGrossWeight = rows.reduce((s, r) => s + r.grossWeight, 0);
  const totalE = rows.reduce((s, r) => s + r.e, 0);
  const totalF = rows.reduce((s, r) => s + r.f, 0);
  const totalG = rows.reduce((s, r) => s + r.g, 0);
  const totalPct = totalE > 0 ? (totalG / totalE) * 100 : 0;
  const totalDif = totalG - totalF;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('CONSOLIDADO');

  ws.columns = [
    { key: 'a', width: 2 },
    { key: 'b', width: 2 },
    { key: 'lote', width: 10 },
    { key: 'bruto', width: 18 },
    { key: 'analit', width: 20 },
    { key: 'esperado', width: 20 },
    { key: 'recup', width: 20 },
    { key: 'pct', width: 16 },
    { key: 'dif', width: 14 },
  ];

  const HEADER_ROW = 5;
  const DATA_START = HEADER_ROW + 1;
  const TOTAL_ROW = DATA_START + rows.length;

  for (let i = 1; i <= 3; i++) {
    ws.getRow(i).height = 8;
  }

  const supplierRow = ws.getRow(4);
  supplierRow.getCell(3).value = supplierName;
  supplierRow.getCell(3).font = { bold: true };
  supplierRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.mergeCells(4, 3, 4, 9);
  supplierRow.height = 24;

  const headerCells = [
    { col: 3, val: 'LOTE N°' },
    { col: 4, val: 'PESO \nBRUTO (g)' },
    { col: 5, val: 'PESO FINO \nANALÍTICO (g)' },
    { col: 6, val: 'PESO FINO\n ESPERADO (g) ' },
    { col: 7, val: 'PESO FINO\nRECUPERADO (g)' },
    { col: 8, val: '% \nRECUPERACIÓN' },
    { col: 9, val: 'DIFERENCIA' },
  ];

  const hRow = ws.getRow(HEADER_ROW);
  hRow.height = 40;

  for (const h of headerCells) {
    const cell = hRow.getCell(h.col);
    cell.value = h.val;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder();
  }

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const row = ws.getRow(DATA_START + i);
    row.height = 20;

    const lotCell = row.getCell(3);
    lotCell.value = r.number;
    lotCell.font = { bold: true };
    lotCell.border = thinBorder();
    lotCell.alignment = { horizontal: 'center', vertical: 'middle' };
    lotCell.numFmt = '0';

    const dataCols = [
      { col: 4, val: r.grossWeight },
      { col: 5, val: r.e },
      { col: 6, val: r.f },
      { col: 7, val: r.g },
      { col: 8, val: r.pct },
      { col: 9, val: r.dif },
    ];

    for (const d of dataCols) {
      const cell = row.getCell(d.col);
      cell.value = d.val;
      cell.numFmt = '#,##0.00';
      cell.border = thinBorder();
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    const analitCell = row.getCell(5);
    analitCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' },
    };
  }

  const totalRow = ws.getRow(TOTAL_ROW);
  totalRow.height = 20;

  const totalLotCell = totalRow.getCell(3);
  totalLotCell.border = thinBorder();

  const totalDataCols = [
    { col: 4, val: totalGrossWeight },
    { col: 5, val: totalE },
    { col: 6, val: totalF },
    { col: 7, val: totalG },
    { col: 8, val: totalPct },
    { col: 9, val: totalDif },
  ];

  for (const d of totalDataCols) {
    const cell = totalRow.getCell(d.col);
    cell.value = d.val;
    cell.numFmt = '#,##0.00';
    cell.font = { bold: true };
    cell.border = thinBorder();
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  const totalAnalitCell = totalRow.getCell(5);
  totalAnalitCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2EFDA' },
  };

  const buf = await wb.xlsx.writeBuffer();

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${supplierName.replace(/[^a-zA-Z0-9]/g, '_')}_CONSOLIDADO_${dateStr}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
