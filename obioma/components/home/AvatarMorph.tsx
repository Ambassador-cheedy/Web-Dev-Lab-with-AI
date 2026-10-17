'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Product } from '@/lib/catalog/types';
import { PRESETS } from '@/lib/fit/measurements';
import { SvgAvatar } from '@/components/fit-studio/render/SvgAvatar';

const TONES = ['honey', 'chestnut', 'porcelain', 'umber', 'golden'];

/** Teaser: the avatar morphs between body shapes, wearing the same piece. */
export function AvatarMorph({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const presets = PRESETS.womenswear;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % presets.length), 2600);
    return () => window.clearInterval(t);
  }, [reduce, presets.length]);
  const preset = presets[i]!;
  return (
    <figure className="relative mx-auto aspect-[480/760] w-full max-w-sm">
      <SvgAvatar
        body={{ base: 'womenswear', skinTone: TONES[i % TONES.length]!, measurements: preset.measurements }}
        product={product}
        size={['M', 'S', 'M', 'XL', 'S'][i] ?? 'M'}
        colour={product.colours[i % product.colours.length]!.name}
        view="front"
        showHeatmap={false}
        className="h-full w-full [&_line]:opacity-40"
      />
      <figcaption className="eyebrow absolute bottom-0 left-0 text-stone-deep" aria-live="off">
        {preset.name} · {preset.note}
      </figcaption>
    </figure>
  );
}
