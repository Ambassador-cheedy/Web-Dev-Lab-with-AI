import type { MetadataRoute } from 'next';
import { getAllProducts, getCollections } from '@/lib/catalog';
import { siteUrl } from '@/lib/utils';

const STATIC = [
  '',
  '/collections',
  '/fit-studio',
  '/made-to-measure',
  '/atelier',
  '/lookbook',
  '/size-guide',
  '/how-to-measure',
  '/delivery-returns',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/cookies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([getAllProducts(), getCollections()]);
  return [
    ...STATIC.map((p) => ({
      url: `${siteUrl}${p}`,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.7,
    })),
    ...collections.map((c) => ({
      url: `${siteUrl}/collections/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
