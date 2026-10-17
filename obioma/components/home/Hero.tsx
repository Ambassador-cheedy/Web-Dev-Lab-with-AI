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
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-obsidian text-ivory">
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
      <motion.div style={{ opacity: fade }} className="container-luxe relative flex h-full flex-col justify-end pb-16 sm:pb-24">
        <motion.p
          className="eyebrow flex items-center gap-3 text-gold-light"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
        >
          <span aria-hidden="true" className="h-px w-8 bg-gold-light" /> The Harmattan Collection
        </motion.p>
        <h1 className="mt-6 max-w-5xl text-hero font-light">
          {['Made for the body', 'you live in.'].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: reduce ? 0 : '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-6 max-w-md text-base leading-relaxed text-ivory/85 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          Considered clothing, cut for real proportions, and a Fit Studio that shows you how each piece will sit before
          it arrives.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease }}
        >
          <ButtonLink href="/collections" variant="light">
            Explore the Collection <Arrow />
          </ButtonLink>
          <ButtonLink href="/fit-studio" variant="outline-light">
            Try the Fit Studio
          </ButtonLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
