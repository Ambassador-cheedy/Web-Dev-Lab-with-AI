import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/catalog';
import { FitStudioLoader, StudioSkeleton } from '@/components/fit-studio/FitStudioLoader';

export const metadata: Metadata = {
  title: 'Fit Studio',
  description:
    'Enter your measurements, choose a piece and see how it sits on a body shaped like yours, with a size recommendation and fit report.',
  alternates: { canonical: '/fit-studio' },
};

export default async function FitStudioPage() {
  const products = await getProducts({ fitStudioOnly: true });
  return (
    <>
      <section className="bg-obsidian text-ivory">
        <div className="container-luxe flex flex-col gap-4 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-8 bg-gold-light" /> The Fit Studio
            </p>
            <h1 className="mt-4 text-display font-light">See it on a body like yours.</h1>
          </div>
          <ol className="flex gap-6 text-sm text-ivory/75 lg:pb-3">
            <li><span className="text-gold-light">01</span> Measurements</li>
            <li><span className="text-gold-light">02</span> Choose a piece</li>
            <li><span className="text-gold-light">03</span> See your fit</li>
          </ol>
        </div>
      </section>
      <div className="container-luxe pt-8">
        <Suspense fallback={<StudioSkeleton />}>
          <FitStudioLoader products={products} />
        </Suspense>
      </div>
    </>
  );
}
