export type Unit = 'cm' | 'in';

export const CM_PER_INCH = 2.54;

export function toDisplay(cm: number, unit: Unit, digits = 1): number {
  const v = unit === 'cm' ? cm : cm / CM_PER_INCH;
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

export function fromDisplay(value: number, unit: Unit): number {
  return unit === 'cm' ? value : value * CM_PER_INCH;
}

export function formatLength(cm: number, unit: Unit, digits = unit === 'cm' ? 0 : 1) {
  return `${toDisplay(cm, unit, digits)} ${unit}`;
}

/** Signed ease, e.g. "+6 cm" / "−2 cm". */
export function formatEase(cm: number, unit: Unit) {
  const v = toDisplay(Math.abs(cm), unit, unit === 'cm' ? 0 : 1);
  const sign = cm >= 0 ? '+' : '−';
  return `${sign}${v} ${unit}`;
}
