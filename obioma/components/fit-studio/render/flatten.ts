import type { Pt } from './path';
import type { Scene } from './scene';

/** Pack every animatable number in a scene into one array (and back). */
export function flattenScene(s: Scene): number[] {
  const out: number[] = [];
  const pushPts = (pts: Pt[]) => pts.forEach(([x, y]) => out.push(x, y));
  for (const k of Object.keys(s.shapes)) pushPts(s.shapes[k]!);
  for (const k of Object.keys(s.details)) pushPts(s.details[k]!);
  for (const k of Object.keys(s.stress)) {
    pushPts(s.stress[k]!);
    out.push(s.intensity[k] ?? 0);
  }
  pushPts(s.buttons);
  for (const b of s.bands) out.push(b.top, b.bottom, b.anchorX);
  return out;
}

export function unflattenScene(template: Scene, values: number[]): Scene {
  let i = 0;
  const readPts = (n: number): Pt[] => Array.from({ length: n }, () => [values[i++]!, values[i++]!] as Pt);
  const shapes: Scene['shapes'] = {};
  for (const k of Object.keys(template.shapes)) shapes[k] = readPts(template.shapes[k]!.length);
  const details: Scene['details'] = {};
  for (const k of Object.keys(template.details)) details[k] = readPts(template.details[k]!.length);
  const stress: Scene['stress'] = {};
  const intensity: Scene['intensity'] = {};
  for (const k of Object.keys(template.stress)) {
    stress[k] = readPts(template.stress[k]!.length);
    intensity[k] = values[i++]!;
  }
  const buttons = readPts(template.buttons.length);
  const bands = template.bands.map((b) => ({ ...b, top: values[i++]!, bottom: values[i++]!, anchorX: values[i++]! }));
  return { ...template, shapes, details, stress, intensity, buttons, bands };
}
