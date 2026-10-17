import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORY_LABELS, getAllProducts, getProductBySlug, getRelatedProducts } from '@/lib/catalog';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { SizeGuideTable } from '@/components/product/SizeGuideTable';
import { ProductCard } from '@/components/product/ProductCard';
import { AccordionItem } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { formatPrice, siteUrl } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} ${formatPrice(product.price)}.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} · Obioma`,
      description: product.tagline,
      images: product.images.slice(0, 1).map((url) => ({ url, width: 1200, height: 1500, alt: product.name })),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Obioma' },
    color: product.colours.map((c) => c.name).join(', '),
    material: product.fabric,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'GBP',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container-luxe pt-6 pb-24 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="eyebrow flex flex-wrap items-center gap-2 text-stone-deep">
            <li>
              <Link href="/collections" className="link-luxe">Collections</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/collections/${product.category}`} className="link-luxe">
                {CATEGORY_LABELS[product.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-obsidian">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 xl:gap-24">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-wrap gap-2">
              {product.madeToMeasure && (
                <span className="eyebrow bg-oxblood px-2 py-1 text-[0.6rem] text-ivory">Made to measure available</span>
              )}
              {product.limited && <span className="eyebrow border border-oxblood px-2 py-1 text-[0.6rem] text-oxblood">Limited</span>}
            </div>
            <h1 className="mt-4 text-title font-light">{product.name}</h1>
            <p className="mt-2 text-lg">{formatPrice(product.price)}</p>
            <p className="mt-5 max-w-md font-serif text-xl leading-snug text-stone-deep italic">{product.tagline}</p>
            <span aria-hidden="true" className="my-8 block h-px w-12 bg-gold" />

            <ProductPurchase product={product} />

            <div className="mt-10 border-t border-sand">
              <AccordionItem title="Description" defaultOpen>
                <p>{product.description}</p>
                <ul className="mt-4 list-disc space-y-1 pl-5">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="Fabric & care">
                <p>{product.fabric}</p>
                <ul className="mt-4 list-disc space-y-1 pl-5">
                  {product.care.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="Size guide">
                <SizeGuideTable product={product} />
              </AccordionItem>
              <AccordionItem title="Delivery & returns">
                <p>
                  Complimentary tracked UK delivery in 2–4 working days. International delivery is calculated at checkout.
                  Return unworn pieces within 30 days. Made-to-measure pieces are made for you alone and cannot be
                  returned, but we will alter them until they are right.
                </p>
                <Link href="/delivery-returns" className="mt-3 inline-block underline decoration-gold underline-offset-4">
                  Delivery & returns in full
                </Link>
              </AccordionItem>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="complete-the-look" className="mt-28">
            <Reveal>
              <h2 id="complete-the-look" className="text-title font-light">
                Complete the look
              </h2>
            </Reveal>
            <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 0.08}>
                  <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
                </Reveal>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
