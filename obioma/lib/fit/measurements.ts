import { z } from 'zod';
import type { BodyBase, BodyMeasurements } from './types';
import { fromDisplay, toDisplay, type Unit } from '@/lib/units';

export type MeasurementKey = keyof BodyMeasurements;

export type MeasurementField = {
  key: MeasurementKey;
  label: string;
  /** Label override for menswear. */
  menLabel?: string;
  required: boolean;
  /** Hard limits in cm. Outside these we cannot draw or fit sensibly. */
  min: number;
  max: number;
  how: string;
};

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: 'height', label: 'Height', required: true, min: 120, max: 220, how: 'Stand barefoot against a wall, heels together. Measure from the floor to the top of your head.' },
  { key: 'bust', label: 'Bust', menLabel: 'Chest', required: true, min: 60, max: 170, how: 'Measure around the fullest part of your chest, keeping the tape level under your arms and across your shoulder blades. Breathe normally.' },
  { key: 'waist', label: 'Waist', required: true, min: 45, max: 160, how: 'Find your natural waist, the narrowest point above your belly button, and measure around it without pulling the tape tight.' },
  { key: 'hip', label: 'Hips', required: true, min: 65, max: 175, how: 'Stand with feet together and measure around the fullest part of your hips and seat.' },
  { key: 'shoulder', label: 'Shoulder width', required: false, min: 28, max: 65, how: 'Across your back, from the tip of one shoulder bone to the other, following the natural curve.' },
  { key: 'arm', label: 'Arm length', required: false, min: 40, max: 85, how: 'With your arm relaxed and slightly bent, measure from the shoulder bone, over the elbow, to the wrist bone.' },
  { key: 'inseam', label: 'Inseam', required: false, min: 55, max: 100, how: 'From the top of your inner thigh to the floor, barefoot. Easiest with a pair of trousers that fit you well.' },
  { key: 'neck', label: 'Neck', required: false, min: 25, max: 55, how: 'Around the base of your neck, where a shirt collar sits. Keep one finger under the tape.' },
  { key: 'thigh', label: 'Thigh', required: false, min: 35, max: 90, how: 'Around the fullest part of one thigh, just below the crotch.' },
  { key: 'upperArm', label: 'Upper arm', required: false, min: 18, max: 55, how: 'Around the fullest part of your upper arm, with the arm relaxed at your side.' },
];

export const fieldLabel = (f: MeasurementField, base: BodyBase) => (base === 'menswear' && f.menLabel ? f.menLabel : f.label);

export type Preset = { id: string; name: string; note: string; measurements: BodyMeasurements };

export const PRESETS: Record<BodyBase, Preset[]> = {
  womenswear: [
    { id: 'standard', name: 'Standard', note: 'UK 12, 165 cm', measurements: { height: 165, bust: 92, waist: 74, hip: 99 } },
    { id: 'petite', name: 'Petite', note: '155 cm, smaller frame', measurements: { height: 155, bust: 84, waist: 66, hip: 90, shoulder: 35.5, arm: 54, inseam: 69 } },
    { id: 'tall', name: 'Tall', note: '180 cm, long legs', measurements: { height: 180, bust: 92, waist: 74, hip: 100, arm: 65, inseam: 84 } },
    { id: 'curvy', name: 'Curvy', note: 'Fuller bust and hip', measurements: { height: 165, bust: 106, waist: 82, hip: 116 } },
    { id: 'athletic', name: 'Athletic', note: 'Broader shoulders', measurements: { height: 172, bust: 90, waist: 72, hip: 96, shoulder: 41, upperArm: 30 } },
  ],
  menswear: [
    { id: 'standard', name: 'Standard', note: 'UK M, 178 cm', measurements: { height: 178, bust: 98, waist: 84, hip: 100 } },
    { id: 'petite', name: 'Petite', note: '165 cm, compact frame', measurements: { height: 165, bust: 92, waist: 78, hip: 94, inseam: 74, arm: 58 } },
    { id: 'tall', name: 'Tall', note: '192 cm, long limbs', measurements: { height: 192, bust: 100, waist: 86, hip: 103, arm: 69, inseam: 89 } },
    { id: 'curvy', name: 'Broad', note: 'Fuller chest and waist', measurements: { height: 180, bust: 112, waist: 100, hip: 110 } },
    { id: 'athletic', name: 'Athletic', note: 'Wide shoulders, slim waist', measurements: { height: 182, bust: 106, waist: 82, hip: 99, shoulder: 50, upperArm: 36 } },
  ],
};

/** Zod schema for the measurement form, in the user's display unit. */
export function measurementSchema(unit: Unit) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of MEASUREMENT_FIELDS) {
    const min = toDisplay(f.min, unit, 0);
    const max = toDisplay(f.max, unit, 0);
    const msg = `Enter a value between ${min} and ${max} ${unit}`;
    const num = z.number({ error: f.required ? `${f.label} is needed for your fit` : msg }).min(min, msg).max(max, msg);
    shape[f.key] = f.required ? num : num.optional();
  }
  return z.object(shape) as unknown as z.ZodType<Partial<Record<MeasurementKey, number>>>;
}

/** Convert display-unit form values to cm, dropping empty or invalid optional values. */
export function toCm(values: Partial<Record<MeasurementKey, number | undefined>>, unit: Unit): Partial<BodyMeasurements> {
  const out: Partial<BodyMeasurements> = {};
  for (const f of MEASUREMENT_FIELDS) {
    const v = values[f.key];
    if (v == null || !Number.isFinite(v)) continue;
    const cm = fromDisplay(v, unit);
    if (cm < f.min || cm > f.max) continue;
    out[f.key] = Math.round(cm * 10) / 10;
  }
  return out;
}

/**
 * Friendly, non-blocking sanity checks. They never stop the user; they just ask
 * them to double-check a value that looks unusual next to the others.
 */
export function softWarnings(m: Partial<BodyMeasurements>): Partial<Record<MeasurementKey, string>> {
  const w: Partial<Record<MeasurementKey, string>> = {};
  const { height, bust, waist, hip } = m;
  if (height && waist && (waist / height < 0.3 || waist / height > 0.78))
    w.waist = 'That waist looks unusual for your height. Double-check?';
  if (height && bust && (bust / height < 0.42 || bust / height > 0.88))
    w.bust = 'That measurement looks unusual for your height. Double-check?';
  if (height && hip && (hip / height < 0.45 || hip / height > 0.9))
    w.hip = 'Those hips look unusual for your height. Double-check?';
  if (waist && hip && bust && waist > hip * 1.25 && waist > bust * 1.2)
    w.waist ??= 'Your waist is much larger than your bust and hips. Is that right?';
  if (height && m.inseam && (m.inseam / height < 0.38 || m.inseam / height > 0.53))
    w.inseam = 'That inseam looks unusual for your height. Measure to the floor, barefoot.';
  if (height && m.shoulder && (m.shoulder / height < 0.19 || m.shoulder / height > 0.31))
    w.shoulder = 'That shoulder width looks unusual. Measure bone to bone across your back.';
  if (height && m.arm && (m.arm / height < 0.3 || m.arm / height > 0.42))
    w.arm = 'That arm length looks unusual for your height. Double-check?';
  return w;
}
