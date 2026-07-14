'use client';

import { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import { useSuppliers, useCreateSupplier } from '@/lib/hooks/useSuppliers';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomFieldDefinitions } from '@/lib/hooks/useCustomFields';
import CustomFieldsManager from '@/components/shared/CustomFieldsManager';
import CustomFieldFormFields from '@/components/shared/CustomFieldFormFields';
import { CustomFieldTableHeaders } from '@/components/shared/CustomFieldTableCells';
import { formatDate } from '@/lib/utils';
import { Building2, Building, CheckCircle, AlertCircle, Edit3, Trash2, X, Phone, FileText, Calendar, AlertTriangle, Loader2, Package, CuboidIcon as Cube, DollarSign } from 'lucide-react';
import type { Supplier, SupplierImpact } from '@/types';

type SupplierWithCustomFields = Supplier & { _customFields?: Record<string, string | null> };

export default function AdminProveedoresPage() {
  const { data: suppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const queryClient = useQueryClient();
  const { data: customFieldDefs } = useCustomFieldDefinitions('suppliers');

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [impactModal, setImpactModal] = useState<{ id: string; name: string } | null>(null);
  const [impactData, setImpactData] = useState<SupplierImpact | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactCountdown, setImpactCountdown] = useState(3);
  const [deleting, setDeleting] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetForm = () => {
    setFormMode('create');
    setEditId(null);
    setName('');
    setRif('');
    setContactInfo('');
    setCustomFields({});
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!/^[JVEGP]-\d{8,9}-\d$/.test(rif)) {
      setShakeKey((k) => k + 1);
      setErrorMessage('El RIF debe tener el formato J-12345678-9');
      return;
    }

    try {
      const body = JSON.stringify({
        name: name.toUpperCase().trim(),
        rif,
        contactInfo: contactInfo.toUpperCase(),
        _customFields: customFields,
      });

      if (formMode === 'create') {
        await api<Supplier>('/suppliers', {
          method: 'POST',
          body,
        });
        setSuccessMessage('Proveedor creado con éxito.');
      } else if (editId) {
        await api<Supplier>(`/suppliers/${editId}`, {
          method: 'PATCH',
          body,
        });
        setSuccessMessage('Proveedor actualizado con éxito.');
      }
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setShakeKey((k) => k + 1);
      setErrorMessage('Error al guardar. Verifica que el RIF no esté duplicado.');
    }
  };

  const handleEdit = (s: SupplierWithCustomFields) => {
    setFormMode('edit');
    setEditId(s.id);
    setName(s.name.toUpperCase());
    setRif(s.rif);
    setContactInfo(s.contactInfo.toUpperCase());
    const fields: Record<string, string> = {};
    if (s._customFields) {
      for (const [k, v] of Object.entries(s._customFields)) {
        if (v != null) fields[k] = v;
      }
    }
    setCustomFields(fields);
  };

  useEffect(() => {
    if (impactModal && impactCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setImpactCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [impactModal, impactCountdown]);

  const handleShowImpact = async (id: string, name: string) => {
    setImpactModal({ id, name });
    setImpactData(null);
    setImpactLoading(true);
    setImpactCountdown(3);
    try {
      const data = await api<SupplierImpact>(`/suppliers/${id}/impact`);
      setImpactData(data);
    } catch {
      setImpactData(null);
    } finally {
      setImpactLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!impactModal || !impactData) return;
    setDeleting(true);
    try {
      await api<void>(`/suppliers/${impactModal.id}`, { method: 'DELETE' });
      setImpactModal(null);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setSuccessMessage('Proveedor y registros asociados eliminados permanentemente.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setErrorMessage('No se pudo eliminar el proveedor.');
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setImpactModal(null);
    setImpactCountdown(3);
  };

  const colSpan = useMemo(() => {
    return 4 + (customFieldDefs?.length ?? 0);
  }, [customFieldDefs]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formMode === 'create' ? (
                  <Building className="w-4 h-4 text-blue-400" />
                ) : (
                  <Edit3 className="w-4 h-4 text-blue-400" />
                )}
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {formMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
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
                  <Building className="w-3 h-3 inline mr-1" />
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                  placeholder="Ej. Inversiones El Dorado"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <FileText className="w-3 h-3 inline mr-1" />
                  RIF
                </label>
                <input
                  type="text"
                  required
                  value={rif}
                  onChange={(e) => setRif(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all font-mono tracking-wider"
                  placeholder="J-12345678-9"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Información de Contacto
                </label>
                <textarea
                  required
                  rows={3}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all resize-none"
                  placeholder="Teléfono, Email o Dirección..."
                />
              </div>

              {customFieldDefs && (
                <CustomFieldFormFields
                  definitions={customFieldDefs}
                  values={customFields}
                  onChange={handleCustomFieldChange}
                />
              )}

              <button
                type="submit"
                disabled={createSupplier.isPending}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
              >
                {createSupplier.isPending ? 'Guardando...' : formMode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          <CustomFieldsManager tableName="suppliers" />
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clientes</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/10">
                {String(suppliers?.length ?? 0).padStart(2, '0')}
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Nombre</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">RIF</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Contacto</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Registro</th>
                    {customFieldDefs && <CustomFieldTableHeaders definitions={customFieldDefs} />}
                    <th className="px-4 sm:px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((s: SupplierWithCustomFields) => (
                      <tr key={s.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-200">{s.name}</td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs font-mono text-slate-300">{s.rif}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-sm text-slate-400 max-w-[200px] truncate">{s.contactInfo}</td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(s.registrationDate)}
                          </span>
                        </td>
                        {customFieldDefs && customFieldDefs.map((def) => (
                          <td key={def.id} className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">
                            {s._customFields?.[def.fieldName] ?? '—'}
                          </td>
                        ))}
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShowImpact(s.id, s.name)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay proveedores registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {impactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-midnight-900/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md glass-panel border border-red-500/30 p-0 overflow-hidden">
            <div className="bg-red-500/10 border-b border-red-500/20 p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Eliminación Permanente</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estás a punto de eliminar a: <span className="text-red-400 font-semibold">{impactModal.name}</span>
                </p>
              </div>
              <button onClick={closeModal} className="ml-auto p-1 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {impactLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="ml-2 text-sm text-slate-400">Analizando registros vinculados...</span>
                </div>
              ) : impactData ? (
                <>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
                    Registros que serán eliminados en cascada:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2.5">
                        <Cube className="w-4 h-4 text-gold-400" />
                        <span className="text-sm text-slate-300">Barras de Oro</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-gold-400">
                        {impactData.goldBars}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">Procesos de Refinación</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-blue-400">
                        {impactData.processes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Transacciones</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {impactData.transactions}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20">
                    <p className="text-xs text-red-400 font-medium flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Esta acción es <strong>irreversible</strong> y afectará el balance histórico del inventario.
                        Los procesos asociados y sus lotes también serán eliminados.
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-red-400">Error al obtener datos de impacto.</p>
                </div>
              )}
            </div>

            <div className="border-t border-blue-500/10 p-4 sm:p-5 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={impactCountdown > 0 || deleting || !impactData}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Eliminando...
                  </>
                ) : impactCountdown > 0 ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Espera {impactCountdown}s
                  </>
                ) : (
                  'SÍ, ELIMINAR TODO'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
