'use client';

import { useState, FormEvent, useEffect, useMemo, Fragment } from 'react';
import { useProcess } from '@/lib/ProcessContext';
import { useCreateTransaction } from '@/lib/hooks/useTransactions';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useDeleteGoldBar, useBulkUpload } from '@/lib/hooks/useGoldBars';
import { parseLocaleNumber, formatLocaleNumber, formatInputNumber } from '@/lib/utils';
import { ClipboardList, CheckCircle, Package, Weight, Ruler, Crosshair, FlaskConical, Trash2, Upload, ChevronDown, Download, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import ShakeAlert from '@/components/ShakeAlert';

export default function IngresoPage() {
  const { data: suppliers } = useSuppliers();
  const { goldBars, addBar } = useProcess();
  const createTx = useCreateTransaction();

  const [supplierId, setSupplierId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [pesoBruto, setPesoBruto] = useState('');
  const [ley, setLey] = useState('');
  const [analitico, setAnalitico] = useState('');
  const [esperado, setEsperado] = useState('');
  const [leyAg, setLeyAg] = useState('');
  const [analiticoAg, setAnaliticoAg] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const [showBulk, setShowBulk] = useState(false);
  const [bulkSupplierId, setBulkSupplierId] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkError, setBulkError] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [supplierBarPages, setSupplierBarPages] = useState<Record<string, number>>({});
  const bulkUpload = useBulkUpload();
  const [currentPage, setCurrentPage] = useState(1);

  const parseNum = (v: string) => parseLocaleNumber(v);
  const pBruto = parseNum(pesoBruto);
  const pLey = parseNum(ley);
  const pLeyAg = parseNum(leyAg);
  const pesoExceeds = pBruto > 24900;
  const leyRestriction = pLey > 0 && pLey < 850 && pBruto > 1000;

  // const canSubmit = supplierId && codigo.trim().length >= 2 && pBruto > 0 && pLey > 0;

  useEffect(() => {
    if (pBruto > 0 && pLey > 0) {
      const e = Math.round(pBruto * pLey / 1000 * 100) / 100;
      const f = e * 0.99;
      setAnalitico(formatLocaleNumber(e));
      setEsperado(formatLocaleNumber(f));
    } else {
      setAnalitico('');
      setEsperado('');
    }
    if (pBruto > 0 && pLeyAg > 0) {
      setAnaliticoAg(formatLocaleNumber(pBruto * pLeyAg / 1000));
    } else {
      setAnaliticoAg('');
    }
  }, [pBruto, pLey, pLeyAg]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!canSubmit) return;

    const rawE = pBruto * pLey / 1000;
    const rawF = rawE * 0.99;
    const rawAg = pLeyAg > 0 ? pBruto * pLeyAg / 1000 : undefined;

    try {
      await addBar({
        code: codigo.trim(),
        supplierId,
        grossWeight: pBruto,
        ley: pLey,
        analytical: rawE,
        expected: rawF,
        recovered: 0,
        leyAg: pLeyAg > 0 ? pLeyAg : undefined,
        analyticalAg: rawAg,
      });

      await createTx.mutateAsync({
        type: 'IN',
        weight: pBruto,
        weightUnit: 'g',
        purity: rawE / pBruto,
        supplierId,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al registrar';
      setErrorMessage(msg);
      setShakeKey((k) => k + 1);
      return;
    }

    setSuccessMessage(`Barra ${codigo.trim()} registrada correctamente`);
    setCodigo('');
    setPesoBruto('');
    setLey('');
    setAnalitico('');
    setEsperado('');
    setLeyAg('');
    setAnaliticoAg('');
    setSupplierId('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const deleteGoldBar = useDeleteGoldBar();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteBar = async (barId: string) => {
    try {
      await deleteGoldBar.mutateAsync(barId);
      setConfirmDeleteId(null);
    } catch {
      setErrorMessage('Error al eliminar la barra');
      setShakeKey((k) => k + 1);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkSupplierId || !bulkFile) return;

    if (bulkFile.size > 10 * 1024 * 1024) {
      setBulkError('El archivo excede el tamaño máximo de 10 MB. Compresiónalo o seleccione uno más pequeño.');
      setErrorMessage('El archivo excede el tamaño máximo de 10 MB. Compresiónalo o seleccione uno más pequeño.');
      setShakeKey((k) => k + 1);
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkFile);
    formData.append('supplierId', bulkSupplierId);

    try {
      const result = await bulkUpload.mutateAsync(formData);
      const msg = result.errors.length > 0
        ? `Se insertaron ${result.created} barras. ${result.errors.length} fila(s) con errores de formato.`
        : `Se insertaron ${result.created} barras correctamente.`;
      setSuccessMessage(msg);
      setBulkFile(null);
      setBulkSupplierId('');
      setShowBulk(false);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : 'Error al procesar la carga masiva';
      if (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 413) {
        msg = 'El archivo excede el tamaño máximo de 10 MB. Compresiónalo o seleccione uno más pequeño.';
      }
      setBulkError(msg);
      setErrorMessage(msg);
      setShakeKey((k) => k + 1);
    }
  };

  const downloadTemplate = async () => {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Barras');

    sheet.columns = [
      { header: 'CÓDIGO', width: 14, numFmt: '@' },
      { header: 'PESO BRUTO (g)', width: 18 },
      { header: 'LEY Au (‰)', width: 14 },
      { header: 'PESO FINO Au (g)', width: 20 },
      { header: 'LOTE N°', width: 12 },
      { header: 'LEY Ag (‰)', width: 14 },
      { header: 'PESO FINO Ag (g)', width: 20 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8860B' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const TOTAL = 500;
    sheet.addRow(['BAR-001', 1000, 900, { formula: 'B2*C2/1000' }, 'L-405', null, { formula: 'B2*F2/1000' }]);
    for (let r = 3; r <= TOTAL; r++) {
      sheet.addRow([null, null, null, { formula: `B${r}*C${r}/1000` }, null, null, { formula: `B${r}*F${r}/1000` }]);
    }
    [2, 3, 4, 5].forEach((r) => {
      const cell = sheet.getRow(r).getCell(4);
      cell.font = { italic: true, color: { argb: 'FF666666' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      const cellAg = sheet.getRow(r).getCell(7);
      cellAg.font = { italic: true, color: { argb: 'FF666666' } };
      cellAg.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    for (let r = 2; r <= TOTAL; r++) {
      const cell = sheet.getRow(r).getCell(1);
      cell.dataValidation = {
        type: 'custom',
        formulae: [`=COUNTIF($A$2:$A$${TOTAL},$A${r})=1`],
        showErrorMessage: true,
        errorTitle: 'Código duplicado',
        error: 'Este código ya existe en la columna. Corrige antes de guardar.',
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_barras.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SUPPLIERS_PER_PAGE = 10;
  const BARS_PER_PAGE = 10;

  const supplierData = useMemo(() => {
    const latestDate = new Map<string, number>();
    const grouped = new Map<string, typeof goldBars>();
    const q = searchCode.toLowerCase();

    for (const bar of goldBars) {
      if (!grouped.has(bar.supplierId)) {
        grouped.set(bar.supplierId, []);
      }
      grouped.get(bar.supplierId)!.push(bar);
      const d = new Date(bar.registrationDate).getTime();
      const prev = latestDate.get(bar.supplierId) ?? 0;
      if (d > prev) latestDate.set(bar.supplierId, d);
    }

    for (const [, bars] of grouped) {
      bars.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    }

    const filtered = (suppliers ?? [])
      .filter((s) => {
        if (!latestDate.has(s.id)) return false;
        if (!q) return true;
        return grouped.get(s.id)?.some((b) => b.code.toLowerCase().includes(q)) ?? false;
      })
      .sort((a, b) => (latestDate.get(b.id) ?? 0) - (latestDate.get(a.id) ?? 0));

    return { filtered, grouped };
  }, [goldBars, suppliers, searchCode]);

  const { filtered: visibleSuppliers, grouped: barsBySupplier } = supplierData;
  const supplierTotalPages = Math.max(1, Math.ceil(visibleSuppliers.length / SUPPLIERS_PER_PAGE));
  const safeSupplierPage = Math.min(currentPage, supplierTotalPages);
  const paginatedSuppliers = visibleSuppliers.slice(
    (safeSupplierPage - 1) * SUPPLIERS_PER_PAGE,
    safeSupplierPage * SUPPLIERS_PER_PAGE
  );

  const grandTotal = useMemo(() => {
    const ids = new Set(visibleSuppliers.map((s) => s.id));
    const visible = goldBars.filter((b) => ids.has(b.supplierId));
    return {
      grossWeight: visible.reduce((s, b) => s + b.grossWeight, 0),
      analytical: visible.reduce((s, b) => s + b.analytical, 0),
      expected: visible.reduce((s, b) => s + b.expected, 0),
      recovered: visible.reduce((s, b) => s + b.recovered, 0),
    };
  }, [goldBars, visibleSuppliers]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gold-500" />
            Ingreso de Material
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Registro de Barras de Oro — Bóveda</p>
        </div>
      </div>

      {errorMessage && (
        <ShakeAlert message={errorMessage} shakeKey={shakeKey} type="error" />
      )}
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/90">
          <div className="bg-midnight-800 border border-gold-500/30 w-full max-w-lg mx-4">
            <div className="p-4 border-b border-gold-500/10 flex items-center justify-between">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Carga exitosa</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-gold-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-gold-400">{successMessage}</p>
              </div>
              <p className="text-[10px] text-gold-500/60 uppercase tracking-wider">Barras registradas en bóveda</p>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button
                onClick={() => setSuccessMessage('')}
                className="py-2 px-4 bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest hover:bg-gold-500/30 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nueva Barra</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Package className="w-3 h-3 inline mr-1" />
                  Proveedor / Empresa
                </label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
                >
                  <option value="" disabled>Seleccionar proveedor...</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id} className="bg-midnight-800">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  Código de Barra
                </label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. BAR-011"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Weight className="w-3 h-3 inline mr-1" />
                  Peso Bruto (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={pesoBruto}
                  onChange={(e) => setPesoBruto(formatInputNumber(e.target.value))}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 3.500,00"
                />
                {pesoExceeds && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 mt-1.5">
                    <p className="text-xs text-yellow-400">El peso bruto excede los 24.900 g</p>
                  </div>
                )}
                {leyRestriction && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 mt-1.5">
                    <p className="text-xs text-yellow-400">Las barras con ley menor a 850 no pueden pesar más de 1.000 g</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <FlaskConical className="w-3 h-3 inline mr-1" />
                  LEY Au (‰)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={ley}
                  onChange={(e) => setLey(formatInputNumber(e.target.value))}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 913,90"
                />
                {pBruto > 0 && pLey > 0 && (
                  <p className="text-[10px] text-gold-500/70 mt-1 font-mono">
                    FA = {formatLocaleNumber(pBruto)} × {formatLocaleNumber(pLey)} ÷ 1000 = <span className="text-gold-400">{formatLocaleNumber(pBruto * pLey / 1000)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <FlaskConical className="w-3 h-3 inline mr-1" />
                  LEY Ag (‰)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={leyAg}
                  onChange={(e) => setLeyAg(formatInputNumber(e.target.value))}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. 58,10"
                />
                {pBruto > 0 && pLeyAg > 0 && (
                  <p className="text-[10px] text-slate-500/70 mt-1 font-mono">
                    Ag = {formatLocaleNumber(pBruto)} × {formatLocaleNumber(pLeyAg)} ÷ 1000 = <span className="text-slate-300">{formatLocaleNumber(pBruto * pLeyAg / 1000)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  FA — Fino Analítico (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  readOnly
                  value={analitico}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all opacity-70 cursor-not-allowed"
                  placeholder="Se calcula automáticamente"
                  tabIndex={-1}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  FE — Fino Esperado (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  readOnly
                  value={esperado}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all opacity-70 cursor-not-allowed"
                  placeholder="Se calcula automáticamente"
                  tabIndex={-1}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Ruler className="w-3 h-3 inline mr-1" />
                  Peso Fino Ag (g)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  readOnly
                  value={analiticoAg}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all opacity-70 cursor-not-allowed"
                  placeholder="Se calcula automáticamente"
                  tabIndex={-1}
                />
              </div>

              <button
                type="submit"
                // disabled={!canSubmit}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Registrar Barra
                </span>
              </button>
            </form>
          </div>

          { /* ─── Carga Masiva ─── */ }
          <div className="glass-panel">
            <button
              onClick={() => setShowBulk(!showBulk)}
              className="w-full p-4 flex items-center justify-between border-b border-blue-500/10"
            >
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                <Upload className="w-4 h-4 inline mr-2" />
                Carga Masiva
              </h2>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showBulk ? 'rotate-180' : ''}`} />
            </button>

            {showBulk && (
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    <Package className="w-3 h-3 inline mr-1" />
                    Proveedor
                  </label>
                  <select
                    value={bulkSupplierId}
                    onChange={(e) => setBulkSupplierId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {suppliers?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    <Upload className="w-3 h-3 inline mr-1" />
                    Archivo Excel
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-gold-500 file:text-midnight-900 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Peso máximo: 10 MB</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleBulkUpload}
                    disabled={!bulkSupplierId || !bulkFile || bulkUpload.isPending}
                    className="flex-1 py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {bulkUpload.isPending ? 'Subiendo...' : 'Subir Archivo'}
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="py-2.5 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Plantilla
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                    El archivo debe tener las columnas: <span className="text-slate-300 font-mono">CÓDIGO, PESO BRUTO (g), LEY Au (‰), PESO FINO Au (g), LOTE N°</span>.
                  Descarga la plantilla para ver el formato exacto.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Barras Registradas</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => { setSearchCode(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por código..."
                  className="w-36 px-2 py-1.5 bg-midnight-800 border border-blue-500/20 text-slate-400 text-[10px] placeholder-slate-600 outline-none transition-all focus:border-blue-500/40"
                />
                <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                  {String(visibleSuppliers.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {paginatedSuppliers.length > 0 ? (
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {paginatedSuppliers.map((s) => {
                  const supplierBars = barsBySupplier.get(s.id) ?? [];
                  const barPage = supplierBarPages[s.id] ?? 1;
                  const barTotalPages = Math.max(1, Math.ceil(supplierBars.length / BARS_PER_PAGE));
                  const safeBarPage = Math.min(barPage, barTotalPages);
                  const paginatedBars = supplierBars.slice(
                    (safeBarPage - 1) * BARS_PER_PAGE,
                    safeBarPage * BARS_PER_PAGE
                  );
                  const supplierTotals = {
                    grossWeight: supplierBars.reduce((s, b) => s + b.grossWeight, 0),
                    analytical: supplierBars.reduce((s, b) => s + b.analytical, 0),
                    expected: supplierBars.reduce((s, b) => s + b.expected, 0),
                    recovered: supplierBars.reduce((s, b) => s + b.recovered, 0),
                  };

                  return (
                    <Fragment key={s.id}>
                      <div className="px-4 sm:px-5 pt-4 sm:pt-5 first:pt-0">
                        <div
                          className="glass-panel cursor-pointer active:scale-[0.98] transition-all hover:bg-blue-500/[0.04]"
                          onClick={() => setExpandedSupplierId((prev) => prev === s.id ? null : s.id)}
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{s.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">RIF: {s.rif}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                                {supplierBars.length} BARRAS
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedSupplierId === s.id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                      {expandedSupplierId === s.id && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                          <div className="overflow-x-auto border border-blue-500/10">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-blue-500/10 bg-midnight-900/50">
                                  <th className="sticky left-0 z-10 bg-midnight-900/50 px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Código</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Ley Au (‰)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">FA (g)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">FE (g)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">R (g)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Ley Ag (‰)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Ag (g)</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                                  <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-widest"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedBars.map((bar, idx) => (
                                  <tr key={bar.id} className={`${idx % 2 === 0 ? 'bg-midnight-900/30' : 'bg-midnight-800/20'} hover:bg-blue-500/[0.04] transition-colors`}>
                                    <td className="sticky left-0 z-10 px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200 border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]"
                                        style={{ backgroundColor: 'inherit' }}>
                                      {bar.code}
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{formatLocaleNumber(bar.grossWeight)}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{bar.ley != null ? formatLocaleNumber(bar.ley) : '—'}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{formatLocaleNumber(bar.analytical)}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{formatLocaleNumber(bar.expected)}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{formatLocaleNumber(bar.recovered)}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{bar.leyAg != null ? formatLocaleNumber(bar.leyAg) : '—'}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-mono text-slate-200">{bar.analyticalAg != null ? formatLocaleNumber(bar.analyticalAg) : '—'}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                                        bar.available
                                          ? 'text-gold-500 bg-gold-500/10 border border-gold-500/20'
                                          : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                                      }`}>
                                        {bar.available ? 'DISPONIBLE' : 'EN LOTE'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-right">
                                      {confirmDeleteId === bar.id ? (
                                        <div className="flex items-center gap-1 justify-end">
                                          <button
                                            onClick={() => handleDeleteBar(bar.id)}
                                            className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                                          >
                                            Confirmar
                                          </button>
                                          <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] uppercase tracking-wider hover:bg-slate-700 transition-all"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setConfirmDeleteId(bar.id)}
                                          className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                          title="Eliminar barra"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              {supplierBars.length > 0 && (
                                <tfoot>
                                  <tr className="border-t border-blue-500/10 bg-midnight-800/50">
                                    <td className="sticky left-0 z-10 bg-midnight-800/50 px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-r border-blue-500/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Total {s.name}</td>
                                    <td className="px-3 py-2 text-xs font-mono text-slate-200">{formatLocaleNumber(supplierTotals.grossWeight)}</td>
                                    <td className="px-3 py-2"></td>
                                    <td className="px-3 py-2 text-xs font-mono text-slate-200">{formatLocaleNumber(supplierTotals.analytical)}</td>
                                    <td className="px-3 py-2 text-xs font-mono text-slate-200">{formatLocaleNumber(supplierTotals.expected)}</td>
                                    <td className="px-3 py-2 text-xs font-mono text-slate-200">{formatLocaleNumber(supplierTotals.recovered)}</td>
                                    <td colSpan={4}></td>
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </div>
                          {barTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <span className="text-[9px] font-mono text-slate-500">
                                Página {safeBarPage} de {barTotalPages}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setSupplierBarPages((prev) => ({ ...prev, [s.id]: safeBarPage - 1 }))}
                                  disabled={safeBarPage <= 1}
                                  className="p-1 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setSupplierBarPages((prev) => ({ ...prev, [s.id]: safeBarPage + 1 }))}
                                  disabled={safeBarPage >= barTotalPages}
                                  className="p-1 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-500">No hay barras registradas.</p>
              </div>
            )}

            {visibleSuppliers.length > 0 && (
              <div className="border-t border-blue-500/10">
                <div className="px-4 sm:px-5 py-3 flex items-center justify-between bg-midnight-800/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GRAN TOTAL</span>
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-mono text-slate-200">
                      Bruto: <span className="text-gold-400">{formatLocaleNumber(grandTotal.grossWeight)} g</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-200">
                      FA: <span className="text-gold-400">{formatLocaleNumber(grandTotal.analytical)} g</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-200">
                      FE: <span className="text-gold-400">{formatLocaleNumber(grandTotal.expected)} g</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-200">
                      R: <span className="text-gold-400">{formatLocaleNumber(grandTotal.recovered)} g</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {supplierTotalPages > 1 && (
              <div className="px-4 sm:px-5 py-3 border-t border-blue-500/10 flex items-center justify-center gap-4">
                <span className="text-[10px] font-mono text-slate-500">
                  Página {safeSupplierPage} de {supplierTotalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeSupplierPage <= 1}
                    className="p-1.5 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(supplierTotalPages, p + 1))}
                    disabled={safeSupplierPage >= supplierTotalPages}
                    className="p-1.5 text-slate-500 hover:text-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {bulkError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/90">
          <div className="bg-midnight-800 border border-red-500/30 w-full max-w-lg mx-4">
            <div className="p-4 border-b border-red-500/10 flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Error de carga masiva</span>
              <button
                onClick={() => setBulkError('')}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-red-400 font-mono leading-relaxed whitespace-pre-wrap">{bulkError}</p>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button
                onClick={() => setBulkError('')}
                className="py-2 px-4 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
