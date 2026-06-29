'use client';

import { useState, FormEvent } from 'react';
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
} from 'lucide-react';

type CategoryFilter = 'OPERATIONS' | 'GENERAL_SERVICES' | null;

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
  const [bulkDestination, setBulkDestination] = useState('');
  const [bulkRows, setBulkRows] = useState<{
    key: number;
    mode: 'existing' | 'new';
    itemId?: string;
    name?: string;
    category?: string;
    unit?: string;
    quantity: string;
  }[]>([]);
  const [bulkRowKey, setBulkRowKey] = useState(0);
  const [bulkError, setBulkError] = useState('');
  const [bulkShake, setBulkShake] = useState(0);

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
    setBulkDestination('');
    setBulkRows([]);
    setBulkRowKey(0);
    setBulkError('');
  };

  const handleBulkTypeChange = (newType: SupplyTransactionType) => {
    setBulkType(newType);
    setBulkRows([]);
    setBulkRowKey(0);
    setBulkError('');
  };

  const addBulkRow = () => {
    const nextKey = bulkRowKey + 1;
    setBulkRowKey(nextKey);
    setBulkRows([
      ...bulkRows,
      { key: nextKey, mode: 'existing', itemId: '', quantity: '1' },
    ]);
  };

  const updateBulkRow = (key: number, field: string, value: string) => {
    setBulkRows(bulkRows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const removeBulkRow = (key: number) => {
    setBulkRows(bulkRows.filter((r) => r.key !== key));
  };

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBulkError('');

    if (bulkRows.length === 0) {
      setBulkShake((k) => k + 1);
      setBulkError('Agrega al menos un insumo.');
      return;
    }

    const items = bulkRows.map((r) => {
      if (r.mode === 'existing') {
        return { itemId: r.itemId || '', quantity: parseInt(r.quantity, 10) };
      }
      return {
        name: r.name || '',
        category: (r.category || 'OPERATIONS') as SupplyCategory,
        unit: r.unit || 'UNIDAD',
        quantity: parseInt(r.quantity, 10),
      };
    });

    const invalid = items.find((r) => {
      if ('itemId' in r) return !r.itemId || r.quantity < 1;
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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-500" />
          Control de Insumos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Almacén Padre de la Patria</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
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
            <div className="glass-panel">
              <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cargos / Descargos</h2>
                </div>
                <button
                  onClick={() => { setBulkOpen(false); resetBulkForm(); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} className="p-4 sm:p-5 space-y-4">
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

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={bulkType}
                    onChange={(e) => handleBulkTypeChange(e.target.value as SupplyTransactionType)}
                    className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                  >
                    <option value="IN">Entrada (CARGO)</option>
                    <option value="OUT">Salida (DESCARGO)</option>
                  </select>
                </div>

                <div>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      Insumos
                    </label>
                    <button
                      type="button"
                      onClick={addBulkRow}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  </div>

                  {bulkRows.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-3">
                      Agrega al menos un insumo.
                    </p>
                  )}

                  {bulkRows.map((row) => (
                    <div key={row.key} className="space-y-2 p-3 bg-midnight-800/30 border border-blue-500/5">
                      {bulkType === 'IN' && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => updateBulkRow(row.key, 'mode', 'existing')}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              row.mode === 'existing'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : 'bg-midnight-800/50 border-blue-500/10 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Ítem Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBulkRow(row.key, 'mode', 'new')}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              row.mode === 'new'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : 'bg-midnight-800/50 border-blue-500/10 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Nuevo Ítem
                          </button>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        {row.mode === 'existing' ? (
                          <>
                            <div className="flex-1">
                              <select
                                value={row.itemId || ''}
                                onChange={(e) => updateBulkRow(row.key, 'itemId', e.target.value)}
                                className="w-full px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none"
                              >
                                <option value="">Seleccionar...</option>
                                {items?.map((it) => (
                                  <option key={it.id} value={it.id}>
                                    {it.code} — {it.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-20 flex-shrink-0">
                              <input
                                type="number"
                                min="1"
                                value={row.quantity}
                                onChange={(e) => updateBulkRow(row.key, 'quantity', e.target.value)}
                                className="w-full px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none text-center"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={row.name || ''}
                              onChange={(e) => updateBulkRow(row.key, 'name', e.target.value)}
                              className="w-full px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none"
                              placeholder="Nombre del artículo"
                            />
                            <div className="flex gap-2">
                              <select
                                value={row.category || 'OPERATIONS'}
                                onChange={(e) => updateBulkRow(row.key, 'category', e.target.value)}
                                className="flex-1 px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none"
                              >
                                <option value="OPERATIONS">Operaciones</option>
                                <option value="GENERAL_SERVICES">Servicios Generales</option>
                              </select>
                              <input
                                type="text"
                                value={row.unit || 'UNIDAD'}
                                onChange={(e) => updateBulkRow(row.key, 'unit', e.target.value)}
                                className="flex-1 px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none"
                                placeholder="Unidad"
                              />
                            </div>
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) => updateBulkRow(row.key, 'quantity', e.target.value)}
                              className="w-full px-2 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-xs outline-none text-center"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeBulkRow(row.key)}
                          className="p-2 text-red-400 hover:bg-red-500/10 transition-all rounded-sm flex-shrink-0"
                          title="Quitar insumo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={createBulkTx.isPending}
                  className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all ${
                    bulkType === 'IN'
                      ? 'bg-green-500 text-midnight-900 hover:bg-green-400 glow-gold-sm'
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
                >
                  {createBulkTx.isPending
                    ? 'Registrando...'
                    : `Registrar ${bulkType === 'IN' ? 'Cargos' : 'Descargos'}`}
                </button>
              </form>
            </div>
          )}

          {showCreateModal && (
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
          )}
        </div>

        <div className="lg:col-span-3">
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
                  onClick={() => { setBulkOpen(true); setShowCreateModal(false); setTxModal(null); setHistoryItemId(null); }}
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
