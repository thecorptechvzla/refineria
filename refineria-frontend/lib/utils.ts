export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(Number(value))) return `0,${'0'.repeat(decimals)}`;
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

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
  return formatNumber(value, 2);
}

export function formatLocaleWeight(value: number): string {
  return `${formatNumber(value, 2)} g`;
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
    return `${formatNumber(weight, 2)} g`;
  }
  const kg = unit === 'kg' ? weight : weight / 1000;
  return `${formatNumber(kg, 2)} kg`;
}

export function formatWeightShort(grams: number): string {
  if (grams >= 1000) {
    return `${formatNumber(grams / 1000, 2)} kg`;
  }
  return `${formatNumber(grams, 0)} g`;
}

export function calculateFineWeight(weight: number, purity: number): number {
  return weight * purity;
}

export function getSupplierName(suppliers: { id: string; name: string }[], id?: string): string {
  if (!id) return '—';
  return suppliers.find((s) => s.id === id)?.name || 'Cliente Desconocido';
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