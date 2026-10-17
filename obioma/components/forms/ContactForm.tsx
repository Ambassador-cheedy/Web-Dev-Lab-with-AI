'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactValues } from '@/lib/forms';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from './Field';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: 'Fit & sizing' },
  });
  if (sent)
    return (
      <p role="status" className="bg-bone p-8 font-serif text-2xl">
        Thank you. We reply to every message within one working day.
      </p>
    );
  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v),
        }).catch(() => null);
        if (res?.ok) setSent(true);
        else setError('We could not send your message. Please try again or email us.');
      })}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" error={formState.errors.name?.message}>
          <input autoComplete="name" className={inputClass} {...register('name')} />
        </Field>
        <Field label="Email" error={formState.errors.email?.message}>
          <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
        </Field>
      </div>
      <Field label="Topic">
        <select className={inputClass} {...register('topic')}>
          {['Order', 'Fit & sizing', 'Made to measure', 'Press', 'Other'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Message" error={formState.errors.message?.message}>
        <textarea rows={6} className={`${inputClass} resize-y`} {...register('message')} />
      </Field>
      {error && (
        <p role="alert" className="text-fit-tight text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={formState.isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
