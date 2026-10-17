import type { Product } from '@/lib/catalog/types';

export type Texture =
  'twill' | 'rib' | 'linen' | 'sheen' | 'crepe' | 'oxford' | 'damask' | 'velvet' | 'plain';

/** Pick a fabric texture from the product's fabric description. */
export function textureFor(product: Product): Texture {
  const f = product.fabric.toLowerCase();
  if (f.includes('rib')) return 'rib';
  if (f.includes('cashmere') || f.includes('knit')) return 'rib';
  if (f.includes('linen')) return 'linen';
  if (f.includes('damask')) return 'damask';
  if (f.includes('velvet')) return 'velvet';
  if (f.includes('oxford') || f.includes('cotton')) return 'oxford';
  if (f.includes('crepe') && !f.includes('silk crêpe')) return 'crepe';
  if (
    f.includes('silk') ||
    f.includes('satin') ||
    f.includes('georgette') ||
    f.includes('charmeuse')
  )
    return 'sheen';
  if (f.includes('wool') || f.includes('twill') || f.includes('barathea')) return 'twill';
  return 'plain';
}

/** Relative luminance 0–1 of a hex colour. */
export function luminance(hex: string): number {
  const m = hex.replace('#', '');
  const n = parseInt(
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m,
    16,
  );
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}
