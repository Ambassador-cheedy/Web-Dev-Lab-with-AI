import 'server-only';
import Stripe from 'stripe';
import { getProductById } from '@/lib/catalog';
import type { CheckoutItem } from './types';

/**
 * Payments are isolated here. Stripe Checkout runs in test mode when
 * STRIPE_SECRET_KEY is set (sk_test_...); otherwise a mock checkout redirects
 * straight to the success page so the flow can be demonstrated end to end.
 * Prices are always re-read from the catalogue on the server, never trusted from the client.
 */

let stripe: Stripe | null = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}

export function paymentsMode(): 'stripe' | 'mock' {
  return process.env.STRIPE_SECRET_KEY ? 'stripe' : 'mock';
}

export async function createCheckoutSession(items: CheckoutItem[], origin: string) {
  const resolved = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      if (!product) throw new Error(`Unknown product ${item.productId}`);
      if (!product.colours.some((c) => c.name === item.colour)) throw new Error('Unknown colour');
      if (!item.madeToMeasure && !product.fitStudio.sizes.some((s) => s.label === item.size))
        throw new Error('Unknown size');
      const unitAmount = item.madeToMeasure
        ? (product.madeToMeasurePrice ?? product.price)
        : product.price;
      return { product, item, unitAmount };
    }),
  );

  const client = getStripe();
  if (!client) {
    const ref = `MOCK-${Date.now().toString(36).toUpperCase()}`;
    return { url: `${origin}/order/success?mock=1&ref=${ref}`, mode: 'mock' as const };
  }

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    currency: 'gbp',
    line_items: resolved.map(({ product, item, unitAmount }) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'gbp',
        unit_amount: unitAmount * 100,
        product_data: {
          name: product.name,
          description: `${item.colour} · ${item.madeToMeasure ? 'Made to measure' : `Size ${item.size}`}`,
          images: product.images.slice(0, 1),
          metadata: { productId: product.id },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ['GB', 'IE', 'FR', 'DE', 'US', 'NG'] },
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bag`,
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return { url: session.url, mode: 'stripe' as const };
}

export async function getCheckoutSession(id: string) {
  const client = getStripe();
  if (!client) return null;
  const s = await client.checkout.sessions.retrieve(id);
  return {
    id: s.id,
    status: s.payment_status,
    total: (s.amount_total ?? 0) / 100,
    email: s.customer_details?.email ?? null,
  };
}
