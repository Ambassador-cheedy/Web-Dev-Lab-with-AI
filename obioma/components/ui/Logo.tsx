import { cn } from '@/lib/utils';

/**
 * Obioma monogram + wordmark. Replace this file to swap in final brand artwork.
 * Colours come from currentColor (the "O") and the gold token (inner line).
 */
export function Monogram({ className, title = 'Obioma' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-8 w-8', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <ellipse
        cx="24"
        cy="24"
        rx="11.5"
        ry="15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="8.25"
        ry="12.25"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export function Logo({ className, withMark = false }: { className?: string; withMark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {withMark && <Monogram className="h-7 w-7" />}
      <span className="font-serif text-[1.65rem] leading-none font-medium tracking-[0.32em] sm:text-[1.9rem]">
        OBIOMA
      </span>
    </span>
  );
}
