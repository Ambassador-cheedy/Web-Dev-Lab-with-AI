/**
 * Catalogue access layer. Pages and components only talk to these functions,
 * never to /data directly, so the source can move to a CMS or the Shopify
 * Storefront API by reimplementing this file. Functions are async for that reason.
 */
import { products } from '@/data/products';
import { collections } from '@/data/collections';
import type { Collection, Product, ProductFilter } from './types';

export type { Product, Collection, ProductFilter } from './types';

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  return filterProducts(products, filter);
}

/** Synchronous variant for client components that already hold the list. */
export function filterProducts(list: Product[], filter: ProductFilter): Product[] {
  let result = list.filter((p) => {
    if (filter.category && p.category !== filter.category) return false;
    if (filter.collection && !p.collections.includes(filter.collection)) return false;
    if (filter.line && p.line !== filter.line) return false;
    if (filter.fitStudioOnly && !p.fitStudio.enabled) return false;
    if (filter.minPrice != null && p.price < filter.minPrice) return false;
    if (filter.maxPrice != null && p.price > filter.maxPrice) return false;
    if (filter.sizes?.length && !p.fitStudio.sizes.some((s) => filter.sizes!.includes(s.label))) return false;
    if (filter.colours?.length && !p.colours.some((c) => filter.colours!.includes(colourFamily(c.name))))
      return false;
    return true;
  });
  switch (filter.sort) {
    case 'price-asc':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result = [...result].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
      break;
  }
  return result;
}

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return products.find((p) => p.id === id);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const explicit = (product.related ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const fill = products.filter(
    (p) => p.id !== product.id && p.line === product.line && !explicit.includes(p),
  );
  return [...explicit, ...fill].slice(0, limit);
}

export async function getCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  return collections.find((c) => c.slug === slug);
}

export async function getProductsForCollection(collection: Collection, filter: ProductFilter = {}) {
  return getProducts(
    collection.category ? { ...filter, category: collection.category } : { ...filter, collection: collection.slug },
  );
}

/** Colour families used by the colour filter, so "Obsidian" and "Black" group together. */
const FAMILIES: Record<string, string[]> = {
  Black: ['Obsidian', 'Black', 'Charcoal', 'Midnight', 'Ink', 'Navy'],
  Neutral: ['Sand', 'Ivory', 'Ecru', 'Oat', 'Oatmeal', 'Natural', 'Stone', 'Champagne', 'White', 'Camel'],
  Red: ['Oxblood', 'Wine', 'Terracotta', 'Clay', 'Coral'],
  Green: ['Emerald', 'Forest', 'Olive'],
  Blue: ['Royal Blue', 'Pale Blue'],
  Gold: ['Gold'],
};

export function colourFamily(name: string): string {
  return Object.entries(FAMILIES).find(([, names]) => names.includes(name))?.[0] ?? 'Neutral';
}

export const COLOUR_FAMILIES = Object.keys(FAMILIES);

export const FAMILY_SWATCH: Record<string, string> = {
  Black: '#1C1A1A',
  Neutral: '#D9CBB5',
  Red: '#5A1A26',
  Green: '#2E3B2F',
  Blue: '#26386B',
  Gold: '#B8925A',
};

export const CATEGORY_LABELS: Record<Product['category'], string> = {
  dresses: 'Dresses',
  suits: 'Suits',
  tops: 'Tops & Shirts',
  trousers: 'Trousers',
  outerwear: 'Outerwear',
  occasion: 'Occasion & Traditional',
};

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products
    .filter((p) => {
      const haystack = [p.name, p.tagline, p.category, CATEGORY_LABELS[p.category], p.line, ...p.colours.map((c) => c.name)]
        .join(' ')
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    })
    .slice(0, limit);
}
