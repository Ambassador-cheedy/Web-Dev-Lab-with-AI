export type Pt = [number, number];

/**
 * Smooth path through points using a Catmull-Rom spline converted to cubic
 * Béziers. `tension` 0.5 is the classic centripetal-looking curve.
 */
export function smoothPath(points: Pt[], closed = true, tension = 0.5): string {
  const n = points.length;
  if (n < 2) return '';
  const p = (i: number): Pt => {
    if (closed) return points[((i % n) + n) % n]!;
    return points[Math.max(0, Math.min(n - 1, i))]!;
  };
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(points[0]![0])},${f(points[0]![1])}`;
  const segments = closed ? n : n - 1;
  const t = tension / 3;
  for (let i = 0; i < segments; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/** Straight polyline path. */
export function linePath(points: Pt[], closed = false): string {
  if (!points.length) return '';
  const d = points
    .map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`)
    .join(' ');
  return closed ? `${d} Z` : d;
}

/** Mirror right-side points (x > cx) to build a symmetric closed outline. */
export function mirrorOutline(right: Pt[], cx: number): Pt[] {
  const left = [...right].reverse().map(([x, y]): Pt => [2 * cx - x, y]);
  return [...right, ...left];
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
