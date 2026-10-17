import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/catalog';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.slice(0, 80) ?? '';
  const results = await searchProducts(q);
  return NextResponse.json(
    results.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0],
      tagline: p.tagline,
    })),
  );
}
