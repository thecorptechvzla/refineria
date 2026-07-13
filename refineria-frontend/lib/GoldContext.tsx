'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

type GoldContextType = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
};

const GoldContext = createContext<GoldContextType | null>(null);

export function GoldProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLocked = typeof document !== 'undefined' && document.cookie.includes('gt_security_lock=1');
    if (isLocked) {
      setIsLoading(false);
      return;
    }

    api<User>('/auth/profile')
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <GoldContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </GoldContext.Provider>
  );
}

export function useGold(): GoldContextType {
  const ctx = useContext(GoldContext);
  if (!ctx) throw new Error('useGold debe usarse dentro de un GoldProvider');
  return ctx;
}
