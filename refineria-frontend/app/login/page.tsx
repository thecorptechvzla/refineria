'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGold } from '@/lib/GoldContext';
import { useLogin } from '@/lib/hooks/useAuth';
import { ShieldCheck, Eye, EyeOff, ChevronRight } from 'lucide-react';
import ShakeAlert from '@/components/ShakeAlert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const { setUser } = useGold();
  const loginMutation = useLogin();
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await loginMutation.mutateAsync({ email, password });
      setUser(res.user);
      router.push(res.user.role === 'SUPERADMIN' || res.user.role === 'OWNER' ? '/' : '/transacciones');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Credenciales incorrectas. Intenta de nuevo.';
      setShakeKey((k) => k + 1);
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex flex-col justify-center relative overflow-hidden bg-grid">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-gold-500/8 rounded-full blur-[120px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Gold<span className="text-gold-500">Track</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 tracking-wider uppercase">Sistema de Gestión de Refinería</p>
        </div>

        <div className="glass-panel rounded-sm p-8">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <ShakeAlert message={error} shakeKey={shakeKey} type="error" />
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="admin@goldtrack.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all pr-10"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 bg-gold-500 text-midnight-900 text-sm font-bold uppercase tracking-wider glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-midnight-900 border-t-transparent rounded-full animate-spin" />
                  Verificando Bóveda
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar al Sistema <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
