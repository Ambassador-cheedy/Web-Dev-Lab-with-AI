'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Fade-and-rise on scroll. Falls back to a plain fade with reduced motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Image reveal: a sand-coloured mask slides away. */
export function MaskReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.div
        className="h-full w-full"
        initial={{ scale: reduce ? 1 : 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 origin-top bg-bone"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </div>
  );
}
