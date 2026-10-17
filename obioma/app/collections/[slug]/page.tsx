import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollection, getCollections, getProductsForCollection } from '@/lib/catalog';
import { CollectionView } from '@/components/product/CollectionView';
import { PageIntro } from '@/components/ui/PageIntro';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollection((await params).slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { images: [{ url: collection.image }] },
  };
}

export default async function CollectionPage({ params }: Props) {
  const collection = await getCollection((await params).slug);
  if (!collection) notFound();
  const products = await getProductsForCollection(collection);
  return (
    <>
      <PageIntro eyebrow="Collection" title={collection.name}>
        {collection.description}
      </PageIntro>
      <div className="container-luxe pb-24">
        <h2 className="sr-only">Pieces</h2>
        <CollectionView products={products} activeCategory={collection.category} />
      </div>
    </>
  );
}
