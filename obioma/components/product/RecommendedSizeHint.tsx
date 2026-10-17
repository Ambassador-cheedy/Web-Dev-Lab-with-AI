'use client';

import type { Product } from '@/lib/catalog/types';
import { useProfileFit } from '@/lib/fit/useProfileFit';

/** "Your recommended size: M" on product cards, when a measurement profile exists. */
export function RecommendedSizeHint({ product }: { product: Product }) {
  const { report } = useProfileFit(product);
  if (!report) return null;
  return (
    <p className="text-stone-deep text-xs">
      {report.suggestMadeToMeasure ? (
        <span className="text-oxblood">Best made to measure for you</span>
      ) : (
        <>
          Your recommended size:{' '}
          <span className="text-obsidian font-semibold">{report.recommendedSize}</span>
        </>
      )}
    </p>
  );
}
