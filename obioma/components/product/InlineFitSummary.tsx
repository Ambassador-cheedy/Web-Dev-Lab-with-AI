'use client';

import Link from 'next/link';
import type { Product } from '@/lib/catalog/types';
import { describeSize } from '@/lib/fit';
import { useProfileFit } from '@/lib/fit/useProfileFit';
import { RulerIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

/** Inline fit summary on the product page, driven by the saved measurement profile. */
export function InlineFitSummary({
  product,
  selectedSize,
  onPickSize,
}: {
  product: Product;
  selectedSize: string | null;
  onPickSize: (s: string) => void;
}) {
  const { profile, report } = useProfileFit(product);
  if (!product.fitStudio.enabled) return null;

  if (!profile || !report) {
    return (
      <p className="bg-bone mt-5 flex items-start gap-3 px-4 py-3 text-sm">
        <RulerIcon className="text-gold mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Not sure of your size?{' '}
          <Link
            href={`/fit-studio?product=${product.slug}`}
            className="decoration-gold underline underline-offset-4"
          >
            Try it in the Fit Studio
          </Link>{' '}
          and we will recommend one.
        </span>
      </p>
    );
  }

  const size = selectedSize ?? report.recommendedSize;
  const result = report.sizes.find((s) => s.size === size) ?? report.sizes[0]!;
  const chest = profile.base === 'menswear' ? 'chest' : 'bust';
  return (
    <div className="bg-bone mt-5 px-4 py-4 text-sm" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-stone-deep">Fit for {profile.name}</p>
        {!report.suggestMadeToMeasure && size !== report.recommendedSize && (
          <button
            type="button"
            onClick={() => onPickSize(report.recommendedSize)}
            className="eyebrow link-luxe"
          >
            Choose {report.recommendedSize}
          </button>
        )}
      </div>
      <p className="mt-2">
        <span className="font-semibold">Size {result.size}</span>
        {result.size === report.recommendedSize && !report.suggestMadeToMeasure && (
          <span className="text-fit-ideal"> (recommended)</span>
        )}
        : {describeSize(result, chest)}.
      </p>
      {report.suggestMadeToMeasure && (
        <p className={cn('text-oxblood mt-2')}>
          No standard size fits you well; this piece would fit you best made to measure.
        </p>
      )}
      <Link
        href={`/fit-studio?product=${product.slug}`}
        className="decoration-gold mt-2 inline-block text-xs underline underline-offset-4"
      >
        See it on your avatar
      </Link>
    </div>
  );
}
