'use client';

import { useState } from 'react';
import { useProcesses, useDeleteProcess } from '@/lib/hooks/useProcesses';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { getSupplierName } from '@/lib/utils';
import { Settings, X, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminProcesosPage() {
  const { data: processes } = useProcesses();
  const { data: suppliers } = useSuppliers();
  const deleteProcess = useDeleteProcess();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteProcess.mutateAsync(id);
      setDeleteConfirm(null);
    } catch {
      // silent
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-3.5 h-3.5 text-gold-500" />;
      case 'closed': return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
      default: return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-gold-500 bg-gold-500/10 border-gold-500/20';
      case 'closed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="glass-panel">
      <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Procesos Registrados</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
          {String(processes?.length ?? 0).padStart(2, '0')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-blue-500/10">
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">N° Proceso</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Proveedor</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lotes</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Barras</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Creación</th>
              <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cierre</th>
              <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processes && processes.length > 0 ? (
              processes.map((p) => (
                <tr key={p.id} className="terminal-row">
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">P-{String(p.number).padStart(4, '0')}</td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm text-slate-300">
                    {suppliers ? getSupplierName(suppliers, p.supplierId) : '—'}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${statusColor(p.status)}`}>
                      {statusIcon(p.status)}
                      {p.status === 'open' ? 'ABIERTO' : 'CERRADO'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">{p.lots?.length ?? 0}</td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-200">
                    {p.lots?.reduce((sum, l) => sum + (l.barIds?.length ?? 0), 0) ?? 0}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-sm font-mono text-slate-400">
                    {p.closedAt ? new Date(p.closedAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right">
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDelete(p.id)} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">Confirmar</button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-500 hover:text-slate-300"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">No hay procesos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
