"use client";

import { ShieldAlert, Skull, ArrowLeft } from "lucide-react";

export default function BloqueoPage() {
  const handleRetry = () => {
    document.cookie = "gt_security_lock=; max-age=0; path=/;";
    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex flex-col justify-center relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(220,38,38,0.08) 0%, transparent 60%)
        `,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.03)_0%,transparent_70%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="glass-panel backdrop-blur-md bg-midnight-900/60 border border-red-500/30 p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-400" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Skull className="w-5 h-5 text-red-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              SISTEMA SELLADO
            </h1>
            <Skull className="w-5 h-5 text-red-400" />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent my-6" />

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-2">
            Múltiples intentos fallidos detectados desde tu dirección IP.
          </p>
          <p className="text-sm text-red-400/80 font-mono tracking-wider mb-6">
            ⚠ IP REPORTADA AL LOG DE SEGURIDAD
          </p>

          <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-4 mb-8 text-left">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-red-400 font-bold">Contramedida activa:</span>{" "}
              El sistema ha registrado este evento en el panel de auditoría. 
              Solo el SUPERADMIN puede revisar los detalles del intento de acceso 
              no autorizado en el Centro de Seguridad.
            </p>
          </div>

          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-midnight-800 text-slate-300 text-sm font-semibold border border-slate-700 hover:border-red-500/40 hover:text-red-400 transition-all rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Reintentar Acceso
          </button>

          <p className="text-[10px] text-slate-600 mt-6 tracking-wider uppercase">
            GoldTrack &mdash; Sistema de Seguridad
          </p>
        </div>
      </div>
    </div>
  );
}
