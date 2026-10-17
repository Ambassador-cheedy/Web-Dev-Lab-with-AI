'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/catalog/types';
import { evaluateFit } from '@/lib/fit';
import { useDialog } from '@/components/layout/useDialog';
import { CloseIcon } from '@/components/ui/Icons';
import { SvgAvatar } from './render/SvgAvatar';
import type { AvatarBody } from './render/types';
import { ScoreRing } from './FitReportCard';

type Side = { productId: string; size: string; colour: string };

export function CompareDialog({
  products,
  body,
  initial,
  onClose,
}: {
  products: Product[];
  body: AvatarBody;
  initial: Side;
  onClose: () => void;
}) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const start = products.find((p) => p.id === initial.productId)!;
  const sizes = start.fitStudio.sizes.map((s) => s.label);
  const nextSize =
    sizes[Math.min(sizes.length - 1, sizes.indexOf(initial.size) + 1)] ?? initial.size;
  const [sides, setSides] = useState<[Side, Side]>([
    initial,
    { ...initial, size: nextSize === initial.size ? sizes[0]! : nextSize },
  ]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      className="bg-ivory fixed inset-0 z-[60] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container-luxe py-6">
        <div className="flex items-center justify-between">
          <h2 id="compare-title" className="font-serif text-3xl">
            Compare
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare"
            className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-stone-deep mt-1 text-sm">
          Two sizes, or two pieces, side by side on your body.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-8">
          {sides.map((side, i) => (
            <CompareSide
              key={i}
              products={products}
              body={body}
              side={side}
              onChange={(s) => setSides((prev) => (i === 0 ? [s, prev[1]] : [prev[0], s]))}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CompareSide({
  products,
  body,
  side,
  onChange,
}: {
  products: Product[];
  body: AvatarBody;
  side: Side;
  onChange: (s: Side) => void;
}) {
  const product = products.find((p) => p.id === side.productId)!;
  const report = useMemo(() => evaluateFit(body, product.fitStudio), [body, product]);
  const result = report.sizes.find((s) => s.size === side.size) ?? report.sizes[0]!;
  const select = 'min-h-11 w-full border border-sand bg-ivory px-2 text-sm';
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_6rem]">
        <label className="sr-only" htmlFor={`cmp-p-${side.productId}`}>
          Piece
        </label>
        <select
          id={`cmp-p-${side.productId}`}
          className={select}
          value={side.productId}
          onChange={(e) => {
            const p = products.find((x) => x.id === e.target.value)!;
            onChange({
              productId: p.id,
              colour: p.colours[0]!.name,
              size: evaluateFit(body, p.fitStudio).recommendedSize || p.fitStudio.sizes[0]!.label,
            });
          }}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Size"
          className={select}
          value={side.size}
          onChange={(e) => onChange({ ...side, size: e.target.value })}
        >
          {product.fitStudio.sizes.map((s) => (
            <option key={s.label} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 aspect-[480/760] max-h-[60vh] w-full">
        <SvgAvatar
          body={body}
          product={product}
          size={side.size}
          colour={side.colour}
          view="front"
          showHeatmap
          className="h-full w-full"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative">
          <ScoreRing score={result.score} className="h-12 w-12" />
          <span className="absolute inset-0 flex items-center justify-center text-sm tabular-nums">
            {result.score}
          </span>
        </div>
        <p className="text-sm">
          Size {result.size}
          {result.size === report.recommendedSize && (
            <span className="text-stone-deep"> · recommended</span>
          )}
        </p>
      </div>
    </div>
  );
}
