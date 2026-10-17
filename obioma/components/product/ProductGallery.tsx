'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { CloseIcon } from '@/components/ui/Icons';
import { useDialog } from '@/components/layout/useDialog';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="lg:grid lg:grid-cols-[88px_1fr] lg:gap-5">
      {/* Desktop thumbnails */}
      <ul className="hidden flex-col gap-3 lg:flex" aria-label="Product images">
        {images.map((src, i) => (
          <li key={src + i}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={active === i}
              className={cn(
                'bg-bone relative block aspect-[4/5] w-full overflow-hidden transition-opacity duration-500',
                active === i
                  ? 'ring-gold ring-offset-ivory opacity-100 ring-1 ring-offset-2'
                  : 'opacity-60 hover:opacity-100',
              )}
            >
              <EditorialImage src={src} alt="" fill sizes="88px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop main image */}
      <button
        type="button"
        onClick={() => setZoom(active)}
        className="bg-bone relative hidden aspect-[4/5] w-full cursor-zoom-in overflow-hidden lg:block"
        aria-label={`Zoom image ${active + 1} of ${name}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EditorialImage
              src={images[active]!}
              alt={`${name}, image ${active + 1}`}
              fill
              priority={active === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Mobile swipe */}
      <div className="lg:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
          aria-label="Product images, swipe to browse"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setZoom(i)}
              className="bg-bone relative aspect-[4/5] w-full shrink-0 snap-center"
              aria-label={`Zoom image ${i + 1} of ${name}`}
            >
              <EditorialImage
                src={src}
                alt={`${name}, image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn('h-px w-6 transition-colors', i === active ? 'bg-obsidian' : 'bg-sand')}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {zoom !== null && (
          <Lightbox src={images[zoom]!} alt={`${name}, enlarged`} onClose={() => setZoom(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const [origin, setOrigin] = useState('50% 50%');
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
      className="bg-ivory fixed inset-0 z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="relative h-full w-full cursor-zoom-out overflow-hidden"
        onClick={onClose}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(
            `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`,
          );
        }}
      >
        <div
          className="absolute inset-0 transition-transform duration-300 md:scale-150"
          style={{ transformOrigin: origin }}
        >
          <EditorialImage src={src} alt={alt} fill sizes="100vw" className="object-contain" />
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        data-autofocus
        aria-label="Close enlarged image"
        className="bg-ivory absolute top-4 right-4 inline-flex h-12 w-12 items-center justify-center"
      >
        <CloseIcon />
      </button>
    </motion.div>
  );
}
