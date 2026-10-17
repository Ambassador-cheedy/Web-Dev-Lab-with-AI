import { describe, expect, it } from 'vitest';
import { formatEase, fromDisplay, toDisplay } from './units';

describe('units', () => {
  it('round-trips inches', () => {
    expect(fromDisplay(toDisplay(91.44, 'in', 3), 'in')).toBeCloseTo(91.44, 2);
  });
  it('formats signed ease', () => {
    expect(formatEase(6.2, 'cm')).toBe('+6 cm');
    expect(formatEase(-2, 'cm')).toBe('−2 cm');
  });
});
