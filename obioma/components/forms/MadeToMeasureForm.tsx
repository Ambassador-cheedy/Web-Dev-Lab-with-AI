'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '@/lib/catalog/types';
import { madeToMeasureSchema, MAX_UPLOAD_BYTES, OCCASIONS, TIME_SLOTS, UPLOAD_TYPES, type MadeToMeasureValues } from '@/lib/forms';
import { useMeasurements } from '@/lib/store/measurements';
import { useOrders } from '@/lib/store/orders';
import { useAuth } from '@/lib/auth';
import { useHydrated } from '@/lib/store/hydration';
import { formatLength } from '@/lib/units';
import { Button, ButtonLink } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import { Field, inputClass } from './Field';

const today = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export function MadeToMeasureForm({ products, initialSlug }: { products: Product[]; initialSlug?: string }) {
  const hydrated = useHydrated();
  const profiles = useMeasurements((s) => s.profiles);
  const activeId = useMeasurements((s) => s.activeId);
  const unit = useMeasurements((s) => s.unit);
  const user = useAuth((s) => s.user);
  const addRequest = useOrders((s) => s.addRequest);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MadeToMeasureValues>({
    resolver: zodResolver(madeToMeasureSchema),
    defaultValues: {
      productSlug: products.some((p) => p.slug === initialSlug) ? initialSlug : '',
      consultation: 'none',
      name: '',
      email: '',
      fabricNotes: '',
    },
  });

  // Attach the active profile once stores have loaded from this device.
  useEffect(() => {
    if (!hydrated) return;
    const id = activeId ?? profiles[0]?.id;
    if (id) setValue('profileId', id);
    if (user?.email) setValue('email', user.email);
    if (user?.name) setValue('name', user.name);
  }, [hydrated, activeId, profiles, user, setValue]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifecycle is tied to the file
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const consultation = useWatch({ control, name: 'consultation' });
  const profileId = useWatch({ control, name: 'profileId' });
  const productSlug = useWatch({ control, name: 'productSlug' });
  const profile = profiles.find((p) => p.id === profileId);
  const product = products.find((p) => p.slug === productSlug);

  const onFile = (f: File | undefined) => {
    setFileError(null);
    if (!f) return setFile(null);
    if (!UPLOAD_TYPES.includes(f.type)) return setFileError('Please choose a JPEG, PNG or WebP image.');
    if (f.size > MAX_UPLOAD_BYTES) return setFileError('Images must be under 5 MB.');
    setFile(f);
  };

  const onSubmit = async (values: MadeToMeasureValues) => {
    setServerError(null);
    const body = new FormData();
    for (const [k, v] of Object.entries(values)) if (v) body.append(k, String(v));
    if (profile) body.append('profileJson', JSON.stringify(profile));
    if (file) body.append('reference', file);
    const res = await fetch('/api/made-to-measure', { method: 'POST', body }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (!res?.ok || !data?.reference) {
      setServerError(data?.error ?? 'We could not send your request. Please try again.');
      return;
    }
    addRequest({
      id: data.reference,
      createdAt: new Date().toISOString(),
      productName: product?.name,
      profileName: profile?.name,
      occasion: values.occasion,
      deadline: values.deadline,
      notes: values.fabricNotes,
      consultation:
        values.consultation !== 'none' && values.consultDate && values.consultTime
          ? { type: values.consultation, date: values.consultDate, time: values.consultTime }
          : undefined,
      status: values.consultation !== 'none' ? 'Consultation booked' : 'Received',
    });
    setDone(data.reference);
  };

  if (done) {
    return (
      <div role="status" className="bg-bone p-8 sm:p-12">
        <p className="eyebrow text-oxblood">Reference {done}</p>
        <h2 className="mt-4 font-serif text-4xl font-light">Thank you. Your request is with our cutters.</h2>
        <p className="mt-4 max-w-xl text-stone-deep">
          We will reply within two working days to confirm your measurements
          {consultation !== 'none' ? ' and your consultation' : ''}. You can follow your request in your account.
        </p>
        <ButtonLink href="/account?tab=requests" variant="secondary" className="mt-8">
          View my requests
        </ButtonLink>
      </div>
    );
  }

  const radio = (active: boolean) =>
    cn('flex min-h-12 flex-1 items-center justify-center border px-3 text-sm transition-colors', active ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand hover:border-obsidian');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <fieldset className="space-y-6">
        <legend className="mb-2 font-serif text-2xl">The piece</legend>
        <Field label="Piece" hint={product?.madeToMeasurePrice ? `Made to measure from ${formatPrice(product.madeToMeasurePrice)}` : 'Or leave open and describe what you have in mind below'}>
          <select className={inputClass} {...register('productSlug')}>
            <option value="">Something new, to discuss</option>
            {products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fabric & colour notes" hint="Preferred cloth, colours, linings, details you love." error={errors.fabricNotes?.message}>
          <textarea rows={4} className={cn(inputClass, 'resize-y')} {...register('fabricNotes')} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Occasion" error={errors.occasion?.message}>
            <select className={inputClass} defaultValue="" {...register('occasion')}>
              <option value="" disabled>
                Choose an occasion
              </option>
              {OCCASIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Needed by (optional)" error={errors.deadline?.message}>
            <input type="date" min={today()} className={inputClass} {...register('deadline')} />
          </Field>
        </div>
        <div>
          <p className="eyebrow text-stone-deep" id="ref-label">
            Reference image (optional)
          </p>
          <label className="mt-3 flex min-h-28 cursor-pointer items-center gap-5 border border-dashed border-sand p-4 hover:border-obsidian focus-within:ring-2 focus-within:ring-gold">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img src={preview} alt="Your reference image" className="h-20 w-16 object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-20 w-16 items-center justify-center bg-bone text-2xl text-stone">+</span>
            )}
            <span className="text-sm">
              {file ? file.name : 'Add an image of a silhouette, detail or fabric you like'}
              <span className="block text-xs text-stone-deep">JPEG, PNG or WebP, up to 5 MB</span>
            </span>
            <input
              type="file"
              accept={UPLOAD_TYPES.join(',')}
              className="sr-only"
              aria-labelledby="ref-label"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {fileError && (
            <p role="alert" className="mt-1.5 text-sm text-fit-tight">
              {fileError}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-serif text-2xl">Your measurements</legend>
        {hydrated && profiles.length > 0 ? (
          <>
            <Field label="Measurement profile">
              <select className={inputClass} {...register('profileId')}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            {profile && (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 bg-bone p-4 text-sm sm:grid-cols-4">
                {(['height', 'bust', 'waist', 'hip', 'shoulder', 'arm', 'inseam'] as const)
                  .filter((k) => profile.measurements[k] != null)
                  .map((k) => (
                    <div key={k}>
                      <dt className="text-xs text-stone-deep capitalize">{k === 'bust' && profile.base === 'menswear' ? 'chest' : k}</dt>
                      <dd className="tabular-nums">{formatLength(profile.measurements[k]!, unit)}</dd>
                    </div>
                  ))}
              </dl>
            )}
            <p className="text-xs text-stone-deep">
              Need to adjust?{' '}
              <Link href={`/fit-studio${productSlug ? `?product=${productSlug}` : ''}`} className="underline decoration-gold underline-offset-2">
                Edit in the Fit Studio
              </Link>
            </p>
          </>
        ) : (
          <p className="bg-bone p-4 text-sm">
            No saved measurements yet.{' '}
            <Link href={`/fit-studio${productSlug ? `?product=${productSlug}` : ''}`} className="underline decoration-gold underline-offset-2">
              Add them in the Fit Studio
            </Link>{' '}
            (it takes two minutes), or book a consultation below and we will measure you.
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-serif text-2xl">Fitting consultation</legend>
        <div className="flex flex-col gap-2 sm:flex-row" role="radiogroup" aria-label="Consultation">
          {(
            [
              ['none', 'Not needed'],
              ['virtual', 'Virtual'],
              ['in-person', 'In person, London'],
            ] as const
          ).map(([v, l]) => (
            <label key={v} className={radio(consultation === v)}>
              <input type="radio" value={v} className="sr-only" {...register('consultation')} />
              {l}
            </label>
          ))}
        </div>
        {consultation !== 'none' && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Date" error={errors.consultDate?.message}>
              <input type="date" min={today()} className={inputClass} {...register('consultDate')} />
            </Field>
            <Field label="Time" error={errors.consultTime?.message}>
              <select className={inputClass} defaultValue="" {...register('consultTime')}>
                <option value="" disabled>
                  Choose a time
                </option>
                {TIME_SLOTS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="mb-2 font-serif text-2xl">You</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input autoComplete="name" className={inputClass} {...register('name')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
          </Field>
        </div>
      </fieldset>

      {serverError && (
        <p role="alert" className="text-sm text-fit-tight">
          {serverError}
        </p>
      )}
      <Button type="submit" variant="oxblood" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : 'Send my request'}
      </Button>
      <p className="text-xs text-stone-deep">
        Your measurements are sent only with this request, and used only to make your piece. See our{' '}
        <Link href="/privacy" className="underline decoration-gold underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
