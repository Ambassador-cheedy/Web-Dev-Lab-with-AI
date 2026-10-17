import type { Metadata } from 'next';
import { getCheckoutSession } from '@/lib/payments/server';
import { OrderConfirmation } from '@/components/product/OrderConfirmation';

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } };

type Props = { searchParams: Promise<{ session_id?: string; ref?: string; mock?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = sp.session_id ? await getCheckoutSession(sp.session_id).catch(() => null) : null;
  const reference = session?.id.slice(-10).toUpperCase() ?? sp.ref ?? 'OBIOMA';
  return <OrderConfirmation reference={reference} mock={!!sp.mock} email={session?.email ?? null} />;
}
