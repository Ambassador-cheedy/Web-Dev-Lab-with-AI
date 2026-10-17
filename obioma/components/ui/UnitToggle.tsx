'use client';

import type { Unit } from '@/lib/units';
import { cn } from '@/lib/utils';

export function UnitToggle({
  unit,
  onChange,
  className,
  tone = 'light',
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Units"
      className={cn(
        'inline-flex border',
        tone === 'dark' ? 'border-ivory/30' : 'border-sand',
        className,
      )}
    >
      {(['cm', 'in'] as const).map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={unit === u}
          onClick={() => onChange(u)}
          className={cn(
            'eyebrow min-h-9 min-w-11 px-3 transition-colors duration-300',
            unit === u
              ? tone === 'dark'
                ? 'bg-ivory text-obsidian'
                : 'bg-obsidian text-ivory'
              : tone === 'dark'
                ? 'text-ivory/70 hover:text-ivory'
                : 'text-stone-deep hover:text-obsidian',
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
