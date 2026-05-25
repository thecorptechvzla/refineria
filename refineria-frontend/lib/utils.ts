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
    return `${weight} g`;
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