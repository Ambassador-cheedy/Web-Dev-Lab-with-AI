'use client';

import type { Product } from '@/lib/catalog/types';
import { useProfileFit } from '@/lib/fit/useProfileFit';

/** "Your recommended size: M" on product cards, when a measurement profile exists. */
export function RecommendedSizeHint({ product }: { product: Product }) {
  const { report } = useProfileFit(product);
  if (!report) return null;
  return (
    <p className="text-xs text-stone-deep">
      {report.suggestMadeToMeasure ? (
        <span className="text-oxblood">Best made to measure for you</span>
      ) : (
        <>
          Your recommended size: <span className="font-semibold text-obsidian">{report.recommendedSize}</span>
        </>
      )}
    </p>
  );
}
