'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { ButtonLink, Arrow } from '@/components/ui/Button';
import { img } from '@/data/images';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="bg-obsidian text-ivory relative h-[100svh] min-h-[560px] overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y }}>
        <EditorialImage
          src={img.heroWoman}
          alt="A woman in an obsidian Obioma column dress, photographed in soft evening light"
          fill
          priority
          sizes="100vw"
          tone="dark"
          className="object-cover object-[60%_30%]"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-obsidian) 55%, transparent) 0%, color-mix(in srgb, var(--color-obsidian) 15%, transparent) 40%, color-mix(in srgb, var(--color-obsidian) 78%, transparent) 100%)',
        }}
      />
      <motion.div
        style={{ opacity: fade }}
        className="container-luxe relative flex h-full flex-col justify-end pb-16 sm:pb-24"
      >
        <p className="eyebrow anim-fade-up text-gold-light flex items-center gap-3 [animation-delay:200ms]">
          <span aria-hidden="true" className="bg-gold-light h-px w-8" /> The Harmattan Collection
        </p>
        <h1 className="text-hero mt-6 max-w-5xl font-light">
          {['Made for the body', 'you live in.'].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <span className="anim-rise block" style={{ animationDelay: `${350 + i * 120}ms` }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="anim-fade-up text-ivory/85 mt-6 max-w-md text-base leading-relaxed [animation-delay:900ms] sm:text-lg">
          Considered clothing, cut for real proportions, and a Fit Studio that shows you how each
          piece will sit before it arrives.
        </p>
        <div className="anim-fade-up mt-10 flex flex-col gap-3 [animation-delay:1050ms] sm:flex-row">
          <ButtonLink href="/collections" variant="light">
            Explore the Collection <Arrow />
          </ButtonLink>
          <ButtonLink href="/fit-studio" variant="outline-light">
            Try the Fit Studio
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
