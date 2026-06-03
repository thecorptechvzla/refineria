const localeFormatter = new Intl.NumberFormat('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatInputNumber(v: string): string {
  const raw = v.replace(/[^\d,]/g, '');
  const commaIdx = raw.indexOf(',');
  const intPart = commaIdx === -1 ? raw : raw.slice(0, commaIdx);
  const decPart = commaIdx !== -1 ? ',' + raw.slice(commaIdx + 1, commaIdx + 3) : '';
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return formattedInt + decPart;
}

export function parseLocaleNumber(value: string): number {
  if (!value) return 0;
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatLocaleNumber(value: number): string {
  return localeFormatter.format(value);
}

export function formatLocaleWeight(value: number): string {
  return `${localeFormatter.format(value)} g`;
}

export function gramsToKg(grams: number): number {
  return grams / 1000;
}

export function kgToGrams(kg: number): number {
  return kg * 1000;
}

export function toGrams(weight: number, unit: string): number {
  return unit === 'kg' ? weight * 1000 : weight;
}

export function formatWeight(weight: number, unit?: string): string {
  if (unit === 'g' || (!unit && weight < 1000)) {
    return `${localeFormatter.format(weight)} g`;
  }
  const kg = unit === 'kg' ? weight : weight / 1000;
  return `${kg.toFixed(2)} kg`;
}

export function formatWeightShort(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}

export function calculateFineWeight(weight: number, purity: number): number {
  return weight * purity;
}

export function getSupplierName(suppliers: { id: string; name: string }[], id?: string): string {
  if (!id) return '—';
  return suppliers.find((s) => s.id === id)?.name || 'Proveedor Desconocido';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}