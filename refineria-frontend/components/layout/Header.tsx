'use client';

import { useGold } from '@/lib/GoldContext';
import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const { user } = useGold();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-midnight-800/90 border-b border-blue-500/10 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <span className="text-xs text-slate-500 uppercase tracking-widest hidden sm:block">
          {user?.role === 'SUPERADMIN' ? 'Centro de Comando' : 'Estación de Operaciones'}
        </span>
        <span className="text-blue-500/30 hidden sm:block">|</span>
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">
          {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-600">|</span>
            <span className="font-medium text-slate-300">{user.name}</span>
            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${
              user.role === 'SUPERADMIN' ? 'text-gold-500' : 'text-blue-400'
            }`}>
              {user.role === 'SUPERADMIN' ? 'CMD' : 'OP'}
            </span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 transition-all border border-transparent hover:border-gold-500/20"
          title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
