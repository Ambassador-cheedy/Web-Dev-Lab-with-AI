import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'oxblood' | 'light' | 'outline-light' | 'ghost';

const base =
  'group inline-flex items-center justify-center gap-3 rounded-xs px-7 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-[background-color,color,border-color] duration-500 ease-luxe disabled:cursor-not-allowed disabled:opacity-40 min-h-12';

const variants: Record<Variant, string> = {
  primary: 'bg-obsidian text-ivory border border-obsidian hover:bg-transparent hover:text-obsidian',
  secondary: 'border border-obsidian text-obsidian hover:bg-obsidian hover:text-ivory',
  oxblood: 'bg-oxblood text-ivory border border-oxblood hover:bg-transparent hover:text-oxblood',
  light: 'bg-ivory text-obsidian border border-ivory hover:bg-transparent hover:text-ivory',
  'outline-light': 'border border-ivory/70 text-ivory hover:bg-ivory hover:text-obsidian',
  ghost: 'text-obsidian px-0 py-2 min-h-0 link-luxe',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant };

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode };

export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 8"
      className={cn(
        'ease-luxe h-2 w-6 transition-transform duration-500 group-hover:translate-x-1',
        className,
      )}
      aria-hidden="true"
    >
      <path d="M0 4h22M18 0.5 22 4l-4 3.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
