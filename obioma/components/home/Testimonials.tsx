'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { testimonials } from '@/data/content';
import { cn } from '@/lib/utils';

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % testimonials.length), 6500);
    return () => window.clearInterval(t);
  }, [paused, reduce]);
  const t = testimonials[i]!;
  return (
    <section
      aria-roledescription="carousel"
      aria-label="What our clients say"
      className="container-luxe py-24 text-center lg:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span aria-hidden="true" className="bg-gold mx-auto block h-px w-12" />
      <div
        className="relative mx-auto mt-12 min-h-[14rem] max-w-4xl sm:min-h-[12rem]"
        aria-live={paused ? 'polite' : 'off'}
      >
        <AnimatePresence mode="wait">
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="font-serif text-3xl leading-snug font-light italic sm:text-4xl lg:text-5xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="eyebrow text-stone-deep mt-8">
              {t.name} · {t.place}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-10 flex justify-center gap-1" role="group" aria-label="Choose testimonial">
        {testimonials.map((x, n) => (
          <button
            key={x.name}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Testimonial ${n + 1} of ${testimonials.length}`}
            aria-current={n === i}
            className="group inline-flex h-11 w-11 items-center justify-center"
          >
            <span
              className={cn(
                'h-px w-6 transition-colors duration-500',
                n === i ? 'bg-obsidian' : 'bg-sand group-hover:bg-stone',
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
