'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Monogram } from './Logo';

/**
 * next/image with a quiet branded fallback, so a missing placeholder photo never
 * shows a broken-image icon. Use for all editorial and product imagery.
 */
export function EditorialImage({ className, alt, tone = 'bone', ...props }: ImageProps & { tone?: 'bone' | 'dark' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          tone === 'dark'
            ? 'bg-[radial-gradient(ellipse_at_30%_20%,var(--color-oxblood),var(--color-obsidian)_70%)] text-gold-light/40'
            : 'bg-[radial-gradient(ellipse_at_30%_20%,var(--color-ivory),var(--color-sand)_90%)] text-stone/50',
          className,
        )}
      >
        <Monogram className="h-12 w-12" title="" />
      </div>
    );
  }
  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
