import { describe, expect, it } from 'vitest';
import { evaluateFit, evaluateSize, describeSize, MADE_TO_MEASURE_THRESHOLD } from './engine';
import { getLandmarks, hemlineHeight, resolveBody } from './body';
import type { BodyProfile, FitSpec } from './types';
import { products } from '@/data/products';

const spec = (slug: string): FitSpec => products.find((p) => p.slug === slug)!.fitStudio;

/** UK size 12 woman, 165 cm, all measurements given. */
const womanM: BodyProfile = {
  base: 'womenswear',
  measurements: { height: 165, bust: 92, waist: 74, hip: 99, shoulder: 38, arm: 59, inseam: 75 },
};

const manM: BodyProfile = {
  base: 'menswear',
  measurements: { height: 178, bust: 98, waist: 84, hip: 100, shoulder: 46, arm: 63, inseam: 81 },
};

const zone = (r: ReturnType<typeof evaluateSize>, z: string) => r.zones.find((x) => x.zone === z)!;

describe('fit engine', () => {
  it('finds an ideal fit for a standard body in its own size', () => {
    const report = evaluateFit(womanM, spec('adaeze-column-dress'));
    expect(report.recommendedSize).toBe('M');
    expect(report.bestScore).toBeGreaterThanOrEqual(90);
    expect(report.suggestMadeToMeasure).toBe(false);
    const m = report.sizes.find((s) => s.size === 'M')!;
    for (const z of ['bust', 'waist', 'hip']) expect(zone(m, z).status).toBe('ideal');
    expect(zone(m, 'bust').ease).toBe(6);
    expect(zone(m, 'length').status).toBe('ideal');
  });

  it('flags a size that is too small as tight, with a falling score', () => {
    const body = resolveBody(womanM);
    const xs = evaluateSize(body, spec('adaeze-column-dress'), spec('adaeze-column-dress').sizes[0]!);
    expect(zone(xs, 'bust').status).toBe('tight');
    expect(zone(xs, 'bust').ease).toBe(-6);
    expect(zone(xs, 'bust').label).toBe('too tight');
    expect(xs.score).toBeLessThan(30);
  });

  it('flags a size that is too large as loose', () => {
    const body = resolveBody(womanM);
    const s = spec('adaeze-column-dress');
    const xxl = evaluateSize(body, s, s.sizes[5]!);
    expect(zone(xxl, 'waist').status).toBe('loose');
    expect(zone(xxl, 'hip').status).toBe('loose');
    expect(['loose', 'too loose']).toContain(zone(xxl, 'hip').label);
    expect(xxl.score).toBeLessThan(evaluateSize(body, s, s.sizes[2]!).score);
  });

  it('reports a body between sizes', () => {
    // Bust and hip between M (92/99) and L (99/106); waist between too.
    const between: BodyProfile = {
      base: 'womenswear',
      measurements: { height: 166, bust: 95.5, waist: 77.5, hip: 102.5, shoulder: 38.7 },
    };
    const report = evaluateFit(between, spec('nneka-wrap-dress'));
    expect(['M', 'L']).toContain(report.recommendedSize);
    expect(report.betweenSizes).toEqual(['M', 'L']);
    expect(report.summary).toMatch(/between M and L/);
  });

  it('lets stretch fabric absorb negative ease', () => {
    const knit = spec('ifeoma-rib-knit-dress');
    const body = resolveBody(womanM);
    // Size S knit: bust 83 on a 92 bust = −9 cm, which a rigid fabric could not take.
    const s = evaluateSize(body, knit, knit.sizes[1]!);
    const rigid = evaluateSize(body, { ...knit, stretch: 0 }, knit.sizes[1]!);
    expect(zone(s, 'bust').ease).toBe(-9);
    expect(zone(s, 'bust').status).toBe('ideal');
    expect(zone(rigid, 'bust').status).toBe('tight');
    expect(s.score).toBeGreaterThan(rigid.score);
    expect(evaluateFit(womanM, knit).recommendedSize).toMatch(/^(S|M)$/);
  });

  it('estimates missing optional measurements and down-weights them', () => {
    const minimal: BodyProfile = { base: 'menswear', measurements: { height: 178, bust: 98, waist: 84, hip: 100 } };
    const body = resolveBody(minimal);
    expect(body.estimated.shoulder).toBe(true);
    expect(body.m.shoulder).toBeCloseTo(45.9, 0);
    const suit = spec('obi-two-piece-suit');
    const report = evaluateFit(minimal, suit);
    expect(report.recommendedSize).toBe('M');
    const m = report.sizes.find((s) => s.size === 'M')!;
    expect(zone(m, 'shoulder').estimated).toBe(true);
    expect(zone(m, 'bust').estimated).toBe(false);
    expect(zone(m, 'shoulder').weight).toBeLessThan(zone(m, 'bust').weight);
    // A full profile gives the same answer.
    expect(evaluateFit(manM, suit).recommendedSize).toBe('M');
  });

  it('places hems relative to height', () => {
    const dress = spec('adaeze-column-dress');
    const tall = evaluateFit({ base: 'womenswear', measurements: { ...womanM.measurements, height: 185, inseam: undefined, arm: undefined } }, dress);
    const m = tall.sizes.find((s) => s.size === 'M')!;
    // On a much taller body the midi dress rides up towards the knee.
    expect(zone(m, 'length').status).toBe('tight');
    expect(zone(m, 'length').label).toMatch(/short/);
    expect(zone(m, 'length').detail).toMatch(/(above|below|at) (the knee|mid-calf)/);
  });

  it('suggests made to measure when nothing fits', () => {
    const outlier: BodyProfile = {
      base: 'womenswear',
      measurements: { height: 160, bust: 132, waist: 70, hip: 96 },
    };
    const report = evaluateFit(outlier, spec('adaeze-column-dress'));
    expect(report.bestScore).toBeLessThan(MADE_TO_MEASURE_THRESHOLD);
    expect(report.suggestMadeToMeasure).toBe(true);
    expect(report.summary).toMatch(/made to measure/);
  });

  it('handles trousers by inseam and the agbada by its generous ease', () => {
    expect(evaluateFit(womanM, spec('chioma-tailored-trousers')).recommendedSize).toBe('M');
    expect(evaluateFit(manM, spec('uche-linen-trousers')).recommendedSize).toBe('M');
    const agbada = evaluateFit(manM, spec('ugo-agbada-ceremonial-set'));
    expect(agbada.suggestMadeToMeasure).toBe(false);
    expect(agbada.bestScore).toBeGreaterThan(80);
  });

  it('recommends every enabled product in the matching standard size', () => {
    for (const p of products.filter((x) => x.fitStudio.enabled)) {
      const body = p.line === 'menswear' ? manM : womanM;
      const report = evaluateFit(body, p.fitStudio);
      expect(report.suggestMadeToMeasure, p.slug).toBe(false);
      expect(['S', 'M', 'L'], p.slug).toContain(report.recommendedSize);
    }
  });

  it('describes a size in plain English', () => {
    const body = resolveBody(womanM);
    const s = spec('adaeze-column-dress');
    const text = describeSize(evaluateSize(body, s, s.sizes[3]!));
    expect(text).toMatch(/ideal at/);
    expect(text).toMatch(/at the (waist|hip)/);
  });

  it('computes sensible landmarks', () => {
    const L = getLandmarks(resolveBody(womanM));
    expect(L.neckBase).toBeGreaterThan(L.bust);
    expect(L.bust).toBeGreaterThan(L.waist);
    expect(L.waist).toBeGreaterThan(L.hip);
    expect(L.hip).toBeGreaterThan(L.crotch);
    expect(L.crotch).toBeGreaterThan(L.knee);
    expect(L.knee).toBeGreaterThan(L.midCalf);
    expect(hemlineHeight('midi', L)).toBeCloseTo(L.midCalf);
  });
});
