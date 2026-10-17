import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllProducts } from '@/lib/catalog';
import { PageIntro } from '@/components/ui/PageIntro';
import { AccountView } from '@/components/account/AccountView';

export const metadata: Metadata = { title: 'Account', robots: { index: false } };

export default async function AccountPage() {
  const products = await getAllProducts();
  return (
    <>
      <PageIntro eyebrow="Your account" title="Welcome back" />
      <div className="container-luxe pb-24">
        <Suspense fallback={<div className="h-96" />}>
          <AccountView products={products} />
        </Suspense>
      </div>
    </>
  );
}
