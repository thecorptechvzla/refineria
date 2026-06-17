export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProcessBars(
  existingBars: { grossWeight: number; ley?: number | null }[],
  newBars: { grossWeight: number; ley?: number | null }[],
): ValidationResult {
  const allBars = [...existingBars, ...newBars];
  const lowPurityBars = allBars.filter((b) => (b.ley ?? 0) < 850);
  const errors: string[] = [];

  if (lowPurityBars.length > 2) {
    errors.push(
      `Máximo 2 barras con ley menor a 850 por proceso (seleccionaste ${lowPurityBars.length}).`,
    );
  }

  const totalLowPurityWeight = lowPurityBars.reduce((s, b) => s + b.grossWeight, 0);
  if (totalLowPurityWeight > 5000) {
    errors.push(
      `El peso bruto total de las barras con ley menor a 850 excede los 5 kg (${totalLowPurityWeight.toFixed(2)} g).`,
    );
  }

  return { valid: errors.length === 0, errors };
}
