'use client';

import { ShieldAlert, ShieldCheck, RefreshCw, Skull } from 'lucide-react';
import { useSecurityLog } from '@/lib/hooks/useSecurityLog';

export default function SecurityLogTable() {
  const { data: logs, isLoading, isError, refetch } = useSecurityLog();

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gold-400 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            REGISTRO DE INTENTOS NO AUTORIZADOS
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            Monitoreo de accesos en tiempo real
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-midnight-800 border border-blue-500/10 hover:border-blue-500/30 hover:text-slate-200 transition-all rounded-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="glass-panel backdrop-blur-md bg-midnight-900/50 border border-white/10 overflow-hidden">
        {isLoading && logs === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-slate-400">Cargando registro de seguridad...</span>
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-400">Error al cargar el registro de seguridad</p>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No hay intentos de acceso registrados</p>
            <p className="text-[10px] text-slate-600 mt-1">La puerta está segura — sin intrusiones detectadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-midnight-800/80 border-b border-blue-500/10">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Fecha/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    IP del Intruso
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Correo Intentado
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Intentos
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/5">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors terminal-row ${
                      log.isBlocked ? 'bg-red-500/10 hover:bg-red-500/15' : 'hover:bg-midnight-800/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap font-mono">
                      {new Date(log.updatedAt).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200 whitespace-nowrap font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                      {log.email}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`font-mono font-bold ${
                        log.attempts >= 2 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {log.attempts}
                      </span>
                      <span className="text-slate-500 text-xs ml-1">
                        / 2
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded-sm">
                          <Skull className="w-3 h-3" />
                          BLOQUEADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-sm">
                          <ShieldAlert className="w-3 h-3" />
                          ACTIVO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-600 mt-2 text-right">
        {logs?.length ?? 0} registro(s) &middot; <button onClick={() => refetch()} className="hover:text-slate-400 underline underline-offset-2">Actualizar manualmente</button>
      </p>
    </div>
  );
}
