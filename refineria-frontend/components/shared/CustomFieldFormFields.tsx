'use client';

import type { CustomFieldDefinition } from '@/types';

interface Props {
  definitions: CustomFieldDefinition[];
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
}

export default function CustomFieldFormFields({ definitions, values, onChange }: Props) {
  if (definitions.length === 0) return null;

  return (
    <div className="border-t border-blue-500/10 pt-4 mt-4">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Campos Personalizados
      </p>
      <div className="space-y-3">
        {definitions.map((def) => (
          <div key={def.id}>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              {def.fieldName.replace(/_/g, ' ')}
              {def.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {def.fieldType === 'text' && (
              <input
                type="text"
                value={values[def.fieldName] ?? ''}
                onChange={(e) => onChange(def.fieldName, e.target.value)}
                required={def.required}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder={def.fieldName.replace(/_/g, ' ')}
              />
            )}
            {def.fieldType === 'number' && (
              <input
                type="number"
                step="any"
                value={values[def.fieldName] ?? ''}
                onChange={(e) => onChange(def.fieldName, e.target.value)}
                required={def.required}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm placeholder-slate-600 outline-none transition-all"
                placeholder="0"
              />
            )}
            {def.fieldType === 'date' && (
              <input
                type="date"
                value={values[def.fieldName] ?? ''}
                onChange={(e) => onChange(def.fieldName, e.target.value)}
                required={def.required}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all [color-scheme:dark]"
              />
            )}
            {def.fieldType === 'select' && (
              <select
                value={values[def.fieldName] ?? ''}
                onChange={(e) => onChange(def.fieldName, e.target.value)}
                required={def.required}
                className="w-full px-3 py-2.5 bg-midnight-800 border border-blue-500/20 text-slate-200 text-sm outline-none transition-all"
              >
                <option value="">Seleccionar...</option>
                {def.options?.split(',').map((opt) => (
                  <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
