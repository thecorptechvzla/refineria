'use client';

import { useState, FormEvent } from 'react';
import { useWorkers } from '@/lib/hooks/useWorkers';
import { useCreateWorker, useUpdateWorker, useDeleteWorker } from '@/lib/hooks/useCreateWorker';
import { formatDate } from '@/lib/utils';
import { Wrench, UserPlus, AlertCircle, CheckCircle, Trash2, Edit3, X, Briefcase, Calendar, Circle } from 'lucide-react';

export default function AdminTrabajadoresPage() {
  const { data: workers } = useWorkers();
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const deleteWorker = useDeleteWorker();

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setFormMode('create');
    setEditId(null);
    setName('');
    setPosition('');
    setStatus('active');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (formMode === 'create') {
        await createWorker.mutateAsync({ name, position, status });
        setSuccessMessage('Trabajador registrado con éxito.');
      } else if (editId) {
        await updateWorker.mutateAsync({ id: editId, name, position, status });
        setSuccessMessage('Trabajador actualizado con éxito.');
      }
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setShakeKey((k) => k + 1);
      setErrorMessage('Error al guardar el trabajador.');
    }
  };

  const handleEdit = (w: { id: string; name: string; position: string; status: 'active' | 'inactive' }) => {
    setFormMode('edit');
    setEditId(w.id);
    setName(w.name);
    setPosition(w.position);
    setStatus(w.status);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorker.mutateAsync(id);
      setDeleteConfirm(null);
      setSuccessMessage('Trabajador eliminado.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('No se pudo eliminar el trabajador.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-1 space-y-4">
        <div className="glass-panel">
          <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formMode === 'create' ? (
                <UserPlus className="w-4 h-4 text-blue-400" />
              ) : (
                <Edit3 className="w-4 h-4 text-blue-400" />
              )}
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {formMode === 'create' ? 'Nuevo Trabajador' : 'Editar Trabajador'}
              </h2>
            </div>
            {formMode === 'edit' && (
              <button onClick={resetForm} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {successMessage && (
              <div className="bg-gold-500/10 border border-gold-500/20 p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <p className="text-xs text-gold-400 font-medium">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div key={shakeKey} className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2" style={{ animation: 'shake 0.4s ease-in-out' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Wrench className="w-3 h-3 inline mr-1" />
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="Ej. Carlos López"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Briefcase className="w-3 h-3 inline mr-1" />
                Cargo
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="Ej. Fundidor"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Circle className="w-3 h-3 inline mr-1" />
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createWorker.isPending || updateWorker.isPending}
              className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
            >
              {createWorker.isPending || updateWorker.isPending ? 'Guardando...' : formMode === 'create' ? 'Registrar Trabajador' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-panel h-full flex flex-col">
          <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Trabajadores</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
              {String(workers?.length ?? 0).padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Nombre</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cargo</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Estado</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Inicio</th>
                  <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workers && workers.length > 0 ? (
                  workers.map((w) => (
                    <tr key={w.id} className="terminal-row">
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-200">{w.name}</td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">{w.position}</td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          w.status === 'active'
                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {w.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(w.startDate)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(w)}
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirm === w.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(w.id)}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-1 text-slate-500 hover:text-slate-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(w.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                      No hay trabajadores registrados.
                    </td>
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
