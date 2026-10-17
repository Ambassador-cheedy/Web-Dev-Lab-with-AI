import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AnnouncementBar({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        'bg-obsidian text-ivory ease-luxe overflow-hidden transition-[height] duration-700',
        hidden ? 'h-0' : 'h-9',
      )}
      aria-hidden={hidden}
    >
      <p className="eyebrow text-ivory/90 sm:text-eyebrow flex h-9 items-center justify-center gap-2 px-4 text-center text-[0.625rem]">
        <span className="hidden sm:inline">Complimentary UK delivery</span>
        <span aria-hidden="true" className="text-gold-light hidden sm:inline">
          ·
        </span>
        <Link href="/fit-studio" className="link-luxe" tabIndex={hidden ? -1 : 0}>
          Try any piece in the Fit Studio
        </Link>
      </p>
    </div>
  );
}
