import type { Collection } from '@/lib/catalog/types';
import { img } from './images';

export const collections: Collection[] = [
  {
    slug: 'harmattan',
    name: 'The Harmattan Collection',
    description:
      'Dry-season tailoring in sand, oxblood and obsidian. Clean lines, soft shoulders, nothing extra.',
    image: img.womanEditorial,
  },
  {
    slug: 'womenswear',
    name: 'Womenswear',
    description: 'Dresses, tailoring and evening pieces, cut for real proportions.',
    image: img.womanStudio,
  },
  {
    slug: 'menswear',
    name: 'Menswear',
    description: 'Natural-shouldered tailoring, easy linen and ceremonial dress.',
    image: img.manSuit,
  },
  {
    slug: 'dresses',
    name: 'Dresses',
    category: 'dresses',
    description: 'From the fitted column to the easy wrap.',
    image: img.dressFloat,
  },
  {
    slug: 'suits',
    name: 'Suits',
    category: 'suits',
    description: 'Half-canvassed and finished by hand.',
    image: img.manSuitDetail,
  },
  {
    slug: 'tops',
    name: 'Tops & Shirts',
    category: 'tops',
    description: 'Silk, oxford and cashmere.',
    image: img.womanSoft,
  },
  {
    slug: 'trousers',
    name: 'Trousers',
    category: 'trousers',
    description: 'Pressed, pleated or loose.',
    image: img.womanCoat,
  },
  {
    slug: 'outerwear',
    name: 'Outerwear',
    category: 'outerwear',
    description: 'Coats, capes and cropped jackets.',
    image: img.manStreet,
  },
  {
    slug: 'occasion',
    name: 'Occasion & Traditional',
    category: 'occasion',
    description: 'Agbada, kaftans and evening pieces for the days that are remembered.',
    image: img.womanField,
  },
];
