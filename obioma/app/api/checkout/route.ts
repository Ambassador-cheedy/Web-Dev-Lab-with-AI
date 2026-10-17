import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/payments/server';

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        colour: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
        madeToMeasure: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Your bag could not be read.' }, { status: 400 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  try {
    return NextResponse.json(await createCheckoutSession(parsed.data.items, origin));
  } catch (e) {
    console.error('checkout failed', e);
    return NextResponse.json({ error: 'Checkout is unavailable just now. Please try again shortly.' }, { status: 500 });
  }
}
