'use client';

import { useState, FormEvent, useMemo } from 'react';
import { AlertCircle, ToggleLeft, ToggleRight, Beaker, Cylinder, Fuel } from 'lucide-react';
import type { SupplyItem, SupplyCategory, CriticalType } from '@/types';

interface SupplyItemFormData {
  code: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  criticalLevel: number;
  isCritical?: boolean;
  criticalType?: CriticalType;
  quantity?: number;
  initialStock?: number;
  dailyConsumption?: number;
  cilindrosLlenos?: number;
  cilindrosEnUso?: number;
  cilindrosDisponibles?: number;
  litrosIniciales?: number;
  capacidadTanque?: number;
}

interface ChemicalOption {
  id: string;
  name: string;
  unit: string;
  initialStock: number;
  dailyConsumption: number;
  minimum: number;
}

interface SupplyItemFormProps {
  items: SupplyItem[] | undefined;
  initialCategory?: SupplyCategory;
  isBulkMode?: boolean;
  chemicals?: ChemicalOption[];
  onSubmit: (data: SupplyItemFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export default function SupplyItemForm({
  items,
  initialCategory = 'OPERATIONS',
  isBulkMode = false,
  chemicals,
  onSubmit,
  isSubmitting,
  error,
}: SupplyItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>(initialCategory);
  const [unit, setUnit] = useState('UNIDAD');
  const [critical, setCritical] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const [isCritical, setIsCritical] = useState(false);
  const [criticalType, setCriticalType] = useState<CriticalType>('QUIMICO');
  const [selectedChemId, setSelectedChemId] = useState('');

  const [initialStock, setInitialStock] = useState('');
  const [dailyConsumption, setDailyConsumption] = useState('');
  const [cilindrosLlenos, setCilindrosLlenos] = useState('');
  const [cilindrosEnUso, setCilindrosEnUso] = useState('');
  const [cilindrosDisponibles, setCilindrosDisponibles] = useState('');
  const [litrosIniciales, setLitrosIniciales] = useState('');
  const [capacidadTanque, setCapacidadTanque] = useState('');

  const handleChemicalSelect = (chemId: string) => {
    setSelectedChemId(chemId);
    const chem = chemicals?.find((c) => c.id === chemId);
    if (chem) {
      setName(chem.name);
      setInitialStock(String(chem.initialStock));
      setDailyConsumption(String(chem.dailyConsumption));
      setCritical(String(chem.minimum));
      setUnit(chem.unit);
    }
  };

  const nextCode = useMemo(() => {
    const prefix = isCritical ? 'CR' : category === 'OPERATIONS' ? 'OP' : 'SG';
    const existing = items?.filter((i) => i.code.startsWith(prefix)) || [];
    const nums = existing.map((i) => parseInt(i.code.slice(2), 10)).filter((n) => !isNaN(n));
    const nxt = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}${String(nxt).padStart(3, '0')}`;
  }, [items, category, isCritical]);

  const resetForm = () => {
    setName('');
    setCategory(initialCategory);
    setUnit('UNIDAD');
    setCritical('1');
    setQuantity('1');
    setIsCritical(false);
    setCriticalType('QUIMICO');
    setSelectedChemId('');
    setInitialStock('');
    setDailyConsumption('');
    setCilindrosLlenos('');
    setCilindrosEnUso('');
    setCilindrosDisponibles('');
    setLitrosIniciales('');
    setCapacidadTanque('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: SupplyItemFormData = {
      code: nextCode,
      name: name.trim(),
      category,
      unit: unit.trim() || 'UNIDAD',
      criticalLevel: parseInt(critical, 10) || 1,
      isCritical,
      criticalType: isCritical ? criticalType : undefined,
    };

    if (isCritical && criticalType === 'QUIMICO') {
      payload.initialStock = parseInt(initialStock, 10) || 0;
      payload.dailyConsumption = parseInt(dailyConsumption, 10) || 0;
      payload.criticalLevel = parseInt(critical, 10) || 1;
    }

    if (isCritical && criticalType === 'GAS') {
      payload.cilindrosLlenos = parseInt(cilindrosLlenos, 10) || 0;
      payload.cilindrosEnUso = parseInt(cilindrosEnUso, 10) || 0;
      payload.cilindrosDisponibles = parseInt(cilindrosDisponibles, 10) || 0;
    }

    if (isCritical && criticalType === 'COMBUSTIBLE') {
      payload.litrosIniciales = parseInt(litrosIniciales, 10) || 0;
      payload.capacidadTanque = parseInt(capacidadTanque, 10) || 0;
    }

    if (isBulkMode) {
      payload.quantity = parseInt(quantity, 10) || 1;
    }

    await onSubmit(payload);
    resetForm();
  };

  const isGas = isCritical && criticalType === 'GAS';
  const isCombustible = isCritical && criticalType === 'COMBUSTIBLE';
  const isQuimico = isCritical && criticalType === 'QUIMICO';

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
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
          placeholder={isCombustible ? 'GASOIL' : 'NOMBRE DEL INSUMO'}
          autoFocus
        />
      </div>

      {!isCritical && (
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
      )}

      {/* ── Toggle: Insumo Crítico ── */}
      <div className={`border ${isCritical ? 'border-amber-500/20 bg-amber-500/5' : 'border-blue-500/10'} p-3`}>
        <button
          type="button"
          onClick={() => setIsCritical(!isCritical)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            ¿Es Insumo Crítico?
          </span>
          <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${isCritical ? 'text-gold-400' : 'text-slate-600'}`}>
            {isCritical ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {isCritical ? 'SÍ' : 'NO'}
          </span>
        </button>
        {isCritical && (
          <div className="mt-3 flex gap-2">
            {(['QUIMICO', 'GAS', 'COMBUSTIBLE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCriticalType(t)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  criticalType === t
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                    : 'bg-midnight-800/50 border-blue-500/10 text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'QUIMICO' ? 'QUÍMICO' : t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fields: GAS ── */}
      {isGas && (
        <div className="border border-cyan-500/10 bg-cyan-500/5 p-3 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Cylinder className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Datos del Gas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-red-400 mr-0.5">*</span>Cilindros Llenos
              </label>
              <input
                type="number"
                required
                min="0"
                value={cilindrosLlenos}
                onChange={(e) => setCilindrosLlenos(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-red-400 mr-0.5">*</span>Cilindros En Uso
              </label>
              <input
                type="number"
                required
                min="0"
                value={cilindrosEnUso}
                onChange={(e) => setCilindrosEnUso(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-red-400 mr-0.5">*</span>Cilindros Vacíos
              </label>
              <input
                type="number"
                required
                min="0"
                value={cilindrosDisponibles}
                onChange={(e) => setCilindrosDisponibles(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Fields: QUÍMICO ── */}
      {isQuimico && (
        <div className="border border-blue-500/10 bg-blue-500/5 p-3 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Datos del Químico</span>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              <span className="text-red-400 mr-0.5">*</span>Insumo Químico
            </label>
            <select
              value={selectedChemId}
              onChange={(e) => handleChemicalSelect(e.target.value)}
              className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
            >
              <option value="">Seleccionar químico...</option>
              {chemicals?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Inventario Inicial (Lts/Kg)
              </label>
              <input
                type="number"
                disabled
                value={initialStock}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/10 text-slate-500 text-sm outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Consumo Diario Promedio
              </label>
              <input
                type="number"
                disabled
                value={dailyConsumption}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/10 text-slate-500 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Cantidad Mínima (Alerta)
              </label>
              <input
                type="number"
                disabled
                value={critical}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/10 text-slate-500 text-sm outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Unidad
              </label>
              <input
                type="text"
                disabled
                value={unit}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/10 text-slate-500 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Fields: COMBUSTIBLE ── */}
      {isCombustible && (
        <div className="border border-amber-500/10 bg-amber-500/5 p-3 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Datos del Combustible</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-red-400 mr-0.5">*</span>Litros Iniciales en Tanque
              </label>
              <input
                type="number"
                required
                min="0"
                value={litrosIniciales}
                onChange={(e) => setLitrosIniciales(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="Ej. 21449"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                <span className="text-red-400 mr-0.5">*</span>Capacidad Total del Tanque
              </label>
              <input
                type="number"
                required
                min="0"
                value={capacidadTanque}
                onChange={(e) => setCapacidadTanque(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none"
                placeholder="Ej. 50000"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Non-critical fields ── */}
      {!isCritical && (
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
      )}

      {!isCritical && (
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
      )}

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
