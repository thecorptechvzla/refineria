'use client';

import { useState, FormEvent, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { SupplyItem, SupplyCategory } from '@/types';

interface SupplyItemFormProps {
  items: SupplyItem[] | undefined;
  initialCategory?: SupplyCategory;
  isBulkMode?: boolean;
  onSubmit: (data: {
    code: string;
    name: string;
    category: SupplyCategory;
    unit: string;
    criticalLevel: number;
    quantity?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export default function SupplyItemForm({
  items,
  initialCategory = 'OPERATIONS',
  isBulkMode = false,
  onSubmit,
  isSubmitting,
  error,
}: SupplyItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>(initialCategory);
  const [unit, setUnit] = useState('UNIDAD');
  const [critical, setCritical] = useState('1');
  const [quantity, setQuantity] = useState('1');

  const nextCode = useMemo(() => {
    const prefix = category === 'OPERATIONS' ? 'OP' : 'SG';
    const existing = items?.filter((i) => i.code.startsWith(prefix)) || [];
    const nums = existing.map((i) => parseInt(i.code.slice(2), 10)).filter((n) => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}${String(next).padStart(3, '0')}`;
  }, [items, category]);

  const resetForm = () => {
    setName('');
    setCategory(initialCategory);
    setUnit('UNIDAD');
    setCritical('1');
    setQuantity('1');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: {
      code: string;
      name: string;
      category: SupplyCategory;
      unit: string;
      criticalLevel: number;
      quantity?: number;
    } = {
      code: nextCode,
      name: name.trim(),
      category,
      unit: unit.trim() || 'UNIDAD',
      criticalLevel: parseInt(critical, 10) || 1,
    };

    if (isBulkMode) {
      payload.quantity = parseInt(quantity, 10) || 1;
    }

    await onSubmit(payload);

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400 font-medium">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
          Código
        </label>
        <input
          type="text"
          disabled
          value={nextCode}
          className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/10 text-slate-500 text-sm outline-none cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
          Artículo
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none uppercase"
          placeholder="Nombre del insumo"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SupplyCategory)}
          className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
        >
          <option value="OPERATIONS">Operaciones</option>
          <option value="GENERAL_SERVICES">Servicios Generales</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
          Unidad
        </label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
          placeholder="UNIDAD"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
          Nivel Crítico
        </label>
        <input
          type="number"
          min="0"
          value={critical}
          onChange={(e) => setCritical(e.target.value)}
          className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
        />
      </div>

      {isBulkMode && (
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Stock Inicial / Cantidad
          </label>
          <input
            type="number"
            required
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
            placeholder="Ej. 10"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-gold-500 text-midnight-900 text-xs font-bold uppercase tracking-widest glow-gold-sm hover:bg-gold-400 disabled:opacity-50 transition-all"
      >
        {isSubmitting ? 'Creando...' : 'Crear Insumo'}
      </button>
    </form>
  );
}
