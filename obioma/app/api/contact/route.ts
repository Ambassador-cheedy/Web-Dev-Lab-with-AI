import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/forms';

/** Stub: forward to the client services inbox or helpdesk to go live. */
export async function POST(req: Request) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
