'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon, CloseIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { MeasureIllustration } from './MeasureIllustration';
import type { MeasurementField } from '@/lib/fit/measurements';
import type { Unit } from '@/lib/units';
import { toDisplay } from '@/lib/units';

type Props = {
  field: MeasurementField;
  label: string;
  unit: Unit;
  value: number | undefined;
  /** Placeholder shown for an empty optional field (our estimate). */
  estimate?: number;
  onChange: (v: number | undefined) => void;
  error?: string;
  warning?: string;
};

export function MeasureField({ field, label, unit, value, estimate, onChange, error, warning }: Props) {
  const id = useId();
  const [howOpen, setHowOpen] = useState(false);
  const min = toDisplay(field.min, unit, 0);
  const max = toDisplay(field.max, unit, 0);
  const step = unit === 'cm' ? 0.5 : 0.25;
  const sliderValue = value ?? estimate ?? (min + max) / 2;
  const msgId = `${id}-msg`;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <label htmlFor={`${id}-num`} className="text-sm font-medium">
            {label}
            {!field.required && <span className="ml-1.5 text-xs font-normal text-stone-deep">optional</span>}
          </label>
          <button
            type="button"
            onClick={() => setHowOpen((o) => !o)}
            aria-expanded={howOpen}
            aria-controls={`${id}-how`}
            aria-label={`How to measure ${label.toLowerCase()}`}
            className="inline-flex h-8 w-8 items-center justify-center text-stone-deep hover:text-gold"
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>
        <div className={cn('flex items-baseline border-b', error ? 'border-fit-tight' : 'border-sand focus-within:border-gold')}>
          <input
            id={`${id}-num`}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value ?? ''}
            placeholder={estimate != null ? `~${estimate}` : '–'}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            aria-invalid={!!error}
            aria-describedby={error || warning ? msgId : undefined}
            className="min-h-10 w-16 bg-transparent text-right text-base tabular-nums outline-none placeholder:text-stone"
          />
          <span className="pl-1 text-xs text-stone-deep">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        aria-valuetext={`${sliderValue} ${unit}`}
        className={cn('range-luxe', value == null && 'opacity-50')}
      />
      {(error || warning) && (
        <p id={msgId} role={error ? 'alert' : 'status'} className={cn('text-xs', error ? 'text-fit-tight' : 'text-stone-deep')}>
          {error ?? warning}
        </p>
      )}
      <AnimatePresence initial={false}>
        {howOpen && (
          <motion.div
            id={`${id}-how`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-4 bg-bone p-4">
              <MeasureIllustration field={field.key} className="h-28 w-14 shrink-0" />
              <div className="flex-1">
                <p className="eyebrow text-[0.65rem]">How to measure</p>
                <p className="mt-1 text-sm leading-relaxed">{field.how}</p>
              </div>
              <button type="button" onClick={() => setHowOpen(false)} aria-label="Close" className="-mt-2 -mr-2 inline-flex h-9 w-9 items-center justify-center">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
