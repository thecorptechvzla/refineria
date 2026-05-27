'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGold } from '@/lib/GoldContext';
import { useLogout } from '@/lib/hooks/useAuth';
import { LayoutDashboard, ArrowLeftRight, Building2, LogOut, X, ShieldCheck } from 'lucide-react';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useGold();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  const links = [
    { name: 'Panel de Mando', href: '/', icon: LayoutDashboard, allowedRoles: ['SUPERADMIN'] as const },
    { name: 'Operaciones', href: '/transacciones', icon: ArrowLeftRight, allowedRoles: ['ADMIN', 'SUPERADMIN'] as const },
    { name: 'Proveedores', href: '/proveedores', icon: Building2, allowedRoles: ['ADMIN', 'SUPERADMIN'] as const },
  ];

  return (
    <aside className="w-64 h-full bg-midnight-800/95 border-r border-blue-500/10 flex flex-col">
      <div className="p-5 border-b border-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Gold<span className="text-gold-500">Track</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Refinería</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {user && (
        <div className="mx-4 mt-4 mb-3 p-3 bg-midnight-700/50 border border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-gold-500/15 border border-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role === 'SUPERADMIN' ? 'Comandante' : 'Operador'}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          if (user && !(link.allowedRoles as readonly string[]).includes(user.role)) return null;

          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-blue-500/5 border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-blue-500/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-midnight-700/50 border border-blue-500/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 text-xs uppercase tracking-wider transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
