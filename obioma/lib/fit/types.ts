/**
 * Fit engine types. Everything in lib/fit is pure and renderer-agnostic:
 * all values are centimetres unless stated otherwise.
 */

export type Zone = 'shoulder' | 'bust' | 'waist' | 'hip' | 'length' | 'sleeve' | 'inseam';

export const ZONES: Zone[] = ['shoulder', 'bust', 'waist', 'hip', 'length', 'sleeve', 'inseam'];

export type GarmentType =
  | 'dress'
  | 'top'
  | 'shirt'
  | 'jacket'
  | 'trousers'
  | 'skirt'
  | 'suit'
  | 'agbada'
  | 'kaftan';

export type FitStyle = 'fitted' | 'regular' | 'relaxed' | 'oversized';

/** Where a hem is designed to land on the body. */
export type Hemline =
  | 'waist'
  | 'hip'
  | 'upper-thigh'
  | 'mid-thigh'
  | 'above-knee'
  | 'knee'
  | 'below-knee'
  | 'midi'
  | 'ankle'
  | 'floor';

export type GarmentSize = {
  label: string;
  /** Garment's actual circumference (for bust/waist/hip) or length, in cm. */
  measurements: Partial<Record<Zone, number>>;
};

export type EaseRange = { min: number; max: number };

export type FitSpec = {
  enabled: boolean;
  garmentType: GarmentType;
  fitStyle: FitStyle;
  idealEase: Partial<Record<Zone, EaseRange>>;
  /** 0–1, how much negative ease the fabric tolerates. */
  stretch: number;
  sizes: GarmentSize[];
  /** Where the hem is designed to fall. Used to score `length`. */
  intendedHem?: Hemline;
};

export type BodyBase = 'womenswear' | 'menswear';

export type BodyMeasurements = {
  height: number;
  bust: number;
  waist: number;
  hip: number;
  shoulder?: number;
  arm?: number;
  inseam?: number;
  neck?: number;
  thigh?: number;
  upperArm?: number;
};

export type OptionalMeasurement = Exclude<keyof BodyMeasurements, 'height' | 'bust' | 'waist' | 'hip'>;

export type BodyProfile = {
  base: BodyBase;
  measurements: BodyMeasurements;
};

/** Body measurements with every optional value filled (provided or estimated). */
export type ResolvedBody = {
  base: BodyBase;
  m: Required<BodyMeasurements>;
  estimated: Partial<Record<OptionalMeasurement, true>>;
};

/** Heights from the floor, in cm. */
export type Landmarks = {
  crown: number;
  chin: number;
  neckBase: number;
  shoulder: number;
  armpit: number;
  bust: number;
  waist: number;
  hip: number;
  crotch: number;
  midThigh: number;
  knee: number;
  midCalf: number;
  ankle: number;
  wrist: number;
  floor: number;
};

export type ZoneStatus = 'tight' | 'ideal' | 'loose';

export type ZoneResult = {
  zone: Zone;
  status: ZoneStatus;
  /** Plain-English verdict, e.g. "snug", "ideal", "relaxed", "too long". */
  label: string;
  /** garment − body, cm. For length: hem position vs intended (positive = longer). */
  ease: number;
  /** cm outside the ideal range (0 when ideal). */
  deviation: number;
  score: number;
  weight: number;
  /** True when the body measurement was estimated from proportions. */
  estimated: boolean;
  /** For length: where the hem lands, e.g. "4 cm below the knee". */
  detail?: string;
};

export type SizeResult = {
  size: string;
  score: number;
  zones: ZoneResult[];
};

export type FitReport = {
  recommendedSize: string;
  bestScore: number;
  sizes: SizeResult[];
  suggestMadeToMeasure: boolean;
  summary: string;
};
