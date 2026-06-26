'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGold } from '@/lib/GoldContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Users, Wrench, Building2, Package, Settings, ArrowLeftRight } from 'lucide-react';

const adminLinks = [
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Trabajadores', href: '/admin/trabajadores', icon: Wrench },
  { name: 'Proveedores', href: '/admin/proveedores', icon: Building2 },
  { name: 'Barras', href: '/admin/barras', icon: Package },
  { name: 'Procesos', href: '/admin/procesos', icon: Settings },
  { name: 'Transacciones', href: '/admin/transacciones', icon: ArrowLeftRight },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useGold();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'SUPERADMIN') {
      router.replace('/transacciones');
    }
  }, [user, router]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-500" />
            Administración
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Gestión del Sistema</p>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-blue-500/10">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                isActive
                  ? 'text-gold-400 border-gold-500 bg-gold-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
