'use client';

import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const config = {
  error: {
    bg: 'bg-red-500/10 border-red-500/20',
    icon: AlertCircle,
    iconColor: 'text-red-400',
    textColor: 'text-red-400',
  },
  success: {
    bg: 'bg-gold-500/10 border-gold-500/20',
    icon: CheckCircle,
    iconColor: 'text-gold-500',
    textColor: 'text-gold-400',
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: Info,
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-400',
  },
};

interface Props {
  message: string;
  shakeKey?: number;
  type?: 'error' | 'success' | 'warning';
}

export default function ShakeAlert({ message, shakeKey = 0, type = 'error' }: Props) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <div key={shakeKey} className={`${c.bg} border p-3 flex items-center gap-2 animate-shake`}>
      <Icon className={`w-4 h-4 ${c.iconColor} flex-shrink-0`} />
      <p className={`text-xs ${c.textColor} font-medium`}>{message}</p>
    </div>
  );
}
