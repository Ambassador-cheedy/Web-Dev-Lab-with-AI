import type { BodyBase, FitSpec } from '@/lib/fit/types';

export type Category = 'dresses' | 'suits' | 'tops' | 'trousers' | 'outerwear' | 'occasion';

export type Colour = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Whole pounds sterling. */
  price: number;
  category: Category;
  line: BodyBase;
  colours: Colour[];
  images: string[];
  /** One-line editorial description used on cards and metadata. */
  tagline: string;
  description: string;
  fabric: string;
  care: string[];
  details: string[];
  collections: string[];
  fitStudio: FitSpec;
  madeToMeasure: boolean;
  /** Made-to-measure starting price, whole pounds. */
  madeToMeasurePrice?: number;
  related?: string[];
  isNew?: boolean;
  limited?: boolean;
};

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export type ProductFilter = {
  category?: Category;
  collection?: string;
  sizes?: string[];
  colours?: string[];
  minPrice?: number;
  maxPrice?: number;
  line?: BodyBase;
  fitStudioOnly?: boolean;
  sort?: SortKey;
};

export type Collection = {
  slug: string;
  name: string;
  description: string;
  image: string;
  /** If set, the collection is a category view. */
  category?: Category;
};
