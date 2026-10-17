import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const inputClass =
  'min-h-12 w-full border-b border-sand bg-transparent px-0 py-2 text-base outline-none transition-colors placeholder:text-stone focus:border-gold aria-[invalid=true]:border-fit-tight';

/** Label + control + hint/error, wired up with ids for assistive tech. */
export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactElement<Record<string, unknown>>;
  className?: string;
}) {
  const id = useId();
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy })
    : children;
  return (
    <div className={cn('block', className)}>
      <label htmlFor={id} className="eyebrow text-stone-deep">
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-deep">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-fit-tight">
          {error}
        </p>
      )}
    </div>
  );
}
