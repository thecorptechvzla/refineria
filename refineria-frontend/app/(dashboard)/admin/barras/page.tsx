'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useGoldBars, useUpdateGoldBar, useDeleteGoldBar, useBulkDeleteGoldBars } from '@/lib/hooks/useGoldBars';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName, formatLocaleNumber, parseLocaleNumber } from '@/lib/utils';
import { Package, CheckCircle, AlertCircle, Trash2, Edit3, X, Crosshair, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function AdminBarrasPage() {
  const { data: goldBars } = useGoldBars();
  const { data: suppliers } = useSuppliers();
  const updateGoldBar = useUpdateGoldBar();
  const deleteGoldBar = useDeleteGoldBar();
  const bulkDeleteGoldBars = useBulkDeleteGoldBars();

  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [ley, setLey] = useState('');
  const [leyAg, setLeyAg] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteBatchConfirm, setDeleteBatchConfirm] = useState(false);
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const pageCount = useMemo(() => {
    if (!goldBars) return 0;
    return Math.ceil(goldBars.length / ITEMS_PER_PAGE);
  }, [goldBars]);

  const paginatedBars = useMemo(() => {
    if (!goldBars) return [];
    return goldBars.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  }, [goldBars, page]);

  const allPageIds = useMemo(() => {
    return paginatedBars.map((b) => b.id);
  }, [paginatedBars]);

  const allPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedBarIds.includes(id));

  const availableBarIds = useMemo(() => {
    if (!goldBars) return [];
    return goldBars.filter((b) => b.available).map((b) => b.id);
  }, [goldBars]);

  const allSelected = (goldBars?.length ?? 0) > 0 && selectedBarIds.length === goldBars?.length;
  const selectedWeight = useMemo(() => {
    if (!goldBars || selectedBarIds.length === 0) return 0;
    return goldBars
      .filter((b) => selectedBarIds.includes(b.id))
      .reduce((s, b) => s + b.grossWeight, 0);
  }, [goldBars, selectedBarIds]);

  const toggleBar = (barId: string) => {
    setSelectedBarIds((prev) =>
      prev.includes(barId) ? prev.filter((id) => id !== barId) : [...prev, barId]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedBarIds([]);
    } else {
      setSelectedBarIds(goldBars?.map((b) => b.id) ?? []);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setCode('');
    setSupplierId('');
    setGrossWeight('');
    setLey('');
    setLeyAg('');
  };

  const handleEdit = (b: { id: string; code: string; supplierId: string; grossWeight: number; ley?: number | null; leyAg?: number | null }) => {
    setEditId(b.id);
    setCode(b.code);
    setSupplierId(b.supplierId);
    setGrossWeight(String(b.grossWeight));
    setLey(b.ley != null ? String(b.ley) : '');
    setLeyAg(b.leyAg != null ? String(b.leyAg) : '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const data: Record<string, unknown> = { code };
      if (supplierId) data.supplierId = supplierId;
      if (grossWeight) data.grossWeight = parseLocaleNumber(grossWeight);
      if (ley) data.ley = parseLocaleNumber(ley);
      if (leyAg) data.leyAg = parseLocaleNumber(leyAg);
      await updateGoldBar.mutateAsync({ id: editId, ...data } as any);
      setSuccessMessage('Barra actualizada con éxito.');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar la barra.';
      setShakeKey((k) => k + 1);
      setErrorMessage(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoldBar.mutateAsync(id);
      setDeleteConfirm(null);
      setSuccessMessage('Barra eliminada.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('No se pudo eliminar la barra.');
    }
  };

  const handleBatchDelete = async () => {
    try {
      await bulkDeleteGoldBars.mutateAsync(selectedBarIds);
      setDeleteBatchConfirm(false);
      setSelectedBarIds([]);
      setSuccessMessage(`${selectedBarIds.length} barra${selectedBarIds.length !== 1 ? 's' : ''} eliminada${selectedBarIds.length !== 1 ? 's' : ''}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('No se pudieron eliminar las barras seleccionadas.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5">
      <div className="glass-panel h-full flex flex-col">
        <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Barras Registradas</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
            {String(goldBars?.length ?? 0).padStart(2, '0')}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto min-h-[500px]">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-blue-500/10">
                  <th className="w-10 px-2 sm:px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-gold-500 cursor-pointer"
                      title={allSelected ? 'Deseleccionar todo' : `Seleccionar todo (${goldBars?.length ?? 0} barras)`}
                    />
                  </th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Código</th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Bruto (g)</th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ley Au (‰)</th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">E (g)</th>
                <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBars.length > 0 ? (
                paginatedBars.map((b) => (
                  <tr
                    key={b.id}
                    className={`terminal-row transition-colors ${
                      selectedBarIds.includes(b.id) ? 'bg-gold-500/5 border-gold-500/20' : 'border-transparent'
                    }`}
                  >
                    <td className="px-2 sm:px-3 py-3 whitespace-nowrap">
                      {b.available ? (
                        <input
                          type="checkbox"
                          checked={selectedBarIds.includes(b.id)}
                          onChange={() => toggleBar(b.id)}
                          className="w-4 h-4 accent-gold-500 cursor-pointer"
                        />
                      ) : (
                        <span className="inline-block w-4 h-4" />
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{b.code}</td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                      {suppliers ? getSupplierName(suppliers, b.supplierId) : '—'}
                    </td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(b.grossWeight)}</td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{b.ley != null ? formatLocaleNumber(b.ley) : '—'}</td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(b.analytical)}</td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        b.available
                          ? 'text-gold-500 bg-gold-500/10 border-gold-500/20'
                          : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      }`}>
                        {b.available ? 'DISPONIBLE' : 'EN LOTE'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === b.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(b.id)} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">Confirmar</button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-500 hover:text-slate-300"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">No hay barras registradas.</td>
                </tr>
              )}
            </tbody>
          </table>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 px-4 border-t border-blue-500/10">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-400">
                Página <span className="text-slate-200 font-semibold">{page + 1}</span> de <span className="text-slate-200 font-semibold">{pageCount}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedBarIds.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 z-[100] border-t border-red-500/50 bg-red-500/10 backdrop-blur-md px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 sm:gap-5">
                {allSelected ? (
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">
                    <span className="text-gold-300 text-sm">¡TODAS LAS BARRAS SELECCIONADAS ({selectedBarIds.length})!</span>
                  </span>
                ) : (
                  <span className="text-xs text-red-300 font-semibold uppercase tracking-wider">
                    <span className="text-white text-sm">{selectedBarIds.length}</span> barra{selectedBarIds.length !== 1 ? 's' : ''} seleccionada{selectedBarIds.length !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-xs text-red-300/70">
                  Peso total: <span className="text-white font-mono font-semibold">{formatLocaleNumber(selectedWeight)} g</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {deleteBatchConfirm ? (
                  selectedBarIds.length > 50 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 animate-pulse">
                        ⚠ ACCIÓN IRREVERSIBLE — {selectedBarIds.length} barras serán eliminadas permanentemente
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBatchDelete}
                          disabled={bulkDeleteGoldBars.isPending}
                          className="px-4 py-2 bg-red-900 hover:bg-red-800 disabled:bg-red-950 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest animate-pulse transition-all"
                        >
                          {bulkDeleteGoldBars.isPending ? 'ELIMINANDO...' : '¿CONFIRMAR ELIMINACIÓN?'}
                        </button>
                        <button onClick={() => setDeleteBatchConfirm(false)} className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-red-300/70 hover:text-white transition-colors">
                          CANCELAR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBatchDelete}
                        disabled={bulkDeleteGoldBars.isPending}
                        className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-red-800 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest animate-pulse transition-all"
                      >
                        {bulkDeleteGoldBars.isPending ? 'ELIMINANDO...' : '¿CONFIRMAR ELIMINACIÓN?'}
                      </button>
                      <button onClick={() => setDeleteBatchConfirm(false)} className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-red-300/70 hover:text-white transition-colors">
                        CANCELAR
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => setDeleteBatchConfirm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ELIMINAR {selectedBarIds.length} BARRA{selectedBarIds.length !== 1 ? 'S' : ''}
                  </button>
                )}
                {!deleteBatchConfirm && (
                  <button
                    onClick={() => { setSelectedBarIds([]); setDeleteBatchConfirm(false); }}
                    className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-red-300/70 hover:text-white transition-colors"
                  >
                    CANCELAR
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-sm p-4" onClick={resetForm}>
          <div className="glass-panel w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Editar Barra</h2>
              </div>
              <button onClick={resetForm} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {errorMessage && (
                <div key={shakeKey} className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2" style={{ animation: 'shake 0.4s ease-in-out' }}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Crosshair className="w-3 h-3 inline mr-1" />
                  Código
                </label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Proveedor</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none">
                  <option value="">Seleccionar...</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Peso Bruto (g)</label>
                <input type="text" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Ley Au (‰)</label>
                <input type="text" value={ley} onChange={(e) => setLey(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Ley Ag (‰)</label>
                <input type="text" value={leyAg} onChange={(e) => setLeyAg(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
              </div>

              <button
                type="submit"
                disabled={updateGoldBar.isPending}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
              >
                {updateGoldBar.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
