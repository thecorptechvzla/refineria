'use client';

import { useState, FormEvent } from 'react';
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '@/lib/hooks/useTransactions';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName, formatLocaleNumber, parseLocaleNumber } from '@/lib/utils';
import { ArrowLeftRight, CheckCircle, AlertCircle, Trash2, Edit3, X } from 'lucide-react';

type TransactionType = 'IN' | 'OUT';

export default function AdminTransaccionesPage() {
  const { data: transactions } = useTransactions();
  const { data: suppliers } = useSuppliers();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<TransactionType>('IN');
  const [editWeight, setEditWeight] = useState('');
  const [editWeightUnit, setEditWeightUnit] = useState<'g' | 'kg'>('g');
  const [editPurity, setEditPurity] = useState('');
  const [editSupplierId, setEditSupplierId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setEditId(null);
    setEditType('IN');
    setEditWeight('');
    setEditWeightUnit('g');
    setEditPurity('');
    setEditSupplierId('');
  };

  const handleEdit = (t: {
    id: string;
    type: TransactionType;
    weight: number;
    weightUnit: 'g' | 'kg';
    purity: number;
    supplierId?: string;
  }) => {
    setEditId(t.id);
    setEditType(t.type);
    setEditWeight(String(t.weight));
    setEditWeightUnit(t.weightUnit || 'g');
    setEditPurity(String(t.purity));
    setEditSupplierId(t.supplierId ?? '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateTransaction.mutateAsync({
        id: editId,
        type: editType,
        weight: parseLocaleNumber(editWeight),
        weightUnit: editWeightUnit,
        purity: parseLocaleNumber(editPurity),
        ...(editSupplierId ? { supplierId: editSupplierId } : {}),
      });
      setSuccessMessage('Transacción actualizada con éxito.');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar la transacción.';
      setShakeKey((k) => k + 1);
      setErrorMessage(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      setDeleteConfirm(null);
      setSuccessMessage('Transacción eliminada.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('No se pudo eliminar la transacción.');
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Editar Transacción</h2>
              </div>
              <button onClick={resetForm} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-400 font-medium">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div key={shakeKey} className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2" style={{ animation: 'shake 0.4s ease-in-out' }}>
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Tipo</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value as TransactionType)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none">
                  <option value="IN">INGRESO</option>
                  <option value="OUT">EGRESO</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Peso</label>
                <div className="flex gap-2">
                  <input type="text" required value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="flex-1 px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
                  <select value={editWeightUnit} onChange={(e) => setEditWeightUnit(e.target.value as 'g' | 'kg')} className="w-16 px-2 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Pureza (‰)</label>
                <input type="text" required value={editPurity} onChange={(e) => setEditPurity(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Cliente</label>
                <select value={editSupplierId} onChange={(e) => setEditSupplierId(e.target.value)} className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none">
                  <option value="">— Sin Cliente —</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={updateTransaction.isPending}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
              >
                {updateTransaction.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="glass-panel h-full flex flex-col">
          <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Transacciones Registradas</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
              {String(transactions?.length ?? 0).padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Peso</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Pureza (‰)</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cliente</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Fecha</th>
                  <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="terminal-row">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          t.type === 'IN'
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {t.type === 'IN' ? 'INGRESO' : 'EGRESO'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">
                        {formatLocaleNumber(t.weight)} {t.weightUnit}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{formatLocaleNumber(t.purity)}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                        {t.supplier?.name ?? (t.supplierId && suppliers ? getSupplierName(suppliers, t.supplierId) : '—')}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                        {new Date(t.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirm === t.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(t.id)} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">Confirmar</button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-500 hover:text-slate-300"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">No hay transacciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
