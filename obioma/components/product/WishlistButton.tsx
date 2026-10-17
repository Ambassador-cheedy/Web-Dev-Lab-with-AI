'use client';

import { HeartIcon } from '@/components/ui/Icons';
import { useWishlist } from '@/lib/store/wishlist';
import { useHydrated } from '@/lib/store/hydration';
import { cn } from '@/lib/utils';

export function WishlistButton({
  productId,
  productName,
  className,
  withLabel = false,
}: {
  productId: string;
  productName: string;
  className?: string;
  withLabel?: boolean;
}) {
  const hydrated = useHydrated();
  const active = useWishlist((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={active}
      aria-label={
        withLabel
          ? undefined
          : `${active ? 'Remove' : 'Add'} ${productName} ${active ? 'from' : 'to'} wishlist`
      }
      className={cn(
        'hover:text-gold inline-flex min-h-11 min-w-11 items-center justify-center gap-2 transition-colors duration-500',
        active && 'text-oxblood',
        className,
      )}
    >
      <HeartIcon filled={active} />
      {withLabel && (
        <span className="eyebrow">{active ? 'Saved to wishlist' : 'Add to wishlist'}</span>
      )}
    </button>
  );
}
