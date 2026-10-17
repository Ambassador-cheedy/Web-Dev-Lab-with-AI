import { getLandmarks, hemlineHeight, locateHem, resolveBody, type HemPosition } from './body';
import { LENGTH_FROM_WAIST, ZONE_WEIGHTS } from './weights';
import type {
  BodyProfile,
  EaseRange,
  FitReport,
  FitSpec,
  GarmentSize,
  Landmarks,
  OptionalMeasurement,
  ResolvedBody,
  SizeResult,
  Zone,
  ZoneResult,
  ZoneStatus,
} from './types';

/** Below this best score, no standard size fits well and made to measure is suggested. */
export const MADE_TO_MEASURE_THRESHOLD = 60;

/** Circumference zones, where stretch fabric can absorb negative ease. */
const CIRCUMFERENCE: Zone[] = ['bust', 'waist', 'hip'];
/** Fraction of the body measurement a fully stretchy (stretch = 1) fabric can give. */
const STRETCH_ALLOWANCE = 0.12;
/** Tolerance either side of the intended hem, cm. */
const HEM_TOLERANCE = 4;

const BODY_KEY: Partial<Record<Zone, keyof ResolvedBody['m']>> = {
  shoulder: 'shoulder',
  bust: 'bust',
  waist: 'waist',
  hip: 'hip',
  sleeve: 'arm',
  inseam: 'inseam',
};

/** Score falloff (Gaussian sigma, cm) outside the ideal range. Tight is less forgiving than loose. */
function sigma(zone: Zone, side: 'under' | 'over', stretch: number) {
  if (zone === 'length') return 9;
  if (zone === 'sleeve' || zone === 'inseam') return side === 'under' ? 4 : 6;
  if (zone === 'shoulder') return side === 'under' ? 2.5 : 4;
  return side === 'under' ? 4 * (1 + stretch) : 8;
}

function falloff(deviation: number, s: number) {
  return 100 * Math.exp(-((deviation / s) ** 2));
}

/**
 * Inside the ideal range a zone scores 96–100, highest at the centre of the range.
 * This separates sizes that are all "ideal" in favour of the one closest to the design intent.
 */
function idealScore(ease: number, range: EaseRange) {
  const half = (range.max - range.min) / 2;
  if (half <= 0) return 100;
  const centre = (range.max + range.min) / 2;
  return 100 - 4 * Math.min(1, Math.abs(ease - centre) / half);
}

function zoneScore(zone: Zone, status: ZoneStatus, ease: number, deviation: number, range: EaseRange, stretch: number) {
  if (status === 'ideal') return idealScore(ease, range);
  return falloff(deviation, sigma(zone, status === 'tight' ? 'under' : 'over', stretch));
}

/** Plain-English verdict for a zone. */
export function zoneLabel(zone: Zone, status: ZoneStatus, deviation: number): string {
  const lengthLike = zone === 'length' || zone === 'sleeve' || zone === 'inseam';
  if (status === 'ideal') return 'ideal';
  const strength = deviation <= 2 ? 0 : deviation <= 6 ? 1 : 2;
  if (lengthLike) {
    const word = status === 'tight' ? 'short' : 'long';
    return [`slightly ${word}`, word, `too ${word}`][strength]!;
  }
  if (status === 'tight') return ['snug', 'tight', 'too tight'][strength]!;
  return ['relaxed', 'loose', 'too loose'][strength]!;
}

function effectiveRange(zone: Zone, range: EaseRange, stretch: number, bodyValue: number): EaseRange {
  if (!CIRCUMFERENCE.includes(zone) || stretch <= 0) return range;
  return { min: range.min - stretch * STRETCH_ALLOWANCE * bodyValue, max: range.max };
}

function classify(ease: number, range: EaseRange): { status: ZoneStatus; deviation: number } {
  if (ease < range.min) return { status: 'tight', deviation: range.min - ease };
  if (ease > range.max) return { status: 'loose', deviation: ease - range.max };
  return { status: 'ideal', deviation: 0 };
}

/** Height from the floor at which this size's hem lands. */
export function hemHeight(spec: FitSpec, size: GarmentSize, L: Landmarks): number | null {
  const length = size.measurements.length;
  if (length == null) return null;
  const from = LENGTH_FROM_WAIST.includes(spec.garmentType) ? L.waist : L.neckBase;
  return from - length;
}

/** Height from the floor at which this size's trouser hem lands. */
export function trouserHemHeight(size: GarmentSize, L: Landmarks): number | null {
  const inseam = size.measurements.inseam;
  return inseam == null ? null : L.crotch - inseam;
}

export function evaluateSize(body: ResolvedBody, spec: FitSpec, size: GarmentSize): SizeResult {
  const L = getLandmarks(body);
  const weights = ZONE_WEIGHTS[spec.garmentType];
  const zones: ZoneResult[] = [];

  for (const [zone, range] of Object.entries(spec.idealEase) as [Zone, EaseRange][]) {
    if (zone === 'length') continue;
    const garment = size.measurements[zone];
    const bodyKey = BODY_KEY[zone];
    if (garment == null || !bodyKey) continue;
    const bodyValue = body.m[bodyKey];
    const ease = garment - bodyValue;
    const r = effectiveRange(zone, range, spec.stretch, bodyValue);
    const { status, deviation } = classify(ease, r);
    const estimated = !!body.estimated[bodyKey as OptionalMeasurement];
    const baseWeight = weights[zone] ?? 1;
    zones.push({
      zone,
      status,
      label: zoneLabel(zone, status, deviation),
      ease,
      deviation,
      score: zoneScore(zone, status, ease, deviation, r, spec.stretch),
      weight: estimated ? baseWeight * 0.5 : baseWeight,
      estimated,
    });
  }

  const hem = hemHeight(spec, size, L);
  if (hem != null) {
    const position = locateHem(hem, L);
    if (spec.intendedHem) {
      const target = hemlineHeight(spec.intendedHem, L);
      // Positive = the hem falls lower than designed (longer).
      const diff = target - hem;
      const hemRange = { min: -HEM_TOLERANCE, max: HEM_TOLERANCE };
      const { status, deviation } = classify(diff, hemRange);
      zones.push({
        zone: 'length',
        status,
        label: zoneLabel('length', status, deviation),
        ease: diff,
        deviation,
        score: zoneScore('length', status, diff, deviation, hemRange, 0),
        weight: weights.length ?? 1,
        estimated: false,
        detail: describeHem(position),
        hem: position,
      });
    }
  }

  return { size: size.label, score: Math.round(combineScores(zones)), zones };
}

/**
 * Size score: the weighted average of zone scores, tempered by the worst important
 * zone. A plain average would let three perfect zones hide a bust that cannot close;
 * the worst-zone factor (each zone's score raised to its relative weight) stops that,
 * while barely moving sizes whose zones are all close to ideal.
 */
export function combineScores(zones: ZoneResult[]): number {
  const totalWeight = zones.reduce((n, z) => n + z.weight, 0);
  if (!totalWeight) return 0;
  const mean = zones.reduce((n, z) => n + z.score * z.weight, 0) / totalWeight;
  const maxWeight = Math.max(...zones.map((z) => z.weight));
  const worst = Math.min(...zones.map((z) => (z.score / 100) ** (z.weight / maxWeight)));
  return mean * (0.5 + 0.5 * worst);
}

export function evaluateFit(profile: BodyProfile, spec: FitSpec): FitReport {
  const body = resolveBody(profile);
  const sizes = spec.sizes.map((s) => evaluateSize(body, spec, s));
  if (!sizes.length) {
    return { recommendedSize: '', bestScore: 0, sizes, suggestMadeToMeasure: true, summary: 'No sizes available.' };
  }
  let best = sizes[0]!;
  for (const s of sizes) if (s.score > best.score) best = s;
  const idx = sizes.indexOf(best);
  const neighbours = [sizes[idx - 1], sizes[idx + 1]].filter((s): s is SizeResult => !!s);
  const runnerUp = neighbours.sort((a, b) => b.score - a.score)[0];
  const betweenSizes: [string, string] | undefined =
    runnerUp && best.score - runnerUp.score <= 6 && runnerUp.score >= MADE_TO_MEASURE_THRESHOLD
      ? (sizes.indexOf(runnerUp) < idx ? [runnerUp.size, best.size] : [best.size, runnerUp.size])
      : undefined;
  const suggestMadeToMeasure = best.score < MADE_TO_MEASURE_THRESHOLD;
  return {
    recommendedSize: best.size,
    bestScore: best.score,
    sizes,
    suggestMadeToMeasure,
    betweenSizes,
    summary: summarise(best, suggestMadeToMeasure, betweenSizes),
  };
}

const ZONE_NAMES: Record<Zone, string> = {
  shoulder: 'shoulder',
  bust: 'bust',
  waist: 'waist',
  hip: 'hip',
  length: 'length',
  sleeve: 'sleeve',
  inseam: 'leg length',
};

/** e.g. "ideal at bust and waist, slightly loose at hip" */
export function describeSize(result: SizeResult, chestWord: 'bust' | 'chest' = 'bust'): string {
  const name = (z: Zone) => (z === 'bust' ? chestWord : ZONE_NAMES[z]);
  const ideal = result.zones.filter((z) => z.status === 'ideal' && z.zone !== 'length').map((z) => name(z.zone));
  const off = result.zones.filter((z) => z.status !== 'ideal');
  const parts: string[] = [];
  if (ideal.length) parts.push(`ideal at ${joinWords(ideal)}`);
  for (const z of off) {
    parts.push(z.zone === 'length' || z.zone === 'sleeve' || z.zone === 'inseam' ? `${z.label} in the ${name(z.zone)}` : `${z.label} at the ${name(z.zone)}`);
  }
  return parts.join(', ') || 'no fit data';
}

function joinWords(words: string[]) {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

function summarise(best: SizeResult, mtm: boolean, between?: [string, string]): string {
  if (mtm) return 'No standard size fits you well. This piece would fit you best made to measure.';
  const issues = best.zones.filter((z) => z.status !== 'ideal').sort((a, b) => b.deviation * b.weight - a.deviation * a.weight);
  const worst = issues[0];
  const note = worst
    ? `, ${worst.label} ${worst.zone === 'length' || worst.zone === 'sleeve' || worst.zone === 'inseam' ? 'in the' : 'at the'} ${ZONE_NAMES[worst.zone]}`
    : '';
  const lead =
    best.score >= 88
      ? `A beautiful fit in size ${best.size}`
      : best.score >= 72
        ? `Size ${best.size} fits you well${note}`
        : `Size ${best.size} is your closest fit${note}`;
  const tail = between ? `. You are between ${between[0]} and ${between[1]}: size up for more ease.` : '.';
  return lead + tail;
}

/** Human description of where a hem lands, in cm. UI can reformat with formatHem. */
export function describeHem(p: HemPosition): string {
  if (p.landmark === 'the floor') return 'touches the floor';
  const d = Math.round(Math.abs(p.offset));
  if (d <= 1) return `lands at ${p.landmark}`;
  return `falls ${d} cm ${p.offset > 0 ? 'below' : 'above'} ${p.landmark}`;
}
