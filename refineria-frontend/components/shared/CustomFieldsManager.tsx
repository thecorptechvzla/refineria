'use client';

import { useState, FormEvent } from 'react';
import { useCustomFieldDefinitions, useCreateFieldDefinition, useDeleteFieldDefinition } from '@/lib/hooks/useCustomFields';
import { Plus, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección' },
];

export default function CustomFieldsManager({ tableName }: { tableName: string }) {
  const { data: definitions } = useCustomFieldDefinitions(tableName);
  const createField = useCreateFieldDefinition();
  const deleteField = useDeleteFieldDefinition(tableName);

  const [isAdding, setIsAdding] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setRequired(false);
    setOptions('');
    setIsAdding(false);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await createField.mutateAsync({
        tableName,
        fieldName: fieldName.trim().toLowerCase().replace(/\s+/g, '_'),
        fieldType,
        required,
        options: fieldType === 'select' ? options : undefined,
      });
      setSuccessMessage(`Campo "${fieldName}" creado.`);
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Error al crear el campo.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteField.mutateAsync(id);
      setDeleteConfirm(null);
      setSuccessMessage('Campo eliminado.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Error al eliminar el campo.');
    }
  };

  return (
    <div className="glass-panel">
      <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campos Personalizados</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 transition-all"
        >
          <Plus className="w-3 h-3" />
          {isAdding ? 'Cancelar' : 'Agregar Campo'}
        </button>
      </div>

      {successMessage && (
        <div className="mx-4 mt-4 bg-gold-500/10 border border-gold-500/20 p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0" />
          <p className="text-xs text-gold-400 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 border-b border-blue-500/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Nombre del Campo</label>
              <input
                type="text"
                required
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full px-3 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="ej. mina_origen"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Tipo</label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
                className="w-full px-3 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Opciones (separadas por coma)</label>
              <input
                type="text"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="w-full px-3 py-2 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="ej. Opción A, Opción B, Opción C"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 accent-gold-500"
            />
            <label htmlFor="required" className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Requerido</label>
          </div>

          <button
            type="submit"
            disabled={createField.isPending}
            className="w-full py-2 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
          >
            {createField.isPending ? 'Creando...' : 'Crear Campo'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        {definitions && definitions.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Campo</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Req.</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody>
              {definitions.map((def) => (
                <tr key={def.id} className="terminal-row">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-300">{def.fieldName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 uppercase">{def.fieldType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {def.required ? <span className="text-[10px] text-red-400 font-bold">SÍ</span> : <span className="text-[10px] text-slate-600">NO</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {deleteConfirm === def.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(def.id)}
                          className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                          Confirmar
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-500 hover:text-slate-300">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(def.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Eliminar campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-6 text-center text-xs text-slate-500">
            No hay campos personalizados. Agrega uno arriba.
          </p>
        )}
      </div>
    </div>
  );
}
