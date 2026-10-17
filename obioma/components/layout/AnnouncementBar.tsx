import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AnnouncementBar({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden bg-obsidian text-ivory transition-[height] duration-700 ease-luxe',
        hidden ? 'h-0' : 'h-9',
      )}
      aria-hidden={hidden}
    >
      <p className="eyebrow flex h-9 items-center justify-center gap-2 px-4 text-center text-[0.625rem] text-ivory/90 sm:text-eyebrow">
        <span className="hidden sm:inline">Complimentary UK delivery</span>
        <span aria-hidden="true" className="hidden text-gold-light sm:inline">·</span>
        <Link href="/fit-studio" className="link-luxe" tabIndex={hidden ? -1 : 0}>
          Try any piece in the Fit Studio
        </Link>
      </p>
    </div>
  );
}
