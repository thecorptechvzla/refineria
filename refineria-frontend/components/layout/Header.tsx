'use client';

import { useGold } from '@/lib/GoldContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell } from 'lucide-react';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/lib/hooks/useNotifications';

export default function Header() {
  const { user } = useGold();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const { data: unread } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unread?.count ?? 0;

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  function handleNotificationClick(id: string) {
    markAsRead.mutate(id);
    setDropdownOpen(false);
    router.push('/insumos');
  }

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const timeLabels = useMemo(() => {
    if (!notifications) return {};
    const map: Record<string, string> = {};
    for (const n of notifications) {
      const diff = now - new Date(n.createdAt).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) map[n.id] = 'ahora';
      else if (mins < 60) map[n.id] = `hace ${mins} min`;
      else {
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) map[n.id] = `hace ${hrs} h`;
        else map[n.id] = `hace ${Math.floor(hrs / 24)} d`;
      }
    }
    return map;
  }, [notifications, now]);

  return (
    <header className="h-14 bg-midnight-800/90 border-b border-blue-500/10 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <span className="text-xs text-slate-500 uppercase tracking-widest hidden sm:block">
          {user?.role === 'SUPERADMIN' || user?.role === 'OWNER' ? 'Centro de Comando' : 'Estación de Operaciones'}
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
               user.role === 'SUPERADMIN' || user.role === 'OWNER' ? 'text-gold-500' : 'text-blue-400'
            }`}>
               {user.role === 'SUPERADMIN' || user.role === 'OWNER' ? 'CMD' : 'OP'}
            </span>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-1.5 text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 transition-all border border-transparent hover:border-gold-500/20"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto bg-midnight-900 border border-blue-500/20 shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/10">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Notificaciones
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    className="text-[10px] text-gold-400 hover:text-gold-300 uppercase tracking-wider"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 20).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    className={`w-full text-left px-4 py-3 border-b border-blue-500/5 hover:bg-midnight-800/50 transition-colors ${
                      !n.read ? 'bg-midnight-800/30 border-l-2 border-l-red-500/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-slate-200">{n.title}</span>
                      <span className="text-[9px] text-slate-600 whitespace-nowrap">{timeLabels[n.id] ?? ''}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">{n.message}</p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-600">No hay notificaciones</p>
                </div>
              )}
            </div>
          )}
        </div>

        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 transition-all border border-transparent hover:border-gold-500/20"
            title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
}
