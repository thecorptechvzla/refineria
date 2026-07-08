'use client';

import { useGold } from '@/lib/GoldContext';

export default function CriticosLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useGold();

  if (isLoading) return null;

  if (user && user.role !== 'SUPERADMIN') {
    return (
      <div className="relative min-h-[calc(100vh-10rem)]">
        <div className="pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-midnight-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-midnight-800 border border-gold-500/20 rounded-xl p-12 text-center shadow-2xl max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gold-400 mb-3">Próximamente</h2>
            <p className="text-slate-400 text-sm">
              Esta sección estará disponible pronto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
