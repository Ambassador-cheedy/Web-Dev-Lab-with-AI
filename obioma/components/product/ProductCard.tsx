import Link from 'next/link';
import type { Product } from '@/lib/catalog/types';
import { formatPrice, cn } from '@/lib/utils';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { WishlistButton } from './WishlistButton';
import { RecommendedSizeHint } from './RecommendedSizeHint';

export function ProductCard({
  product,
  priority = false,
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw',
  className,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [first, second] = product.images;
  return (
    <article className={cn('group relative', className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="bg-bone relative aspect-[4/5] overflow-hidden">
          {first && (
            <EditorialImage
              src={first}
              alt={`${product.name}, front view`}
              fill
              sizes={sizes}
              priority={priority}
              className="ease-luxe object-cover transition-[opacity,transform] duration-[1200ms] group-hover:scale-[1.03]"
            />
          )}
          {second && (
            <EditorialImage
              src={second}
              alt=""
              fill
              sizes={sizes}
              className="ease-luxe object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
            {product.madeToMeasure && (
              <span className="eyebrow bg-oxblood text-ivory px-2 py-1 text-[0.6rem]">
                Made to measure
              </span>
            )}
            {product.limited && (
              <span className="eyebrow bg-ivory/90 text-oxblood px-2 py-1 text-[0.6rem]">
                Limited
              </span>
            )}
            {product.isNew && !product.limited && (
              <span className="eyebrow bg-ivory/90 text-obsidian px-2 py-1 text-[0.6rem]">New</span>
            )}
          </div>
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        productName={product.name}
        className="text-obsidian absolute top-1 right-1"
      />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-xl leading-tight">
            <Link href={`/product/${product.slug}`} className="link-luxe">
              {product.name}
            </Link>
          </h3>
          <p className="text-stone-deep mt-1 text-sm">{formatPrice(product.price)}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {product.fitStudio.enabled && (
          <Link
            href={`/fit-studio?product=${product.slug}`}
            className="eyebrow link-luxe text-obsidian text-[0.65rem]"
          >
            Try in Fit Studio
          </Link>
        )}
        <RecommendedSizeHint product={product} />
      </div>
    </article>
  );
}
