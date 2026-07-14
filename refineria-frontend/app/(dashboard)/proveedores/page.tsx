'use client';

import { useState, FormEvent } from 'react';
import { useSuppliers, useCreateSupplier } from '@/lib/hooks/useSuppliers';
import { formatDate } from '@/lib/utils';
import { Building2, Building, CheckCircle, Phone, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function ProveedoresPage() {
  const { data: suppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

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
      await createSupplier.mutateAsync({ name: name.toUpperCase().trim(), rif, contactInfo: contactInfo.toUpperCase() });
      setSuccessMessage('Proveedor registrado con éxito.');
      setName('');
      setRif('');
      setContactInfo('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Error al registrar. Verifica que el RIF no esté duplicado.');
    }
  };

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            Directorio de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Empresas que suministran oro a la refinería</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel">
            <div className="p-4 border-b border-blue-500/10 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nuevo Proveedor</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {successMessage && (
                <div className="bg-gold-500/10 border border-gold-500/20 p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <p className="text-xs text-gold-400 font-medium">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div key={shakeKey} className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 animate-shake">
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

              <button
                type="submit"
                disabled={createSupplier.isPending}
                className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
              >
                {createSupplier.isPending ? 'Guardando...' : 'Registrar Proveedor'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel h-full flex flex-col">
            <div className="p-4 sm:p-5 border-b border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clientes Registrados</h2>
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
                  </tr>
                </thead>
                <tbody>
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <tr key={supplier.id} className="terminal-row">
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-200">
                          {supplier.name}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300">
                            <FileText className="w-3 h-3 text-blue-400" />
                            {supplier.rif}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-sm text-slate-400 max-w-[200px] truncate">
                          {supplier.contactInfo}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(supplier.registrationDate)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                        No hay Clientes registrados aún.
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
