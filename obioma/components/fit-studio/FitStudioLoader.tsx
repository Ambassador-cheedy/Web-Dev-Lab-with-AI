'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/catalog/types';
import { useHydrated } from '@/lib/store/hydration';

/** The studio is code-split and client-only: it depends on device-stored measurements. */
const FitStudio = dynamic(() => import('./FitStudio').then((m) => m.FitStudio), {
  ssr: false,
  loading: () => <StudioSkeleton />,
});

export function StudioSkeleton() {
  return (
    <div
      className="grid min-h-[70vh] place-items-center"
      aria-busy="true"
      aria-label="Loading the Fit Studio"
    >
      <div className="bg-bone h-[60vh] w-48 animate-pulse rounded-full" />
    </div>
  );
}

export function FitStudioLoader({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const slug = useSearchParams().get('product') ?? undefined;
  if (!hydrated) return <StudioSkeleton />;
  return <FitStudio products={products} initialSlug={slug} />;
}
