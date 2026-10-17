import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog';
import { CollectionView } from '@/components/product/CollectionView';
import { PageIntro } from '@/components/ui/PageIntro';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Every Obioma piece: dresses, tailoring, occasion and traditional wear. Try any of them in the Fit Studio.',
  alternates: { canonical: '/collections' },
};

export default async function CollectionsPage() {
  const products = await getProducts();
  return (
    <>
      <PageIntro eyebrow="The collection" title="Every piece, considered">
        Dresses, tailoring and occasion wear, each cut for real proportions. Look for{' '}
        <em className="font-serif text-lg">Try in Fit Studio</em> to see how a piece will sit on you.
      </PageIntro>
      <div className="container-luxe pb-24">
        <CollectionView products={products} />
      </div>
    </>
  );
}
