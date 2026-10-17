import { NextResponse } from 'next/server';
import { madeToMeasureSchema, MAX_UPLOAD_BYTES, UPLOAD_TYPES } from '@/lib/forms';

/**
 * Stub endpoint for made-to-measure requests and consultation bookings.
 * Validates the request and returns a reference. To go live, forward the data to
 * the atelier's inbox or CRM and store the reference image (e.g. in object storage).
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
  const parsed = madeToMeasureSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 },
    );
  }
  const file = form.get('reference');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES)
      return NextResponse.json({ error: 'Images must be under 5 MB' }, { status: 400 });
    if (!UPLOAD_TYPES.includes(file.type))
      return NextResponse.json(
        { error: 'Please upload a JPEG, PNG or WebP image' },
        { status: 400 },
      );
  }
  const reference = `MTM-${Date.now().toString(36).toUpperCase()}`;
  return NextResponse.json({ ok: true, reference });
}
