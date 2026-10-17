import type {
  BodyBase,
  BodyProfile,
  Hemline,
  Landmarks,
  OptionalMeasurement,
  ResolvedBody,
} from './types';

/**
 * Anthropometric ratios used when optional measurements are missing, and to place
 * landmarks on the body. They are deliberately simple averages: good enough to
 * position a hem or estimate a shoulder, never presented to the user as fact.
 */
const RATIOS: Record<
  BodyBase,
  {
    shoulder: number;
    arm: number;
    inseam: number;
    neckFromBust: number;
    thighFromHip: number;
    upperArmFromBust: number;
    chin: number;
    neckBase: number;
    shoulderH: number;
    armpit: number;
    bustH: number;
    waistH: number;
    hipH: number;
  }
> = {
  womenswear: {
    shoulder: 0.231,
    arm: 0.358,
    inseam: 0.455,
    neckFromBust: 0.37,
    thighFromHip: 0.58,
    upperArmFromBust: 0.3,
    chin: 0.875,
    neckBase: 0.835,
    shoulderH: 0.815,
    armpit: 0.75,
    bustH: 0.725,
    waistH: 0.615,
    hipH: 0.515,
  },
  menswear: {
    shoulder: 0.258,
    arm: 0.354,
    inseam: 0.455,
    neckFromBust: 0.39,
    thighFromHip: 0.56,
    upperArmFromBust: 0.32,
    chin: 0.87,
    neckBase: 0.83,
    shoulderH: 0.81,
    armpit: 0.745,
    bustH: 0.72,
    waistH: 0.6,
    hipH: 0.51,
  },
};

export function estimateOptional(
  base: BodyBase,
  m: BodyProfile['measurements'],
): Record<OptionalMeasurement, number> {
  const r = RATIOS[base];
  return {
    shoulder: m.height * r.shoulder,
    arm: m.height * r.arm,
    inseam: m.height * r.inseam,
    neck: m.bust * r.neckFromBust,
    thigh: m.hip * r.thighFromHip,
    upperArm: m.bust * r.upperArmFromBust,
  };
}

const OPTIONAL: OptionalMeasurement[] = ['shoulder', 'arm', 'inseam', 'neck', 'thigh', 'upperArm'];

/** Fill every optional measurement, remembering which ones were estimated. */
export function resolveBody(profile: BodyProfile): ResolvedBody {
  const est = estimateOptional(profile.base, profile.measurements);
  const m = { ...profile.measurements } as ResolvedBody['m'];
  const estimated: ResolvedBody['estimated'] = {};
  for (const key of OPTIONAL) {
    const v = profile.measurements[key];
    if (v == null || !Number.isFinite(v) || v <= 0) {
      m[key] = est[key];
      estimated[key] = true;
    }
  }
  return { base: profile.base, m, estimated };
}

/** Landmark heights from the floor (cm). */
export function getLandmarks(body: ResolvedBody): Landmarks {
  const r = RATIOS[body.base];
  const h = body.m.height;
  const crotch = Math.min(body.m.inseam, h * 0.52);
  const hip = Math.max(h * r.hipH, crotch + 4);
  const knee = crotch * 0.626;
  const shoulder = h * r.shoulderH;
  return {
    crown: h,
    chin: h * r.chin,
    neckBase: h * r.neckBase,
    shoulder,
    armpit: h * r.armpit,
    bust: h * r.bustH,
    waist: Math.max(h * r.waistH, hip + 6),
    hip,
    crotch,
    midThigh: (crotch + knee) / 2,
    knee,
    midCalf: crotch * 0.375,
    ankle: h * 0.04,
    wrist: shoulder - body.m.arm * 0.97,
    floor: 0,
  };
}

/** The height a hemline is designed to land at on this body. */
export function hemlineHeight(hemline: Hemline, L: Landmarks): number {
  switch (hemline) {
    case 'waist':
      return L.waist;
    case 'hip':
      return L.hip;
    case 'upper-thigh':
      return L.crotch - 6;
    case 'mid-thigh':
      return L.midThigh;
    case 'above-knee':
      return L.knee + 8;
    case 'knee':
      return L.knee;
    case 'below-knee':
      return L.knee - 7;
    case 'midi':
      return L.midCalf;
    case 'ankle':
      return L.ankle + 3;
    case 'floor':
      return 1.5;
  }
}

export type HemPosition = { height: number; landmark: string; offset: number };

const NAMED: { key: keyof Landmarks; name: string }[] = [
  { key: 'waist', name: 'the waist' },
  { key: 'hip', name: 'the hip' },
  { key: 'crotch', name: 'the top of the thigh' },
  { key: 'midThigh', name: 'mid-thigh' },
  { key: 'knee', name: 'the knee' },
  { key: 'midCalf', name: 'mid-calf' },
  { key: 'ankle', name: 'the ankle' },
];

/** Where a hem at `height` sits, relative to the nearest landmark. offset > 0 = below it. */
export function locateHem(height: number, L: Landmarks): HemPosition {
  if (height <= 1) return { height, landmark: 'the floor', offset: 0 };
  let best = NAMED[0]!;
  for (const n of NAMED) if (Math.abs(L[n.key] - height) < Math.abs(L[best.key] - height)) best = n;
  return { height, landmark: best.name, offset: L[best.key] - height };
}
