'use client';

import { useState, FormEvent } from 'react';
import {
  useSupplyItems,
  useCreateSupplyItem,
  useCreateSupplyTransaction,
} from '@/lib/hooks/useSupplies';
import type { SupplyItem, SupplyCategory, SupplyTransactionType } from '@/types';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';

type CategoryFilter = 'OPERATIONS' | 'GENERAL_SERVICES' | null;

const tabs: { label: string; value: CategoryFilter }[] = [
  { label: 'OPERACIONES', value: 'OPERATIONS' },
  { label: 'SERVICIOS GENERALES', value: 'GENERAL_SERVICES' },
  { label: 'TODOS', value: null },
];

export default function InsumosPage() {
  const [category, setCategory] = useState<CategoryFilter>('OPERATIONS');
  const { data: items } = useSupplyItems(category ?? undefined);
  const createItem = useCreateSupplyItem();
  const createTx = useCreateSupplyTransaction();

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
        reference: txReference.trim() || undefined,
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
                    Referencia / Nota <span className="text-slate-600">(opcional)</span>
                  </label>
                  <input
                    type="text"
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
                  onClick={() => { setShowCreateModal(true); setTxModal(null); }}
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
                                onClick={() => { setTxModal({ item, type: 'IN' }); setShowCreateModal(false); }}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 transition-all rounded-sm"
                                title="Registrar entrada"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setTxModal({ item, type: 'OUT' }); setShowCreateModal(false); }}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 transition-all rounded-sm"
                                title="Registrar salida"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>
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
