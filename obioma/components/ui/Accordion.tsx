'use client';

import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from './Icons';
import { cn } from '@/lib/utils';

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  level = 3,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  level?: 2 | 3;
}) {
  const H = level === 2 ? 'h2' : 'h3';
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-sand border-b">
      <H className="font-sans">
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
        >
          <span className="eyebrow">{title}</span>
          <PlusIcon
            className={cn(
              'ease-luxe h-4 w-4 transition-transform duration-500',
              open && 'rotate-45',
            )}
          />
        </button>
      </H>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="text-stone-deep pb-6 text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
