'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useGoldBars, useUpdateGoldBar, useDeleteGoldBar } from '@/lib/hooks/useGoldBars';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName, formatLocaleNumber, parseLocaleNumber } from '@/lib/utils';
import { Package, CheckCircle, AlertCircle, Trash2, Edit3, X, Crosshair } from 'lucide-react';

export default function AdminBarrasPage() {
  const { data: goldBars } = useGoldBars();
  const { data: suppliers } = useSuppliers();
  const updateGoldBar = useUpdateGoldBar();
  const deleteGoldBar = useDeleteGoldBar();

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
  const [selectedBarIds, setSelectedBarIds] = useState<string[]>([]);

  const availableBarIds = useMemo(() => {
    if (!goldBars) return [];
    return goldBars.filter((b) => b.available).map((b) => b.id);
  }, [goldBars]);

  const allSelected = availableBarIds.length > 0 && availableBarIds.every((id) => selectedBarIds.includes(id));
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

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedBarIds((prev) => prev.filter((id) => !availableBarIds.includes(id)));
    } else {
      setSelectedBarIds((prev) => {
        const existing = new Set(prev);
        for (const id of availableBarIds) existing.add(id);
        return [...existing];
      });
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-1 space-y-4">
        {editId && (
          <div className="glass-panel">
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
        )}
      </div>

      <div className="lg:col-span-2">
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

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="w-10 px-2 sm:px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-gold-500 cursor-pointer"
                      title={allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
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
                {goldBars && goldBars.length > 0 ? (
                  goldBars.map((b) => (
                    <tr key={b.id} className="terminal-row">
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
            {selectedBarIds.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 border-t border-blue-500/10 bg-midnight-800/95 backdrop-blur px-4 sm:px-5 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 sm:gap-5">
                  <span className="text-xs text-slate-400">
                    <span className="text-slate-200 font-semibold">{selectedBarIds.length}</span> barra{selectedBarIds.length !== 1 ? 's' : ''} seleccionada{selectedBarIds.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-400">
                    Peso total: <span className="text-slate-200 font-mono font-semibold">{formatLocaleNumber(selectedWeight)} g</span>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBarIds([])}
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
