/**
 * Parametric scene builder for the SVG avatar. Pure: body + garment in, named
 * point lists out. Every list has a fixed length for a given garment type, so the
 * renderer can spring-animate between any two bodies or sizes point by point.
 */
import type {
  FitSpec,
  GarmentSize,
  GarmentType,
  Landmarks,
  ResolvedBody,
  SizeResult,
  Zone,
} from '@/lib/fit/types';
import { hemHeight, trouserHemHeight } from '@/lib/fit/engine';
import { lerp, mirrorOutline, type Pt } from './path';

export const VIEW_W = 480;
export const VIEW_H = 820;
/** Crop above a 205 cm crown; nobody we fit is taller. */
export const VIEW_TOP = 60;
export const CX = 240;
const GROUND = 796;
/** Pixels per centimetre. Fixed, so height differences are visible. */
export const SCALE = 3.55;

const X = (half: number) => CX + half * SCALE;
const Y = (h: number) => GROUND - h * SCALE;
const P = (half: number, h: number): Pt => [X(half), Y(h)];
export const groundY = GROUND;
export const toY = Y;

const half = (circ: number, k: number) => circ / (Math.PI * (1 + k));

export type BodyDims = {
  bust: number;
  waist: number;
  hip: number;
  thigh: number;
  shoulder: number;
  neck: number;
  legC: number;
  kneeC: number;
  calfC: number;
  ankleC: number;
  knee: number;
  calf: number;
  ankle: number;
  upperArm: number;
  elbow: number;
  wrist: number;
  k: { bust: number; waist: number; hip: number };
};

export function bodyDims(body: ResolvedBody): BodyDims {
  const m = body.m;
  const women = body.base === 'womenswear';
  const k = women ? { bust: 0.72, waist: 0.72, hip: 0.66 } : { bust: 0.66, waist: 0.76, hip: 0.7 };
  const bust = half(m.bust, k.bust);
  const waist = half(m.waist, k.waist);
  const hip = half(m.hip, k.hip);
  const thigh = Math.min(half(m.thigh, 0.95), hip * 0.56);
  const legC = Math.max(thigh + 0.3, hip - thigh * 0.98);
  const upperArm = (m.upperArm / (2 * Math.PI)) * 1.05;
  return {
    bust,
    waist,
    hip,
    thigh,
    shoulder: m.shoulder / 2,
    neck: half(m.neck, 0.95) * 0.95,
    legC,
    kneeC: legC * 0.84,
    calfC: legC * 0.8,
    ankleC: legC * 0.78,
    knee: thigh * 0.6,
    calf: thigh * 0.6,
    ankle: thigh * 0.36,
    upperArm,
    elbow: upperArm * 0.72,
    wrist: upperArm * 0.52,
    k,
  };
}

export type ArmFrame = {
  start: [number, number]; // (half, height) in cm
  dir: [number, number]; // unit vector in (half, height) space, pointing down the arm
  normal: [number, number]; // outward
  length: number;
  hand: number;
};

function armFrame(body: ResolvedBody, L: Landmarks, d: BodyDims): ArmFrame {
  const startX = d.shoulder - d.upperArm * 0.55;
  const startH = L.shoulder - 1.5;
  const length = body.m.arm;
  const needed = (d.hip + 1.2 + d.wrist - startX) / length;
  const sin = Math.min(
    Math.sin((24 * Math.PI) / 180),
    Math.max(Math.sin((5 * Math.PI) / 180), needed),
  );
  const cos = Math.sqrt(1 - sin * sin);
  return {
    start: [startX, startH],
    dir: [sin, -cos],
    normal: [cos, sin],
    length,
    hand: body.m.height * 0.105,
  };
}

/** Point along the arm axis at fraction t, offset sideways by `off` cm (+ outward). */
function armAt(f: ArmFrame, t: number, off = 0): [number, number] {
  return [
    f.start[0] + f.dir[0] * f.length * t + f.normal[0] * off,
    f.start[1] + f.dir[1] * f.length * t + f.normal[1] * off,
  ];
}
const AP = (f: ArmFrame, t: number, off = 0) => {
  const [h, y] = armAt(f, t, off);
  return P(h, y);
};

function armShape(f: ArmFrame, d: BodyDims, L: Landmarks): Pt[] {
  const handT = 1 + f.hand / f.length;
  return [
    P(d.shoulder * 0.8, L.shoulder + 0.4),
    P(d.shoulder + 0.9, L.shoulder - 2.2),
    AP(f, 0.2, d.upperArm),
    AP(f, 0.45, d.elbow),
    AP(f, 0.66, d.elbow * 1.06),
    AP(f, 1, d.wrist),
    AP(f, (1 + handT) / 2, d.wrist * 1.2),
    AP(f, handT, d.wrist * 0.2),
    AP(f, handT - 0.01, -d.wrist * 0.5),
    AP(f, (1 + handT) / 2, -d.wrist * 1.05),
    AP(f, 1, -d.wrist),
    AP(f, 0.66, -d.elbow * 0.95),
    AP(f, 0.45, -d.elbow * 0.9),
    AP(f, 0.16, -d.upperArm * 0.85),
  ];
}

function bodyOutline(d: BodyDims, L: Landmarks): Pt[] {
  const calfY = L.knee - (L.knee - L.ankle) * 0.3;
  const right: Pt[] = [
    P(d.neck, L.chin - 0.5),
    P(d.neck * 1.08, L.neckBase + 0.4),
    P(d.shoulder * 0.62, L.neckBase - 1.7),
    P(d.shoulder + 0.5, L.shoulder - 1.3),
    P(d.bust * 0.94, L.armpit),
    P(d.bust, L.bust),
    P(lerp(d.bust, d.waist, 0.55), lerp(L.bust, L.waist, 0.5)),
    P(d.waist, L.waist),
    P(lerp(d.waist, d.hip, 0.7), lerp(L.waist, L.hip, 0.5)),
    P(d.hip, L.hip),
    P(d.legC + d.thigh * 0.99, lerp(L.hip, L.crotch, 0.55)),
    P(lerp(d.legC + d.thigh, d.kneeC + d.knee, 0.45), L.midThigh),
    P(d.kneeC + d.knee, L.knee),
    P(d.calfC + d.calf * 1.08, calfY),
    P(d.ankleC + d.ankle, L.ankle + 1),
    P(d.ankleC + d.ankle + 0.9, 1.2),
    P(d.ankleC + d.ankle * 0.2, 0),
    P(d.ankleC - d.ankle * 0.9, 0.4),
    P(d.ankleC - d.ankle, L.ankle + 1),
    P(d.calfC - d.calf * 0.9, calfY + 2),
    P(d.kneeC - d.knee * 0.95, L.knee),
    P(d.legC - d.thigh * 0.85, L.midThigh),
    P(d.legC - d.thigh + 0.15, L.crotch - 1.5),
    P(0.2, L.crotch),
  ];
  return mirrorOutline(right, CX);
}

/** Outer edge of a leg (half-width from centre) at height h, for keeping hems outside the legs. */
function legOuter(d: BodyDims, L: Landmarks, h: number): number {
  const stops: [number, number][] = [
    [L.crotch, d.legC + d.thigh],
    [L.knee, d.kneeC + d.knee],
    [L.ankle, d.ankleC + d.ankle],
    [0, d.ankleC + d.ankle + 0.9],
  ];
  if (h >= L.crotch) return d.hip;
  for (let i = 0; i < stops.length - 1; i++) {
    const [h0, w0] = stops[i]!;
    const [h1, w1] = stops[i + 1]!;
    if (h <= h0 && h >= h1) return lerp(w0, w1, (h0 - h) / (h0 - h1 || 1));
  }
  return stops[stops.length - 1]![1];
}

export type Band = {
  zone: Zone;
  top: number;
  bottom: number;
  clip: 'main' | 'sleeves' | 'legs';
  anchorX: number;
};

export type Scene = {
  key: string;
  shapes: Record<string, Pt[]>;
  /** Detail polylines (seams, lapels, pleats). */
  details: Record<string, Pt[]>;
  /** Drag lines (tight) and folds (loose); intensity 0–1 per line in `intensity`. */
  stress: Record<string, Pt[]>;
  intensity: Record<string, number>;
  bands: Band[];
  coversArms: boolean;
  garmentType: GarmentType | null;
  heights: { crown: number; ground: number };
  /** Points for buttons. */
  buttons: Pt[];
};

type GarmentCtx = {
  body: ResolvedBody;
  L: Landmarks;
  d: BodyDims;
  f: ArmFrame;
  spec: FitSpec;
  size: GarmentSize;
  result: SizeResult | null;
};

const STYLE_EASE = { fitted: 0.6, regular: 1.2, relaxed: 2.2, oversized: 3.2 } as const;
const HEM_FLARE = { fitted: 0.9, regular: 1.06, relaxed: 1.22, oversized: 1.35 } as const;

function garmentHalf(ctx: GarmentCtx, zone: 'bust' | 'waist' | 'hip'): number | undefined {
  const v = ctx.size.measurements[zone];
  if (v == null) return undefined;
  return Math.max(ctx.d[zone] + 0.25, half(v, ctx.d.k[zone]));
}

function zoneIntensity(ctx: GarmentCtx, zone: Zone, status: 'tight' | 'loose'): number {
  const z = ctx.result?.zones.find((x) => x.zone === zone);
  if (!z || z.status !== status) return 0;
  return Math.min(1, 0.25 + z.deviation / 8);
}

type Upper = {
  outline: Pt[];
  sleeves: [Pt[], Pt[]] | null;
  hemH: number;
  widths: { shoulder: number; bust: number; waist: number; hip: number; hem: number };
  details: Record<string, Pt[]>;
  buttons: Pt[];
};

function upperGarment(
  ctx: GarmentCtx,
  opts: { sleeveless?: boolean; neckDrop?: number; collar?: boolean },
): Upper {
  const { L, d, f, spec, size } = ctx;
  const style = spec.fitStyle;
  const hemH = Math.max(0.5, hemHeight(spec, size, L) ?? L.hip - 4);
  const sh =
    size.measurements.shoulder != null
      ? Math.max(d.shoulder - 0.8, size.measurements.shoulder / 2)
      : d.shoulder + 0.5;
  const bust = garmentHalf(ctx, 'bust') ?? d.bust + STYLE_EASE[style];
  const hipG = garmentHalf(ctx, 'hip');
  const waistG = garmentHalf(ctx, 'waist');
  // Garments without a measured waist fall straight from bust to hip.
  const hipW =
    hipG ??
    Math.max(
      d.hip + STYLE_EASE[style] * 0.8,
      waistG ?? 0,
      bust * (style === 'fitted' ? 0.96 : 1.02),
    );
  const waistW = waistG ?? Math.max(d.waist + 0.4, lerp(bust, hipW, 0.5));
  const legsAtHem = hemH < L.crotch ? legOuter(d, L, hemH) + 0.8 : 0;
  const hemBase =
    hemH < L.hip
      ? hipW
      : hemH < L.waist
        ? lerp(waistW, hipW, (L.waist - hemH) / (L.waist - L.hip))
        : waistW;
  const flare = hemH < L.crotch ? HEM_FLARE[style] : Math.min(HEM_FLARE[style], 1.04);
  const hemW = Math.max(legsAtHem, hemBase * flare, d.hip * 0.6);
  const seamH = L.shoulder - Math.max(0, sh - d.shoulder) * 0.55;
  const neckHalf = d.neck + (opts.collar ? 1.4 : 2.6);
  const neckDrop = opts.neckDrop ?? 4;

  const right: Pt[] = [
    P(0.01, L.neckBase - neckDrop),
    P(neckHalf * 0.75, L.neckBase - neckDrop * 0.45),
    P(neckHalf, L.neckBase + 0.4),
  ];
  right.push(P(sh, seamH));
  if (opts.sleeveless) {
    right.push(P(sh - 1.6, L.shoulder - 4.5), P(bust - 0.4, L.armpit - 1.2));
  } else {
    right.push(P(Math.max(bust, sh - 0.5) + 0.3, L.armpit - 0.5));
  }
  if (L.bust > hemH + 2) right.push(P(bust, L.bust));
  if (L.waist > hemH + 2) right.push(P(waistW, L.waist));
  else if (L.waist > hemH - 3) right.push(P(lerp(bust, waistW, 0.9), lerp(L.bust, hemH, 0.6)));
  if (L.hip > hemH + 2)
    right.push(P(lerp(waistW, hipW, 0.7), lerp(L.waist, L.hip, 0.5)), P(hipW, L.hip));
  if (L.crotch > hemH + 6)
    right.push(P(lerp(hipW, hemW, 0.3) + (style === 'fitted' ? 0 : 0.3), L.crotch));
  if (L.knee > hemH + 8) right.push(P(lerp(hipW, hemW, 0.65), L.knee));
  right.push(P(hemW, hemH + 1.2), P(hemW, hemH), P(hemW - 1.2, hemH - 0.15), P(0.01, hemH - 0.6));
  const outline = mirrorOutline(right, CX);

  let sleeves: [Pt[], Pt[]] | null = null;
  if (!opts.sleeveless && size.measurements.sleeve != null) {
    const sleeveT = Math.min(1.12, size.measurements.sleeve / f.length + 0.02);
    const extra = STYLE_EASE[style];
    const cuff = d.wrist + extra * 0.6 + (style === 'relaxed' ? 0.8 : 0.2);
    const sleeve: Pt[] = [
      P(Math.min(sh, d.shoulder) * 0.76, L.shoulder + 1.1),
      P(Math.max(sh, d.shoulder) + 1.4, Math.min(seamH, L.shoulder) - 1.8),
      AP(f, 0.22, d.upperArm + extra),
      AP(f, 0.45, d.elbow + extra * 0.9),
      AP(f, sleeveT - 0.03, cuff),
      AP(f, sleeveT, cuff * 0.98),
      AP(f, sleeveT, -cuff * 0.98),
      AP(f, sleeveT - 0.03, -cuff),
      AP(f, 0.45, -(d.elbow + extra * 0.8)),
      AP(f, 0.17, -(d.upperArm + extra * 0.7)),
    ];
    sleeves = [sleeve, sleeve.map(([x, y]): Pt => [2 * CX - x, y])];
  }
  return {
    outline,
    sleeves,
    hemH,
    widths: { shoulder: sh, bust, waist: waistW, hip: hipW, hem: hemW },
    details: {},
    buttons: [],
  };
}

function trousers(
  ctx: GarmentCtx,
  opts: { waistH?: number; waistEase?: number; taper?: boolean; waistW?: number },
) {
  const { L, d, spec, size } = ctx;
  const style = spec.fitStyle;
  const rawHem = trouserHemHeight(size, L) ?? L.ankle;
  const hemH = Math.max(0.3, rawHem);
  const waistH = opts.waistH ?? L.waist + 1;
  const waistW = opts.waistW ?? garmentHalf(ctx, 'waist') ?? d.waist + (opts.waistEase ?? 0.6);
  const hipW = garmentHalf(ctx, 'hip') ?? d.hip + 1.2;
  const thighW = d.thigh + Math.max(0.4, (hipW - d.hip) * 0.85);
  const kneeW = opts.taper
    ? d.knee + 1.4
    : style === 'relaxed'
      ? thighW * 0.86
      : Math.max(d.knee + 1.6, thighW * 0.72);
  const hemLeg = opts.taper ? d.ankle + 1.1 : style === 'relaxed' ? kneeW * 1.0 : kneeW * 0.94;
  const legC = d.legC + Math.max(0, hipW - d.hip) * 0.15;
  const kneeC = d.kneeC + (legC - d.legC);
  const hemC = d.ankleC + (legC - d.legC) * 0.8;
  const crotchH = L.crotch - (style === 'relaxed' ? 2 : 1);
  const right: Pt[] = [
    P(0.01, waistH),
    P(waistW, waistH),
    P(lerp(waistW, hipW, 0.65), lerp(waistH, L.hip, 0.55)),
    P(hipW, L.hip),
    P(Math.max(legC + thighW, hipW * 0.98), crotchH),
    P(kneeC + kneeW, L.knee),
    P(hemC + hemLeg, hemH + 1),
    P(hemC + hemLeg, hemH),
    P(hemC - hemLeg, hemH),
    P(hemC - hemLeg, hemH + 1),
    P(kneeC - kneeW * 0.95, L.knee),
    P(Math.max(0.8, legC - thighW * 0.95), crotchH - 3),
    P(0.01, crotchH - 1),
  ];
  return {
    outline: mirrorOutline(right, CX),
    hemH,
    rawHem,
    waistH,
    widths: { waist: waistW, hip: hipW, hemC, hemLeg, legC, kneeC, kneeW },
  };
}

function strainLines(name: string, ctx: GarmentCtx, zone: Zone, h: number, w: number, out: Scene) {
  const tight = zoneIntensity(ctx, zone, 'tight');
  const loose = zoneIntensity(ctx, zone, 'loose');
  for (let i = 0; i < 3; i++) {
    const hh = h + (i - 1) * 2.4;
    const ww = w * (0.82 - Math.abs(i - 1) * 0.08);
    out.stress[`${name}-t${i}`] = [
      P(-ww, hh + 0.6),
      P(-ww * 0.4, hh - 0.5),
      P(0, hh - 0.9),
      P(ww * 0.4, hh - 0.5),
      P(ww, hh + 0.6),
    ];
    out.intensity[`${name}-t${i}`] = tight * (i === 1 ? 1 : 0.7);
  }
  for (let i = 0; i < 4; i++) {
    const x = w * [-0.62, -0.22, 0.22, 0.62][i]!;
    const sway = i % 2 ? 0.6 : -0.6;
    out.stress[`${name}-f${i}`] = [P(x, h - 1), P(x + sway, h - 7), P(x - sway * 0.5, h - 14)];
    out.intensity[`${name}-f${i}`] = loose * (i === 1 || i === 2 ? 0.7 : 1);
  }
}

function baseTrousers(ctx: GarmentCtx) {
  const { L, d } = ctx;
  const right: Pt[] = [
    P(0.01, L.waist),
    P(d.waist + 0.5, L.waist),
    P(d.hip + 0.5, L.hip),
    P(d.legC + d.thigh + 0.6, L.crotch - 1),
    P(d.kneeC + d.knee + 0.8, L.knee),
    P(d.ankleC + d.ankle + 0.9, L.ankle + 1.5),
    P(d.ankleC - d.ankle - 0.9, L.ankle + 1.5),
    P(d.kneeC - d.knee - 0.6, L.knee),
    P(d.legC - d.thigh * 0.95, L.crotch - 3),
    P(0.01, L.crotch - 1.5),
  ];
  return mirrorOutline(right, CX);
}

function baseTop(ctx: GarmentCtx) {
  const { L, d } = ctx;
  const right: Pt[] = [
    P(0.01, L.neckBase - 7),
    P(d.neck + 3.5, L.neckBase - 0.5),
    P(d.shoulder * 0.75, L.shoulder - 1),
    P(d.bust * 0.92 + 0.4, L.armpit - 1.5),
    P(d.bust + 0.4, L.bust),
    P(d.waist + 0.5, L.waist),
    P(lerp(d.waist, d.hip, 0.5) + 0.5, lerp(L.waist, L.hip, 0.6)),
    P(0.01, lerp(L.waist, L.hip, 0.62)),
  ];
  return mirrorOutline(right, CX);
}

export function buildScene(
  body: ResolvedBody,
  L: Landmarks,
  garment: { spec: FitSpec; size: GarmentSize; result: SizeResult | null } | null,
): Scene {
  const d = bodyDims(body);
  const f = armFrame(body, L, d);
  const arm = armShape(f, d, L);
  const headH = L.crown - L.chin;
  const scene: Scene = {
    key: '',
    shapes: {
      body: bodyOutline(d, L),
      armR: arm,
      armL: arm.map(([x, y]): Pt => [2 * CX - x, y]),
      head: [P(0, L.crown - headH / 2), [headH * 0.37 * SCALE, (headH / 2) * SCALE]],
      shadow: [P(0, 0), [Math.max(d.hip, d.shoulder) * 1.5 * SCALE, 6]],
    },
    details: {},
    stress: {},
    intensity: {},
    bands: [],
    coversArms: false,
    garmentType: garment?.spec.garmentType ?? null,
    heights: { crown: Y(L.crown), ground: GROUND },
    buttons: [],
  };
  if (!garment) {
    scene.key = 'none';
    return scene;
  }

  const ctx: GarmentCtx = {
    body,
    L,
    d,
    f,
    spec: garment.spec,
    size: garment.size,
    result: garment.result,
  };
  const type = garment.spec.garmentType;
  const wristH = armAt(f, 1)[1];
  const sleeveAnchor = X(armAt(f, 1, d.wrist + 2)[0]);

  const addUpperBands = (u: Upper, zones: Zone[]) => {
    const add = (zone: Zone, top: number, bottom: number, clip: Band['clip'], anchor: number) =>
      zones.includes(zone) &&
      scene.bands.push({ zone, top: Y(top), bottom: Y(bottom), clip, anchorX: X(anchor) });
    add('shoulder', L.neckBase + 1, L.armpit + 1, 'main', u.widths.shoulder);
    add('bust', L.bust + 4, L.bust - 4, 'main', u.widths.bust);
    add('waist', L.waist + 3.5, L.waist - 3.5, 'main', u.widths.waist);
    add('hip', L.hip + 4, L.hip - 4, 'main', u.widths.hip);
    add('length', u.hemH + 5, u.hemH - 2, 'main', u.widths.hem);
    if (zones.includes('sleeve'))
      scene.bands.push({
        zone: 'sleeve',
        top: Y(wristH + 10),
        bottom: Y(wristH - 4),
        clip: 'sleeves',
        anchorX: sleeveAnchor,
      });
  };
  const zonesOf = () => (garment.result?.zones ?? []).map((z) => z.zone);

  const upperStress = (u: Upper) => {
    strainLines(
      'shoulder',
      ctx,
      'shoulder',
      L.neckBase - 5,
      Math.min(u.widths.shoulder, u.widths.bust) * 0.8,
      scene,
    );
    if (L.bust > u.hemH) strainLines('bust', ctx, 'bust', L.bust, u.widths.bust, scene);
    if (L.waist > u.hemH) strainLines('waist', ctx, 'waist', L.waist, u.widths.waist, scene);
    if (L.hip > u.hemH) strainLines('hip', ctx, 'hip', L.hip, u.widths.hip, scene);
  };

  if (type === 'trousers' || type === 'skirt') {
    scene.shapes.base = baseTop(ctx);
    if (type === 'trousers') {
      const t = trousers(ctx, { waistEase: 0.6 });
      scene.shapes.garment = t.outline;
      scene.details.crease = [P(t.widths.legC, L.hip - 6), P(t.widths.hemC, t.hemH + 1)];
      scene.details.creaseL = [P(-t.widths.legC, L.hip - 6), P(-t.widths.hemC, t.hemH + 1)];
      scene.details.waistband = [
        P(-t.widths.waist, t.waistH - 3.5),
        P(t.widths.waist, t.waistH - 3.5),
      ];
      strainLines('waist', ctx, 'waist', t.waistH - 2, t.widths.waist, scene);
      strainLines('hip', ctx, 'hip', L.hip, t.widths.hip, scene);
      const pool = Math.min(1, Math.max(0, -t.rawHem / 4));
      for (const side of [1, -1]) {
        scene.stress[`pool${side}`] = [
          P(side * (t.widths.hemC - t.widths.hemLeg), t.hemH + 3),
          P(side * t.widths.hemC, t.hemH + 1.5),
          P(side * (t.widths.hemC + t.widths.hemLeg), t.hemH + 3),
        ];
        scene.intensity[`pool${side}`] = pool;
      }
      const z = zonesOf();
      if (z.includes('waist'))
        scene.bands.push({
          zone: 'waist',
          top: Y(t.waistH + 1),
          bottom: Y(t.waistH - 5),
          clip: 'main',
          anchorX: X(t.widths.waist),
        });
      if (z.includes('hip'))
        scene.bands.push({
          zone: 'hip',
          top: Y(L.hip + 4),
          bottom: Y(L.hip - 4),
          clip: 'main',
          anchorX: X(t.widths.hip),
        });
      if (z.includes('inseam'))
        scene.bands.push({
          zone: 'inseam',
          top: Y(t.hemH + 9),
          bottom: Y(t.hemH - 1),
          clip: 'main',
          anchorX: X(t.widths.hemC + t.widths.hemLeg),
        });
    } else {
      const hemH = Math.max(0.5, hemHeight(garment.spec, garment.size, L) ?? L.knee);
      const waistW = garmentHalf(ctx, 'waist') ?? d.waist + 0.5;
      const hipW = garmentHalf(ctx, 'hip') ?? d.hip + 2;
      const flare = HEM_FLARE[garment.spec.fitStyle] * (hipW > d.hip + 3 ? 1.12 : 1);
      const hemW = Math.max(legOuter(d, L, hemH) + 1, hipW * flare);
      const wH = L.waist + 0.5;
      scene.shapes.garment = mirrorOutline(
        [
          P(0.01, wH),
          P(waistW, wH),
          P(lerp(waistW, Math.max(hipW, d.hip + 0.5), 0.7), lerp(wH, L.hip, 0.5)),
          P(Math.max(d.hip + 0.5, lerp(waistW, hemW, 0.45)), L.hip),
          P(lerp(hipW, hemW, 0.6), lerp(L.hip, hemH, 0.5)),
          P(hemW, hemH + 1),
          P(hemW, hemH),
          P(hemW - 1, hemH - 0.3),
          P(0.01, hemH - 0.9),
        ],
        CX,
      );
      for (let i = 0; i < 7; i++) {
        const t = (i - 3) / 3.4;
        scene.details[`pleat${i}`] = [P(t * waistW * 0.9, wH - 3), P(t * hemW * 0.92, hemH + 0.5)];
      }
      scene.details.waistband = [P(-waistW, wH - 3), P(waistW, wH - 3)];
      strainLines('waist', ctx, 'waist', wH - 1.5, waistW, scene);
      strainLines('hip', ctx, 'hip', L.hip, Math.max(d.hip + 0.5, hipW * 0.9), scene);
      const z = zonesOf();
      if (z.includes('waist'))
        scene.bands.push({
          zone: 'waist',
          top: Y(wH + 1),
          bottom: Y(wH - 5),
          clip: 'main',
          anchorX: X(waistW),
        });
      if (z.includes('hip'))
        scene.bands.push({
          zone: 'hip',
          top: Y(L.hip + 4),
          bottom: Y(L.hip - 4),
          clip: 'main',
          anchorX: X(hipW),
        });
      if (z.includes('length'))
        scene.bands.push({
          zone: 'length',
          top: Y(hemH + 5),
          bottom: Y(hemH - 2),
          clip: 'main',
          anchorX: X(hemW),
        });
    }
  } else if (type === 'agbada' || type === 'kaftan') {
    scene.coversArms = true;
    const hemH = Math.max(0.5, hemHeight(garment.spec, garment.size, L) ?? L.ankle);
    const wristOuter = armAt(f, 1, d.wrist + 3)[0];
    if (type === 'agbada') {
      const t = trousers(ctx, { taper: true, waistEase: 3 });
      scene.shapes.piece2 = t.outline;
      const span = Math.max((garment.size.measurements.shoulder ?? 70) / 2 + 3, wristOuter + 2);
      const bust = garmentHalf(ctx, 'bust') ?? d.bust + 20;
      const W = Math.max(span, Math.min(bust * 0.9, span + 8));
      scene.shapes.garment = mirrorOutline(
        [
          P(0.01, L.neckBase - 9),
          P(d.neck + 2.2, L.neckBase + 0.4),
          P(d.shoulder + 1, L.shoulder - 1),
          P(W * 0.85, L.shoulder - 6),
          P(W, L.armpit - 8),
          P(W, wristH - 2),
          P(W * 0.97, lerp(wristH, hemH, 0.5)),
          P(W * 0.95, hemH + 1),
          P(W * 0.95, hemH),
          P(W * 0.9, hemH - 0.3),
          P(0.01, hemH - 0.8),
        ],
        CX,
      );
      for (let i = 0; i < 4; i++) {
        const r = 4 + i * 2.8;
        scene.details[`embroidery${i}`] = [
          P(-r - 1, L.neckBase - 1),
          P(-r * 0.7, L.neckBase - r - 4),
          P(0, L.neckBase - r * 1.25 - 8),
          P(r * 0.7, L.neckBase - r - 4),
          P(r + 1, L.neckBase - 1),
        ];
      }
      scene.details.drapeR = [
        P(W * 0.55, L.shoulder - 5),
        P(W * 0.62, lerp(L.armpit, hemH, 0.5)),
        P(W * 0.58, hemH + 1),
      ];
      scene.details.drapeL = scene.details.drapeR.map(([x, y]): Pt => [2 * CX - x, y]);
      strainLines('bust', ctx, 'bust', L.bust, W * 0.7, scene);
      const z = zonesOf();
      if (z.includes('shoulder'))
        scene.bands.push({
          zone: 'shoulder',
          top: Y(L.neckBase + 1),
          bottom: Y(L.armpit),
          clip: 'main',
          anchorX: X(W * 0.8),
        });
      if (z.includes('bust'))
        scene.bands.push({
          zone: 'bust',
          top: Y(L.bust + 4),
          bottom: Y(L.bust - 4),
          clip: 'main',
          anchorX: X(W),
        });
      if (z.includes('length'))
        scene.bands.push({
          zone: 'length',
          top: Y(hemH + 5),
          bottom: Y(hemH - 2),
          clip: 'main',
          anchorX: X(W * 0.95),
        });
      if (z.includes('inseam'))
        scene.bands.push({
          zone: 'inseam',
          top: Y(t.hemH + 9),
          bottom: Y(t.hemH - 1),
          clip: 'legs',
          anchorX: X(t.widths.hemC + t.widths.hemLeg),
        });
    } else {
      const sh = (garment.size.measurements.shoulder ?? 44) / 2;
      const bust = garmentHalf(ctx, 'bust') ?? d.bust + 12;
      const hip = garmentHalf(ctx, 'hip') ?? d.hip + 10;
      const elbowH = armAt(f, 0.5)[1];
      const elbowOuter = armAt(f, 0.5, d.elbow + 4)[0];
      const hemW = Math.max(hip * 1.06, legOuter(d, L, hemH) + 2);
      scene.shapes.garment = mirrorOutline(
        [
          P(0.01, L.neckBase - 8),
          P(d.neck + 2.4, L.neckBase + 0.4),
          P(sh, L.shoulder - 2),
          P(elbowOuter, elbowH + 2),
          P(elbowOuter - 1, elbowH - 1.5),
          P(Math.max(bust, elbowOuter - 7), elbowH - 3),
          P(Math.max(bust * 0.98, d.waist + 4), L.waist),
          P(hip, L.hip),
          P(lerp(hip, hemW, 0.5), L.knee),
          P(hemW, hemH + 1),
          P(hemW, hemH),
          P(hemW - 1, hemH - 0.3),
          P(0.01, hemH - 0.8),
        ],
        CX,
      );
      for (let i = 0; i < 3; i++) {
        const r = 3 + i * 2;
        scene.details[`embroidery${i}`] = [
          P(-d.neck - 2.4 - i, L.neckBase),
          P(-r, L.neckBase - 6 - r),
          P(0, L.neckBase - 9 - r * 1.3),
          P(r, L.neckBase - 6 - r),
          P(d.neck + 2.4 + i, L.neckBase),
        ];
      }
      scene.details.slitR = [P(hemW * 0.92, L.knee - 4), P(hemW * 0.97, hemH + 0.5)];
      scene.details.slitL = [P(-hemW * 0.92, L.knee - 4), P(-hemW * 0.97, hemH + 0.5)];
      strainLines('bust', ctx, 'bust', L.bust, bust * 0.85, scene);
      strainLines('hip', ctx, 'hip', L.hip, hip * 0.85, scene);
      const z = zonesOf();
      if (z.includes('shoulder'))
        scene.bands.push({
          zone: 'shoulder',
          top: Y(L.neckBase + 1),
          bottom: Y(L.armpit + 1),
          clip: 'main',
          anchorX: X(sh),
        });
      if (z.includes('bust'))
        scene.bands.push({
          zone: 'bust',
          top: Y(L.bust + 4),
          bottom: Y(L.bust - 4),
          clip: 'main',
          anchorX: X(bust),
        });
      if (z.includes('hip'))
        scene.bands.push({
          zone: 'hip',
          top: Y(L.hip + 4),
          bottom: Y(L.hip - 4),
          clip: 'main',
          anchorX: X(hip),
        });
      if (z.includes('length'))
        scene.bands.push({
          zone: 'length',
          top: Y(hemH + 5),
          bottom: Y(hemH - 2),
          clip: 'main',
          anchorX: X(hemW),
        });
    }
  } else {
    // dress, top, shirt, jacket, suit
    const isJacket = type === 'jacket' || type === 'suit';
    if (type === 'suit') {
      const t = trousers(ctx, { waistEase: 1 });
      scene.shapes.piece2 = t.outline;
      scene.details.crease = [P(t.widths.legC, L.hip - 6), P(t.widths.hemC, t.hemH + 1)];
      scene.details.creaseL = [P(-t.widths.legC, L.hip - 6), P(-t.widths.hemC, t.hemH + 1)];
      if (zonesOf().includes('inseam'))
        scene.bands.push({
          zone: 'inseam',
          top: Y(t.hemH + 9),
          bottom: Y(t.hemH - 1),
          clip: 'legs',
          anchorX: X(t.widths.hemC + t.widths.hemLeg),
        });
    }
    const u = upperGarment(ctx, {
      sleeveless: type === 'dress' && garment.size.measurements.sleeve == null,
      neckDrop: isJacket
        ? 20
        : type === 'shirt'
          ? 3
          : type === 'top'
            ? 7
            : garment.spec.fitStyle === 'regular'
              ? 13
              : 5,
      collar: type === 'shirt',
    });
    scene.shapes.garment = u.outline;
    if (u.sleeves) {
      scene.shapes.sleeveR = u.sleeves[0];
      scene.shapes.sleeveL = u.sleeves[1];
    }
    if (type !== 'dress' && type !== 'suit' && u.hemH > L.knee)
      scene.shapes.base = baseTrousers(ctx);
    if (isJacket) scene.shapes.shirt = baseTop(ctx);
    if (isJacket) {
      const buttonH = Math.max(u.hemH + 4, Math.min(L.waist - 2, lerp(L.waist, u.hemH, 0.2)));
      scene.details.lapelR = [
        P(d.neck + 2.2, L.neckBase + 0.2),
        P(u.widths.bust * 0.45, L.armpit - 2),
        P(1.4, buttonH + 2),
      ];
      scene.details.lapelL = [
        P(-d.neck - 2.2, L.neckBase + 0.2),
        P(-u.widths.bust * 0.45, L.armpit - 2),
        P(-1.4, buttonH + 2),
      ];
      scene.details.front = [P(0.6, buttonH + 2), P(0.8, u.hemH + 0.4)];
      scene.buttons = [P(0, buttonH), ...(u.hemH < L.hip ? [P(0, buttonH - 10)] : [])];
      if (u.hemH < L.hip - 4)
        scene.details.pocketR = [
          P(u.widths.hip * 0.35, L.hip + 1),
          P(u.widths.hip * 0.8, L.hip + 1),
        ];
      if (u.hemH < L.hip - 4)
        scene.details.pocketL = [
          P(-u.widths.hip * 0.35, L.hip + 1),
          P(-u.widths.hip * 0.8, L.hip + 1),
        ];
    } else if (type === 'shirt') {
      scene.details.placket = [P(0, L.neckBase - 3), P(0, u.hemH + 1)];
      scene.details.collarR = [
        P(0, L.neckBase - 3),
        P(d.neck + 2.6, L.neckBase - 2.5),
        P(d.neck + 1.4, L.neckBase + 1.2),
      ];
      scene.details.collarL = [
        P(0, L.neckBase - 3),
        P(-d.neck - 2.6, L.neckBase - 2.5),
        P(-d.neck - 1.4, L.neckBase + 1.2),
      ];
      const n = 6;
      scene.buttons = Array.from({ length: n }, (_, i) =>
        P(0, lerp(L.neckBase - 5, u.hemH + 6, i / (n - 1))),
      );
    } else if (type === 'dress' && garment.spec.fitStyle === 'regular') {
      scene.details.wrap = [
        P(-d.neck - 2.6, L.neckBase),
        P(-u.widths.bust * 0.2, L.bust - 2),
        P(u.widths.waist * 0.85, L.waist - 1),
      ];
      scene.details.wrapSkirt = [
        P(u.widths.waist * 0.85, L.waist - 1),
        P(u.widths.hip * 0.4, L.hip - 6),
        P(u.widths.hem * 0.25, u.hemH),
      ];
      scene.details.tie = [
        P(u.widths.waist * 0.85, L.waist - 1),
        P(u.widths.waist * 0.95, L.waist - 9),
        P(u.widths.waist * 0.8, L.waist - 15),
      ];
    } else if (type === 'dress') {
      scene.details.dartR = [
        P(u.widths.bust * 0.5, L.bust - 3),
        P(u.widths.waist * 0.5, L.waist),
        P(u.widths.hip * 0.45, L.hip - 3),
      ];
      scene.details.dartL = [
        P(-u.widths.bust * 0.5, L.bust - 3),
        P(-u.widths.waist * 0.5, L.waist),
        P(-u.widths.hip * 0.45, L.hip - 3),
      ];
    } else if (type === 'top') {
      scene.details.yoke = [
        P(-u.widths.shoulder * 0.9, L.shoulder - 3),
        P(0, L.shoulder - 3.5),
        P(u.widths.shoulder * 0.9, L.shoulder - 3),
      ];
    }
    upperStress(u);
    addUpperBands(u, zonesOf());
  }

  scene.key = [
    type,
    ...Object.entries(scene.shapes).map(([k, v]) => `${k}${v.length}`),
    ...Object.entries(scene.details).map(([k, v]) => `${k}${v.length}`),
    Object.keys(scene.stress).length,
    scene.buttons.length,
  ].join('|');
  return scene;
}
