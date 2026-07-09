'use client';

import { useState, FormEvent, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import {
  useSupplyItems,
  useCreateSupplyItem,
  useCreateSupplyTransaction,
  useCreateBulkSupplyTransaction,
  useDeleteSupplyItem,
  useSupplyHistory,
} from '@/lib/hooks/useSupplies';
import { useQueryClient } from '@tanstack/react-query';
import { useGold } from '@/lib/GoldContext';
import SupplyItemForm from '@/components/inventory/SupplyItemForm';
import ItemAutocomplete from '@/components/inventory/ItemAutocomplete';
import { useCriticos } from '@/lib/CriticosContext';
import type { SupplyItem, SupplyCategory, SupplyTransactionType, CriticalType } from '@/types';
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

type CategoryFilter = 'OPERATIONS' | 'GENERAL_SERVICES' | 'CRITICAL' | null;

const tabs: { label: string; value: CategoryFilter }[] = [
  { label: 'OPERACIONES', value: 'OPERATIONS' },
  { label: 'SERVICIOS GENERALES', value: 'GENERAL_SERVICES' },
  { label: 'CRÍTICOS', value: 'CRITICAL' },
  { label: 'TODOS', value: null },
];

export default function InsumosPage() {
  const { user } = useGold();
  const { registerDescargo, registerCritico, historial, quimicos } = useCriticos();
  const [category, setCategory] = useState<CategoryFilter>('OPERATIONS');
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const bulkNewInsumoBtnRef = useRef<HTMLButtonElement>(null);
  const [bulkPageSize, setBulkPageSize] = useState(20);
  const apiCategory = category === 'CRITICAL' ? undefined : category;
  const { data: items, isLoading: itemsLoading, isError: itemsError } = useSupplyItems(apiCategory ?? undefined);
  const createItem = useCreateSupplyItem();
  const createTx = useCreateSupplyTransaction();
  const createBulkTx = useCreateBulkSupplyTransaction();
  const deleteItem = useDeleteSupplyItem();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<SupplyTransactionType>('IN');
  const [gridMode] = useState<'existing' | 'new'>('existing');
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
  const [showBulkCreateOverlay, setShowBulkCreateOverlay] = useState(false);

const [searchQuery, setSearchQuery] = useState('');
const [criticoSearch, setCriticoSearch] = useState('');
const [globalSearchKey, setGlobalSearchKey] = useState(0);
  const [itemForQuantity, setItemForQuantity] = useState<{
    item: SupplyItem;
    existingRowKey?: number;
    quantity: string;
  } | null>(null);
  const [criticoHistoryPage, setCriticoHistoryPage] = useState(0);
  const criticoHistoryPageSize = 10;
  const [historyPage, setHistoryPage] = useState(0);
  const historyPageSize = 10;

  const queryClient = useQueryClient();
  const allowedRoles = useMemo(() => ['SUPERADMIN', 'OWNER', 'ADMIN'], []);
  const canAct = user && allowedRoles.includes(user.role);

  useLayoutEffect(() => {
    if (!bulkOpen || !tableBodyRef.current) return;
    const container = tableBodyRef.current;
    const rowHeight = 42;
    const available = container.clientHeight;
    const pages = Math.max(5, Math.floor(available / rowHeight));
    setBulkPageSize(pages);

    const onResize = () => {
      if (!tableBodyRef.current) return;
      const available = tableBodyRef.current.clientHeight;
      setBulkPageSize(Math.max(5, Math.floor(available / rowHeight)));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [bulkOpen]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');

  const filteredItems = useMemo(() => {
    if (!items) return undefined;
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, searchQuery]);

  const filteredCriticoHistorial = useMemo(() => {
    if (!historial) return [];
    if (!criticoSearch.trim()) return historial;
    const q = criticoSearch.toLowerCase();
    return historial.filter(
      (h) => h.insumo.toLowerCase().includes(q),
    );
  }, [historial, criticoSearch]);

  const autocompleteItems = useMemo(() => items ?? [], [items]);

  const totalCriticoPages = Math.max(1, Math.ceil(filteredCriticoHistorial.length / criticoHistoryPageSize));
  const safeCriticoPage = Math.min(criticoHistoryPage, totalCriticoPages - 1);
  const pageCriticoHistorial = useMemo(
    () => filteredCriticoHistorial.slice(safeCriticoPage * criticoHistoryPageSize, (safeCriticoPage + 1) * criticoHistoryPageSize),
    [filteredCriticoHistorial, safeCriticoPage, criticoHistoryPageSize],
  );

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

  const handleCreateSubmit = async (data: {
    code: string;
    name: string;
    category: SupplyCategory;
    unit: string;
    criticalLevel: number;
    isCritical?: boolean;
    criticalType?: CriticalType;
    initialStock?: number;
    dailyConsumption?: number;
    cilindrosLlenos?: number;
    cilindrosEnUso?: number;
    cilindrosDisponibles?: number;
    litrosIniciales?: number;
    capacidadTanque?: number;
  }) => {
    setCreateError('');

    try {
      await createItem.mutateAsync(data);
      if (data.isCritical && data.criticalType && data.criticalType !== 'QUIMICO') {
        registerCritico({
          name: data.name,
          criticalType: data.criticalType,
          unit: data.unit,
          initialStock: data.initialStock,
          dailyConsumption: data.dailyConsumption,
          minimum: data.criticalLevel,
          cilindrosLlenos: data.cilindrosLlenos,
          cilindrosEnUso: data.cilindrosEnUso,
          cilindrosDisponibles: data.cilindrosDisponibles,
          litrosIniciales: data.litrosIniciales,
          capacidadTanque: data.capacidadTanque,
        });
      }
      setShowCreateModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear insumo';
      setCreateError(msg);
    }
  };

  const handleBulkCreateSubmit = async (data: {
    code: string;
    name: string;
    category: SupplyCategory;
    unit: string;
    criticalLevel: number;
    quantity?: number;
    isCritical?: boolean;
    criticalType?: CriticalType;
    initialStock?: number;
    dailyConsumption?: number;
    cilindrosLlenos?: number;
    cilindrosEnUso?: number;
    cilindrosDisponibles?: number;
    litrosIniciales?: number;
    capacidadTanque?: number;
  }) => {
    const { quantity = 1, ...itemData } = data;
    const newItem = await createItem.mutateAsync(itemData);
    if (data.isCritical && data.criticalType && data.criticalType !== 'QUIMICO') {
      registerCritico({
        name: data.name,
        criticalType: data.criticalType,
        unit: data.unit,
        initialStock: data.initialStock,
        dailyConsumption: data.dailyConsumption,
        minimum: data.criticalLevel,
        cilindrosLlenos: data.cilindrosLlenos,
        cilindrosEnUso: data.cilindrosEnUso,
        cilindrosDisponibles: data.cilindrosDisponibles,
        litrosIniciales: data.litrosIniciales,
        capacidadTanque: data.capacidadTanque,
      });
    }
    queryClient.setQueryData<SupplyItem[]>(
      ['supplies', 'items', category ?? undefined],
      (old) => (old ? [...old, newItem] : [newItem]),
    );
    const nextKey = bulkRowKey + 1;
    setBulkRowKey(nextKey);
    setBulkRows((prev) => [
      ...prev,
      {
        key: nextKey,
        itemId: newItem.id,
        name: newItem.name,
        category: newItem.category,
        unit: newItem.unit,
        criticalLevel: String(newItem.criticalLevel),
        quantity: String(quantity),
      },
    ]);
    setShowBulkCreateOverlay(false);
    bulkNewInsumoBtnRef.current?.focus();
  };

  const resetBulkForm = () => {
    setBulkType('IN');
    setBulkDestination('');
    setBulkRows([]);
    setBulkRowKey(0);
    setBulkPage(0);
    setBulkError('');
  };

  const handleBulkTypeChange = (newType: SupplyTransactionType) => {
    setBulkType(newType);
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

  const handleItemSelect = (rowKey: number, itemId: string) => {
    const item = autocompleteItems.find((i) => i.id === itemId);
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
    setBulkRows([]);
    setBulkRowKey(0);
    setBulkPage(0);
  };

  const handleGlobalSelect = (itemId: string) => {
    const item = autocompleteItems.find((i) => i.id === itemId);
    if (!item) return;
    setItemForQuantity({ item, quantity: '1' });
  };

  const handleRowTap = (row: typeof bulkRows[0]) => {
    const item = autocompleteItems.find((i) => i.id === row.itemId);
    if (!item) return;
    setItemForQuantity({ item, existingRowKey: row.key, quantity: row.quantity });
  };

  const handleQuantityConfirm = () => {
    if (!itemForQuantity) return;
    const qty = parseInt(itemForQuantity.quantity, 10);
    if (!qty || qty < 1) return;

    if (itemForQuantity.existingRowKey !== undefined) {
      setBulkRows((prev) =>
        prev.map((r) =>
          r.key === itemForQuantity.existingRowKey ? { ...r, quantity: String(qty) } : r
        )
      );
    } else {
      const nextKey = bulkRowKey + 1;
      setBulkRowKey(nextKey);
      setBulkRows((prev) => [
        ...prev,
        {
          key: nextKey,
          itemId: itemForQuantity.item.id,
          name: itemForQuantity.item.name,
          category: itemForQuantity.item.category,
          unit: itemForQuantity.item.unit,
          criticalLevel: String(itemForQuantity.item.criticalLevel),
          quantity: String(qty),
        },
      ]);
    }
    setItemForQuantity(null);
    setGlobalSearchKey((k) => k + 1);
  };

  const totalBulkPages = useMemo(
    () => Math.max(1, Math.ceil(bulkRows.length / bulkPageSize)),
    [bulkRows.length, bulkPageSize]
  );
  const safeBulkPage = Math.min(bulkPage, totalBulkPages - 1);
  const pageRows = useMemo(
    () => bulkRows.slice(safeBulkPage * bulkPageSize, (safeBulkPage + 1) * bulkPageSize),
    [bulkRows, safeBulkPage, bulkPageSize]
  );
  const filledCount = useMemo(
    () => bulkRows.filter((r) => {
      if (gridMode === 'existing') return r.itemId && r.itemId !== '';
      return r.name && r.name.trim() !== '';
    }).length,
    [bulkRows, gridMode]
  );

  useEffect(() => {
    if (!bulkOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBulkOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bulkOpen]);

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBulkError('');

    const filledRows = bulkRows.filter((r) => r.itemId && r.itemId !== '');

    if (filledRows.length === 0) {
      setBulkShake((k) => k + 1);
      setBulkError('Agrega al menos un insumo.');
      return;
    }

    const payloadItems = filledRows.map((r) => ({
      itemId: r.itemId || '',
      quantity: parseInt(r.quantity, 10),
    }));

    const invalid = payloadItems.find((r) => !r.itemId || r.quantity < 1);

    if (invalid) {
      setBulkShake((k) => k + 1);
      setBulkError('Completa todos los campos requeridos en cada fila.');
      return;
    }

    try {
      await createBulkTx.mutateAsync({
        type: bulkType,
        destination: bulkDestination.trim(),
        items: payloadItems,
      });
      if (bulkType === 'OUT' && filledRows.length > 0) {
        for (const row of filledRows) {
          const supplyItem = autocompleteItems.find((i) => i.id === row.itemId);
          if (supplyItem?.isCritical) {
            registerDescargo(supplyItem.name, parseInt(row.quantity, 10), bulkDestination.trim());
          } else if (row.name) {
            registerDescargo(row.name, parseInt(row.quantity, 10), bulkDestination.trim());
          }
        }
      }
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
      if (txModal.type === 'OUT' && txModal.item.isCritical) {
        registerDescargo(txModal.item.name, qty, txReference.trim());
      }
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
              (() => {
                const totalPages = Math.max(1, Math.ceil(historyTxs.length / historyPageSize));
                const page = Math.min(historyPage, totalPages - 1);
                const pageTxs = historyTxs.slice(page * historyPageSize, (page + 1) * historyPageSize);
                return (
                  <>
                    {pageTxs.map((tx) => (
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
                    ))}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-3 border-t border-blue-500/10">
                        <button
                          type="button"
                          disabled={page === 0}
                          onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                          className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">
                          {page + 1}/{totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={page >= totalPages - 1}
                          onClick={() => setHistoryPage((p) => Math.min(totalPages - 1, p + 1))}
                          className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No hay movimientos registrados.</p>
            )}
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-midnight-900 animate-slide-up">
          <div className="relative w-full h-full flex flex-col">
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

            <div className="flex-shrink-0 flex gap-3 items-end">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Tipo
                </label>
                <div className="bg-midnight-800 p-1 rounded-md inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleBulkTypeChange('IN')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
                      bulkType === 'IN'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    CARGO
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkTypeChange('OUT')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
                      bulkType === 'OUT'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    DESCARGO
                  </button>
                </div>
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
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-shrink-0 flex items-end gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  &nbsp;
                </label>
                <button
                  ref={bulkNewInsumoBtnRef}
                  type="button"
                  onClick={() => setShowBulkCreateOverlay(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gold-500 text-midnight-900 text-[10px] font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Insumo
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  &nbsp;
                </label>
                <button
                  type="button"
                  onClick={() => addBulkRow()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all border border-blue-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Fila
                </button>
              </div>
            </div>

            {/* ── Buscador Global ── */}
            <div className="flex-shrink-0 bg-midnight-800 border border-blue-500/20 px-3 py-2">
              <ItemAutocomplete
                key={globalSearchKey}
                items={autocompleteItems}
                value=""
                onChange={(id) => handleGlobalSelect(id)}
                placeholder="Escribe código o nombre para añadir a la lista..."
              />
            </div>

            <style>{`select option { background: #1e293b; color: #e2e8f0; }`}</style>

            <div ref={tableBodyRef} className="flex-1 overflow-y-auto min-h-0 border border-blue-500/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-500/10 bg-midnight-800/50 sticky top-0">
                    <th className="text-center py-2.5 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-8">#</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      {bulkType === 'IN' ? 'Ítem / Artículo' : 'Ítem'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-[12%]">Categoría</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-[12%]">Unidad</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest min-w-[50px]">N. Crít.</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-[50px]">Cant.</th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-8"></th>
                  </tr>
                </thead>
                <tbody>
                    {pageRows.map((row, idx) => (
                    <tr
                      key={row.key}
                      onClick={() => row.itemId && handleRowTap(row)}
                      className={`border-b border-blue-500/5 transition-colors ${
                        row.itemId
                          ? 'cursor-pointer hover:bg-midnight-800/30'
                          : ''
                      }`}
                    >
                      <td className="py-1.5 px-1 text-center text-[10px] font-mono text-slate-600">
                        {String(safeBulkPage * bulkPageSize + idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-1.5 px-3">
                        {row.itemId ? (
                          <span className="text-slate-200 text-xs">{row.name}</span>
                        ) : (
                          <ItemAutocomplete
                            items={autocompleteItems}
                            value=""
                            onChange={(id) => handleItemSelect(row.key, id)}
                            placeholder="Buscar insumo..."
                          />
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.category}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.unit}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {row.itemId ? (
                          <span className="text-slate-400 text-xs">{row.criticalLevel}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {row.itemId ? (
                          <span className="text-sm font-mono font-bold text-slate-200">
                            {row.quantity}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeBulkRow(row.key); }}
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
                  {safeBulkPage + 1}/{totalBulkPages}
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
                  ? `⏳ EJECUTANDO ${filledCount} ${bulkType === 'IN' ? 'CARGOS' : 'DESCARGOS'}...`
                  : `▶ EJECUTAR ${filledCount} ${bulkType === 'IN' ? 'CARGOS' : 'DESCARGOS'}`}
              </button>
            </div>
          </form>

          {itemForQuantity && (
            <div className="absolute inset-0 z-40 bg-midnight-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
              <div className="w-full max-w-xs glass-panel">
                <div className="p-5 space-y-4">
                  <div className="text-center">
                    <p className="text-xs font-mono text-slate-500 mb-1">{itemForQuantity.item.code}</p>
                    <p className="text-sm font-bold text-white">{itemForQuantity.item.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Existencia: {itemForQuantity.item.currentStock} {itemForQuantity.item.unit}
                    </p>
                  </div>

                  <div className="text-center">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      autoFocus
                      value={itemForQuantity.quantity}
                      onChange={(e) =>
                        setItemForQuantity((prev) =>
                          prev ? { ...prev, quantity: e.target.value } : null
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuantityConfirm();
                      }}
                      className="w-full text-center text-3xl font-bold py-4 bg-midnight-800 border border-blue-500/20 text-gold-400 outline-none focus:border-gold-500/40 transition-colors"
                      placeholder="0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuantityConfirm}
                    className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                      bulkType === 'IN'
                        ? 'bg-green-500 text-midnight-900 hover:bg-green-400'
                        : 'bg-red-500 text-white hover:bg-red-400'
                    }`}
                  >
                    {itemForQuantity.existingRowKey !== undefined
                      ? `Actualizar ${bulkType === 'IN' ? 'Cargo' : 'Descargo'}`
                      : `Añadir ${bulkType === 'IN' ? 'Cargo' : 'Descargo'}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setItemForQuantity(null); setGlobalSearchKey((k) => k + 1); }}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBulkCreateOverlay && (
            <div className="absolute inset-0 z-40 bg-midnight-900/95 backdrop-blur-sm flex items-start justify-center pt-12 animate-slide-up">
              <div className="w-full max-w-md">
                <div className="glass-panel">
                  <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nuevo Insumo</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkCreateOverlay(false);
                        bulkNewInsumoBtnRef.current?.focus();
                      }}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <SupplyItemForm
                    items={items}
                    isBulkMode
                    chemicals={quimicos}
                    onSubmit={handleBulkCreateSubmit}
                    isSubmitting={createItem.isPending}
                    error={createError}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {showCreateModal && (
          <div className="lg:col-span-4 animate-slide-left">
            <div className="glass-panel">
              <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nuevo Insumo</h2>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SupplyItemForm
                items={items}
                chemicals={quimicos}
                onSubmit={handleCreateSubmit}
                isSubmitting={createItem.isPending}
                error={createError}
              />
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
                  {String(filteredItems?.length ?? items?.length ?? 0).padStart(2, '0')}
                </span>
                <button
                  onClick={() => { initBulkRows(); setBulkOpen(true); setShowCreateModal(false); setTxModal(null); setHistoryItemId(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all border border-blue-500/20"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Cargos / Descargos
                </button>
                {canAct && (
                  <button
                    onClick={() => { setShowCreateModal(true); setTxModal(null); setHistoryItemId(null); setBulkOpen(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-midnight-900 text-[10px] font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Nuevo Insumo
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3 border-b border-blue-500/10 flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
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
              <div className="flex-1 min-w-[180px] max-w-xs ml-auto">
                {category === 'CRITICAL' ? (
                  <input
                    type="text"
                    value={criticoSearch}
                    onChange={(e) => setCriticoSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-800 border border-blue-500/10 text-slate-200 text-xs outline-none placeholder:text-slate-600"
                    placeholder="Buscar en historial..."
                  />
                ) : (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-midnight-800 border border-blue-500/10 text-slate-200 text-xs outline-none placeholder:text-slate-600"
                    placeholder="Buscar por código o nombre..."
                  />
                )}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {category === 'CRITICAL' ? (
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Historial de Consumos</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                      {filteredCriticoHistorial.length} registros
                    </span>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-blue-500/10">
                          <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                          <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Código / Insumo</th>
                          <th className="px-4 sm:px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                          <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cantidad</th>
                          <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Referencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageCriticoHistorial.length > 0 ? (
                          pageCriticoHistorial.map((h) => (
                            <tr key={h.id} className="terminal-row">
                              <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-300">{h.date}</td>
                              <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-200">{h.insumo}</td>
                              <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-center">
                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-red-500/20 text-red-400 bg-red-500/10">
                                  DESCARGO
                                </span>
                              </td>
                              <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-red-400 text-right">{h.cantidad}</td>
                              <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-400">{h.observacion || '—'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                              <p>No hay consumos registrados.</p>
                              <p className="text-xs text-slate-600 mt-1">Los descargos de insumos críticos aparecerán aquí automáticamente.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2">
                    {pageCriticoHistorial.length > 0 ? (
                      pageCriticoHistorial.map((h) => (
                        <div key={h.id} className="bg-midnight-800/50 border border-blue-500/10 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">{h.date}</span>
                            <span className="text-[10px] font-mono font-bold text-red-400">-{h.cantidad}</span>
                          </div>
                          <div className="text-xs text-slate-200 font-medium">{h.insumo}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-red-400/80 border border-red-500/10 px-1.5 py-0.5 bg-red-500/5">DESCARGO</span>
                            <span className="text-[10px] text-slate-500 truncate ml-2">{h.observacion || '—'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No hay consumos registrados.</p>
                      </div>
                    )}
                    {totalCriticoPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          disabled={criticoHistoryPage === 0}
                          onClick={() => setCriticoHistoryPage((p) => Math.max(0, p - 1))}
                          className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">
                          {safeCriticoPage + 1}/{totalCriticoPages}
                        </span>
                        <button
                          type="button"
                          disabled={criticoHistoryPage >= totalCriticoPages - 1}
                          onClick={() => setCriticoHistoryPage((p) => Math.min(totalCriticoPages - 1, p + 1))}
                          className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop pagination */}
                  {totalCriticoPages > 1 && (
                    <div className="hidden sm:flex items-center justify-center gap-3 pt-3 border-t border-blue-500/10 mt-3">
                      <button
                        type="button"
                        disabled={criticoHistoryPage === 0}
                        onClick={() => setCriticoHistoryPage((p) => Math.max(0, p - 1))}
                        className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        {safeCriticoPage + 1}/{totalCriticoPages}
                      </span>
                      <button
                        type="button"
                        disabled={criticoHistoryPage >= totalCriticoPages - 1}
                        onClick={() => setCriticoHistoryPage((p) => Math.min(totalCriticoPages - 1, p + 1))}
                        className="text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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
                  {itemsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-slate-400">Cargando insumos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : itemsError ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <p className="text-sm text-red-400 font-medium">Error al cargar los insumos</p>
                          <p className="text-xs text-slate-500">Verifica la conexión con el servidor.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isCritical = item.criticalLevel > 0 && item.currentStock <= item.criticalLevel;
                      const isHealthy = !isCritical && (item.criticalLevel === 0 || item.currentStock > item.criticalLevel * 3);
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
                              {isHealthy && (
                                <CheckCircle className="w-4 h-4 text-green-500/60" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{item.criticalLevel}</td>
                          <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                            {canAct && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => { setHistoryItemId(item.id); setHistoryPage(0); setTxModal(null); setShowCreateModal(false); setBulkOpen(false); }}
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
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                        {searchQuery.trim() ? 'No se encontraron insumos con ese criterio.' : 'No hay insumos registrados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.25s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
