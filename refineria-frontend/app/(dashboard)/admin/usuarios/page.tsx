'use client';

import { useState, FormEvent } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/useUsers';
import { useGold } from '@/lib/GoldContext';
import { Users, UserPlus, Shield, Mail, Key, AlertCircle, CheckCircle, Trash2, Edit3, X } from 'lucide-react';

export default function AdminUsuariosPage() {
  const { data: users } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { user: currentUser } = useGold();

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SUPERADMIN' | 'OWNER'>('ADMIN');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setFormMode('create');
    setEditId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('ADMIN');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (formMode === 'create') {
        await createUser.mutateAsync({ name, email, password, role });
        setSuccessMessage('Usuario creado con éxito.');
      } else if (editId) {
        const data: { name: string; email: string; role: string; password?: string } = { name, email, role };
        if (password) data.password = password;
        await updateUser.mutateAsync({ id: editId, ...data });
        setSuccessMessage('Usuario actualizado con éxito.');
      }
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al guardar el usuario.';
      setShakeKey((k) => k + 1);
      setErrorMessage(msg);
    }
  };

  const handleEdit = (u: { id: string; name: string; email: string; role: 'ADMIN' | 'SUPERADMIN' | 'OWNER' }) => {
    setFormMode('edit');
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      setDeleteConfirm(null);
      setSuccessMessage('Usuario eliminado.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('No se pudo eliminar el usuario.');
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
                {formMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
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
                <Users className="w-3 h-3 inline mr-1" />
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Mail className="w-3 h-3 inline mr-1" />
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="usuario@goldtrack.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Key className="w-3 h-3 inline mr-1" />
                Contraseña {formMode === 'edit' && <span className="text-slate-600 font-normal">(dejar vacío para mantener)</span>}
              </label>
              <input
                type="password"
                required={formMode === 'create'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder={formMode === 'create' ? '••••••••' : 'Nueva contraseña (opcional)'}
                minLength={formMode === 'create' ? 6 : undefined}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <Shield className="w-3 h-3 inline mr-1" />
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SUPERADMIN')}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
              >
                <option value="ADMIN">ADMIN — Operador</option>
                <option value="SUPERADMIN">SUPERADMIN — Comandante</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createUser.isPending || updateUser.isPending}
              className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
            >
              {createUser.isPending || updateUser.isPending ? 'Guardando...' : formMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-panel h-full flex flex-col">
          <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Usuarios del Sistema</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
              {String(users?.length ?? 0).padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Nombre</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Rol</th>
                  <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="terminal-row">
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-200">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] text-gold-500">(tú)</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">{u.email}</td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          u.role === 'SUPERADMIN'
                            ? 'text-gold-400 bg-gold-500/10 border-gold-500/20'
                            : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <>
                              {deleteConfirm === u.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(u.id)}
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
                                  onClick={() => setDeleteConfirm(u.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                      No hay usuarios registrados.
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
