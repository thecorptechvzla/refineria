'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import {
  useSupplyItems,
  useCreateSupplyItem,
  useCreateSupplyTransaction,
  useCreateBulkSupplyTransaction,
  useDeleteSupplyItem,
  useSupplyHistory,
} from '@/lib/hooks/useSupplies';
import { useGold } from '@/lib/GoldContext';
import type { SupplyItem, SupplyCategory, SupplyTransactionType } from '@/types';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  History,
  Plus,
  X,
  AlertCircle,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type CategoryFilter = 'OPERATIONS' | 'GENERAL_SERVICES' | null;

const BULK_PAGE_SIZE = 20;

const tabs: { label: string; value: CategoryFilter }[] = [
  { label: 'OPERACIONES', value: 'OPERATIONS' },
  { label: 'SERVICIOS GENERALES', value: 'GENERAL_SERVICES' },
  { label: 'TODOS', value: null },
];

export default function InsumosPage() {
  const { user } = useGold();
  const [category, setCategory] = useState<CategoryFilter>('OPERATIONS');
  const { data: items } = useSupplyItems(category ?? undefined);
  const createItem = useCreateSupplyItem();
  const createTx = useCreateSupplyTransaction();
  const createBulkTx = useCreateBulkSupplyTransaction();
  const deleteItem = useDeleteSupplyItem();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<SupplyTransactionType>('IN');
  const [gridMode, setGridMode] = useState<'existing' | 'new'>('existing');
  const [bulkDestination, setBulkDestination] = useState('');
  const [bulkRows, setBulkRows] = useState<{
    key: number;
    itemId?: string;
    name?: string;
    category?: string;
    unit?: string;
    criticalLevel?: string;
    quantity: string;
  }[]>([]);
  const [bulkRowKey, setBulkRowKey] = useState(0);
  const [bulkError, setBulkError] = useState('');
  const [bulkShake, setBulkShake] = useState(0);
  const [bulkPage, setBulkPage] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<SupplyCategory>('OPERATIONS');
  const [newUnit, setNewUnit] = useState('UNIDAD');
  const [newCritical, setNewCritical] = useState('1');
  const [createError, setCreateError] = useState('');
  const [createShake, setCreateShake] = useState(0);

  const [txModal, setTxModal] = useState<{
    item: SupplyItem;
    type: SupplyTransactionType;
  } | null>(null);
  const [txQuantity, setTxQuantity] = useState('');
  const [txReference, setTxReference] = useState('');
  const [txError, setTxError] = useState('');
  const [txShake, setTxShake] = useState(0);

  const [historyItemId, setHistoryItemId] = useState<string | null>(null);
  const { data: historyTxs, isLoading: historyLoading } = useSupplyHistory(historyItemId);
  const historyItem = historyItemId && items ? items.find((i) => i.id === historyItemId) : null;

  const resetCreateForm = () => {
    setNewCode('');
    setNewName('');
    setNewCategory('OPERATIONS');
    setNewUnit('UNIDAD');
    setNewCritical('1');
    setCreateError('');
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');

    try {
      await createItem.mutateAsync({
        code: newCode.trim(),
        name: newName.trim(),
        category: newCategory,
        unit: newUnit.trim() || 'UNIDAD',
        criticalLevel: parseInt(newCritical, 10) || 1,
      });
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear insumo';
      setCreateShake((k) => k + 1);
      setCreateError(msg);
    }
  };

  const resetBulkForm = () => {
    setBulkType('IN');
    setGridMode('existing');
    setBulkDestination('');
    setBulkRows([]);
    setBulkRowKey(0);
    setBulkPage(0);
    setBulkError('');
  };

  const handleBulkTypeChange = (newType: SupplyTransactionType) => {
    setBulkType(newType);
    if (newType === 'OUT') setGridMode('existing');
    initBulkRows();
    setBulkError('');
  };

  const addBulkRow = () => {
    const nextKey = bulkRowKey + 1;
    setBulkRowKey(nextKey);
    setBulkRows([
      ...bulkRows,
      { key: nextKey, itemId: '', criticalLevel: '1', quantity: '1' },
    ]);
  };

  const updateBulkRow = (key: number, field: string, value: string) => {
    setBulkRows((prev) => {
      const updated = prev.map((r) => (r.key === key ? { ...r, [field]: value } : r));
      const last = updated[updated.length - 1];
      if (last.key === key && key === prev[prev.length - 1].key) {
        const hasContent = gridMode === 'existing'
          ? (field === 'itemId' && value !== '')
          : (field === 'name' && value.trim().length >= 1);
        if (hasContent) {
          const nextKey = Math.max(...prev.map((r) => r.key), 0) + 1;
          updated.push({
            key: nextKey,
            itemId: '',
            criticalLevel: '1',
            quantity: '1',
          });
        }
      }
      return updated;
    });
  };

  const handleItemSelect = (rowKey: number, itemId: string) => {
    const item = items?.find((i) => i.id === itemId);
    setBulkRows((prev) =>
      prev.map((r) =>
        r.key === rowKey
          ? {
              ...r,
              itemId,
              name: item?.name || r.name,
              category: item?.category || r.category,
              unit: item?.unit || r.unit,
              criticalLevel: String(item?.criticalLevel ?? r.criticalLevel ?? '1'),
            }
          : r
      )
    );
  };

  const removeBulkRow = (key: number) => {
    setBulkRows(bulkRows.filter((r) => r.key !== key));
  };

  const initBulkRows = () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      key: i,
      itemId: '',
      criticalLevel: '1',
      quantity: '1',
    }));
    setBulkRows(rows);
    setBulkRowKey(5);
    setBulkPage(0);
  };

  const handleGridModeChange = (mode: 'existing' | 'new') => {
    setGridMode(mode);
    initBulkRows();
  };

  const totalBulkPages = useMemo(
    () => Math.max(1, Math.ceil(bulkRows.length / BULK_PAGE_SIZE)),
    [bulkRows.length]
  );
  const pageRows = useMemo(
    () => bulkRows.slice(bulkPage * BULK_PAGE_SIZE, (bulkPage + 1) * BULK_PAGE_SIZE),
    [bulkRows, bulkPage]
  );
  const filledCount = useMemo(
    () => bulkRows.filter((r) => {
      if (gridMode === 'existing') return r.itemId && r.itemId !== '';
      return r.name && r.name.trim() !== '';
    }).length,
    [bulkRows, gridMode]
  );

  useEffect(() => {
    if (bulkPage >= totalBulkPages) {
      setBulkPage(Math.max(0, totalBulkPages - 1));
    }
  }, [bulkRows.length, bulkPage, totalBulkPages]);

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBulkError('');

    const filledRows = bulkRows.filter((r) => {
      if (gridMode === 'existing') return r.itemId && r.itemId !== '';
      return r.name && r.name.trim() !== '';
    });

    if (filledRows.length === 0) {
      setBulkShake((k) => k + 1);
      setBulkError('Agrega al menos un insumo.');
      return;
    }

    const items = filledRows.map((r) => {
      if (gridMode === 'existing') {
        return { itemId: r.itemId || '', quantity: parseInt(r.quantity, 10) };
      }
      return {
        name: r.name || '',
        category: (r.category || 'OPERATIONS') as SupplyCategory,
        unit: r.unit || 'UNIDAD',
        criticalLevel: parseInt(r.criticalLevel || '1', 10),
        quantity: parseInt(r.quantity, 10),
      };
    });

    const invalid = items.find((r) => {
      if (gridMode === 'existing') return !r.itemId || r.quantity < 1;
      return !r.name || !r.category || r.quantity < 1;
    });

    if (invalid) {
      setBulkShake((k) => k + 1);
      setBulkError('Completa todos los campos requeridos en cada fila.');
      return;
    }

    try {
      await createBulkTx.mutateAsync({
        type: bulkType,
        destination: bulkDestination.trim(),
        items,
      });
      setBulkOpen(false);
      resetBulkForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar movimiento masivo';
      setBulkShake((k) => k + 1);
      setBulkError(msg);
    }
  };

  const resetTxForm = () => {
    setTxQuantity('');
    setTxReference('');
    setTxError('');
  };

  const handleTxSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!txModal) return;
    setTxError('');

    const qty = parseInt(txQuantity, 10);
    if (!qty || qty < 1) {
      setTxShake((k) => k + 1);
      setTxError('La cantidad debe ser mayor a 0');
      return;
    }

    try {
      await createTx.mutateAsync({
        itemId: txModal.item.id,
        type: txModal.type,
        quantity: qty,
        reference: txReference.trim(),
      });
      setTxModal(null);
      resetTxForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar movimiento';
      setTxShake((k) => k + 1);
      setTxError(msg);
    }
  };

  return (
    <div className="space-y-5 mx-auto max-w-7xl px-1">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-500" />
          Control de Insumos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Almacén Padre de la Patria</p>
      </div>

      {txModal && (
        <div className="glass-panel">
          <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {txModal.type === 'IN' ? (
                <PlusCircle className="w-4 h-4 text-green-400" />
              ) : (
                <MinusCircle className="w-4 h-4 text-red-400" />
              )}
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {txModal.type === 'IN' ? 'Registrar Entrada' : 'Registrar Salida'}
              </h2>
            </div>
            <button
              onClick={() => { setTxModal(null); resetTxForm(); }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleTxSubmit} className="p-4 sm:p-5 space-y-4">
            {txError && (
              <div
                key={txShake}
                className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2"
                style={{ animation: 'shake 0.4s ease-in-out' }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{txError}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Insumo
              </label>
              <p className="text-sm text-slate-200 font-medium">{txModal.item.name}</p>
              <p className="text-[10px] font-mono text-slate-500">
                {txModal.item.code} — Stock actual: <span className="text-slate-300">{txModal.item.currentStock}</span>
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Tipo
              </label>
              <span
                className={`inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                  txModal.type === 'IN'
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}
              >
                {txModal.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                required
                value={txQuantity}
                onChange={(e) => setTxQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="Ej. 5"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Referencia / Nota
              </label>
              <input
                type="text"
                required
                value={txReference}
                onChange={(e) => setTxReference(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="Ej. Compra mensual, Orden #123"
              />
            </div>

            <button
              type="submit"
              disabled={createTx.isPending}
              className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all ${
                txModal.type === 'IN'
                  ? 'bg-green-500 text-midnight-900 hover:bg-green-400 glow-gold-sm'
                  : 'bg-red-500 text-white hover:bg-red-400'
              }`}
            >
              {createTx.isPending ? 'Registrando...' : `Registrar ${txModal.type === 'IN' ? 'Entrada' : 'Salida'}`}
            </button>
          </form>
        </div>
      )}

      {historyItemId && (
        <div className="glass-panel">
          <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Historial
              </h2>
            </div>
            <button
              onClick={() => { setHistoryItemId(null); }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-blue-500/10">
            <p className="text-sm text-slate-200 font-medium">{historyItem?.name ?? '—'}</p>
            <p className="text-[10px] font-mono text-slate-500">{historyItem?.code}</p>
          </div>

          <div className="p-4 sm:p-5 max-h-[400px] overflow-y-auto space-y-2">
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-midnight-800/50 animate-pulse">
                  <div className="w-16 h-4 bg-midnight-700 rounded" />
                  <div className="w-14 h-4 bg-midnight-700 rounded" />
                  <div className="w-10 h-4 bg-midnight-700 rounded" />
                  <div className="flex-1 h-4 bg-midnight-700 rounded" />
                </div>
              ))
            ) : historyTxs && historyTxs.length > 0 ? (
              historyTxs.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 bg-midnight-800/50 border border-blue-500/5">
                  <span className="text-[10px] font-mono text-slate-500 w-20 flex-shrink-0">
                    {new Date(tx.date).toLocaleString('es-VE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border flex-shrink-0 ${
                      tx.type === 'IN'
                        ? 'text-green-400 bg-green-500/10 border-green-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {tx.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 w-10 flex-shrink-0 text-right">
                    {tx.quantity}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate flex-1 text-right">
                    {tx.reference || '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No hay movimientos registrados.</p>
            )}
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col bg-midnight-900 rounded-none border-0">
          <div className="flex-shrink-0 p-4 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Cargos / Descargos</h2>
            </div>
            <button
              onClick={() => { setBulkOpen(false); resetBulkForm(); }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleBulkSubmit} className="flex flex-col flex-1 min-h-0 p-4 sm:p-5 gap-4">
            {bulkError && (
              <div
                key={bulkShake}
                className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2"
                style={{ animation: 'shake 0.4s ease-in-out' }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{bulkError}</p>
              </div>
            )}

            <div className="flex-shrink-0 flex gap-3">
              <div className="w-1/3">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Tipo
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => handleBulkTypeChange(e.target.value as SupplyTransactionType)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                >
                  <option value="IN">CARGO</option>
                  <option value="OUT">DESCARGO</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Destino / Referencia
                </label>
                <input
                  type="text"
                  required
                  value={bulkDestination}
                  onChange={(e) => setBulkDestination(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                  placeholder="Ej. Transferencia a Planta, Devolución"
                />
              </div>
            </div>

            {bulkType === 'IN' && (
              <div className="flex-shrink-0">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Modo de Ingreso
                </label>
                <div className="bg-midnight-800 p-1 rounded-md inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleGridModeChange('new')}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                      gridMode === 'new'
                        ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Crear Nuevos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGridModeChange('existing')}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${
                      gridMode === 'existing'
                        ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Usar Existentes
                  </button>
                </div>
              </div>
            )}

            <style>{`select option { background: #1e293b; color: #e2e8f0; }`}</style>

            <div className="flex-1 overflow-y-auto min-h-0 border border-blue-500/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-500/10 bg-midnight-800/50 sticky top-0">
                    <th className="text-center py-2.5 px-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-[32%]">
                      {bulkType === 'IN' ? 'Ítem / Artículo' : 'Ítem'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-[12%]">Categoría</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-[12%]">Unidad</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest min-w-[50px]">N. Crít.</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-[50px]">Cant.</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, idx) => (
                    <tr key={row.key} className="border-b border-blue-500/5 hover:bg-midnight-800/20 transition-colors">
                      <td className="py-1.5 px-1 text-center text-[10px] font-mono text-slate-600">
                        {String(bulkPage * BULK_PAGE_SIZE + idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-1.5 px-3">
                        {bulkType === 'OUT' || gridMode === 'existing' ? (
                          <select
                            value={row.itemId || ''}
                            onChange={(e) => handleItemSelect(row.key, e.target.value)}
                            className="w-full bg-midnight-800 border-0 text-slate-200 text-xs outline-none focus:ring-0 cursor-pointer appearance-none"
                          >
                            <option value="">Seleccionar...</option>
                            {items?.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.code} — {it.name}  [{it.currentStock}]
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.name || ''}
                            onChange={(e) => updateBulkRow(row.key, 'name', e.target.value)}
                            className="w-full bg-transparent border-0 text-slate-200 text-xs outline-none focus:ring-0 placeholder:text-slate-600 py-2"
                            placeholder="Nombre del artículo"
                          />
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {bulkType === 'IN' && gridMode === 'new' ? (
                          <select
                            value={row.category || 'OPERATIONS'}
                            onChange={(e) => updateBulkRow(row.key, 'category', e.target.value)}
                            className="w-full bg-midnight-800 border-0 text-slate-200 text-xs outline-none focus:ring-0 cursor-pointer appearance-none"
                          >
                            <option value="OPERATIONS">Operaciones</option>
                            <option value="GENERAL_SERVICES">Gral. Servicios</option>
                          </select>
                        ) : gridMode === 'existing' && row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.category}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {bulkType === 'IN' && gridMode === 'new' ? (
                          <input
                            type="text"
                            value={row.unit || ''}
                            onChange={(e) => updateBulkRow(row.key, 'unit', e.target.value)}
                            className="w-full bg-transparent border-0 text-slate-200 text-xs outline-none focus:ring-0 placeholder:text-slate-600"
                            placeholder="UNIDAD"
                          />
                        ) : gridMode === 'existing' && row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.unit}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {bulkType === 'IN' && gridMode === 'new' ? (
                          <input
                            type="number"
                            min="0"
                            value={row.criticalLevel || '1'}
                            onChange={(e) => updateBulkRow(row.key, 'criticalLevel', e.target.value)}
                            className="w-full bg-transparent border-0 text-slate-200 text-xs outline-none focus:ring-0 text-center"
                          />
                        ) : gridMode === 'existing' && row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.criticalLevel}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => updateBulkRow(row.key, 'quantity', e.target.value)}
                          className="w-full bg-transparent border-0 text-slate-200 text-xs outline-none focus:ring-0 text-center"
                        />
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeBulkRow(row.key)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Quitar fila"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-shrink-0 flex items-center justify-between border-t border-blue-500/10 px-1 pt-3 pb-2">
              <span className="text-[10px] font-mono text-slate-500">
                {bulkRows.length} filas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={bulkPage === 0}
                  onClick={() => setBulkPage(bulkPage - 1)}
                  className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 min-w-[40px] text-center">
                  {bulkPage + 1}/{totalBulkPages}
                </span>
                <button
                  type="button"
                  disabled={bulkPage >= totalBulkPages - 1}
                  onClick={() => setBulkPage(bulkPage + 1)}
                  className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-shrink-0 pt-1">
              <button
                type="submit"
                disabled={createBulkTx.isPending}
                className={`w-full py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50 transition-all ${
                  bulkType === 'IN'
                    ? 'bg-green-500 text-midnight-900 hover:bg-green-400 glow-gold-sm'
                    : 'bg-red-500 text-white hover:bg-red-400'
                }`}
              >
                {createBulkTx.isPending
                  ? '▶ EJECUTANDO...'
                  : `▶ EJECUTAR ${filledCount} ${bulkType === 'IN' ? 'CARGOS' : 'DESCARGOS'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {showCreateModal && (
          <div className="lg:col-span-4">
            <div className="glass-panel">
              <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nuevo Insumo</h2>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-4 sm:p-5 space-y-4">
                {createError && (
                  <div
                    key={createShake}
                    className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2"
                    style={{ animation: 'shake 0.4s ease-in-out' }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{createError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                    placeholder="Ej. R001, S001, F001"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Artículo
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                    placeholder="Nombre del insumo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SupplyCategory)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                  >
                    <option value="OPERATIONS">Operaciones</option>
                    <option value="GENERAL_SERVICES">Servicios Generales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Unidad
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                    placeholder="UNIDAD"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Nivel Crítico
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCritical}
                    onChange={(e) => setNewCritical(e.target.value)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createItem.isPending}
                  className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
                >
                  {createItem.isPending ? 'Creando...' : 'Crear Insumo'}
                </button>
              </form>
            </div>
          </div>
        )}
        <div className={showCreateModal ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-8 lg:col-start-3'}>
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Inventario</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                  {String(items?.length ?? 0).padStart(2, '0')}
                </span>
                <button
                  onClick={() => { initBulkRows(); setBulkOpen(true); setShowCreateModal(false); setTxModal(null); setHistoryItemId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all border border-blue-500/20"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Cargos / Descargos
                </button>
                <button
                  onClick={() => { setShowCreateModal(true); setTxModal(null); setHistoryItemId(null); setBulkOpen(false); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-midnight-900 text-[10px] font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Nuevo Insumo
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3 border-b border-blue-500/10 flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setCategory(tab.value)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    category === tab.value
                      ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                      : 'bg-midnight-800/50 border border-blue-500/10 text-slate-500 hover:text-slate-300 hover:border-blue-500/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Código</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Artículo</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unidad</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Stock Actual</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Nivel Crítico</th>
                    <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items && items.length > 0 ? (
                    items.map((item) => {
                      const isCritical = item.currentStock <= item.criticalLevel;
                      return (
                        <tr key={item.id} className="terminal-row">
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{item.code}</td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">{item.name}</td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">{item.unit}</td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : 'text-gold-500'}`}>
                                {item.currentStock}
                              </span>
                              {isCritical && (
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" aria-label="Stock crítico" />
                              )}
                              {!isCritical && item.currentStock > item.criticalLevel * 3 && (
                                <CheckCircle className="w-4 h-4 text-green-500/60" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{item.criticalLevel}</td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => { setTxModal({ item, type: 'IN' }); setShowCreateModal(false); setHistoryItemId(null); setBulkOpen(false); }}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 transition-all rounded-sm"
                                title="Registrar entrada"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setTxModal({ item, type: 'OUT' }); setShowCreateModal(false); setHistoryItemId(null); setBulkOpen(false); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 transition-all rounded-sm"
                                title="Registrar salida"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setHistoryItemId(item.id); setTxModal(null); setShowCreateModal(false); setBulkOpen(false); }}
                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 transition-all rounded-sm"
                                title="Ver historial"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              {user?.role === 'SUPERADMIN' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('¿Estás seguro de eliminar este insumo? Esta acción no se puede deshacer.')) {
                                      deleteItem.mutate(item.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-500/10 transition-all rounded-sm"
                                  title="Eliminar insumo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay insumos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
