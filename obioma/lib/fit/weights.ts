import type { GarmentType, Zone } from './types';

/** How much each zone matters to the overall fit of a garment type. */
export const ZONE_WEIGHTS: Record<GarmentType, Partial<Record<Zone, number>>> = {
  dress: { bust: 3, waist: 3, hip: 2, shoulder: 1.5, length: 1, sleeve: 0.5 },
  top: { bust: 3, shoulder: 2, waist: 1.5, length: 1, sleeve: 1 },
  shirt: { bust: 3, shoulder: 2.5, waist: 1.5, sleeve: 1.5, length: 0.8 },
  jacket: { shoulder: 3.5, bust: 3, waist: 1.5, hip: 1, sleeve: 1.5, length: 1 },
  trousers: { waist: 3, hip: 2.5, inseam: 1.5 },
  skirt: { waist: 3, hip: 2.5, length: 1 },
  suit: { shoulder: 3, bust: 3, waist: 2.5, hip: 1.5, sleeve: 1.5, inseam: 1, length: 1 },
  agbada: { shoulder: 1, bust: 1.5, length: 2, inseam: 0.8 },
  kaftan: { bust: 2, hip: 1.5, shoulder: 1, length: 1.5 },
};

/** Garment types whose `length` is measured from the waist rather than the shoulder. */
export const LENGTH_FROM_WAIST: GarmentType[] = ['skirt'];
