import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ email: z.email() });

/** Stub: connect an email platform (e.g. Klaviyo, Mailchimp) here. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
