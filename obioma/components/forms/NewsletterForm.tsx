'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const schema = z.object({ email: z.email('Please enter a valid email address') });
type Values = z.infer<typeof schema>;

export function NewsletterForm({
  tone = 'dark',
  id = 'newsletter',
}: {
  tone?: 'dark' | 'light';
  id?: string;
}) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    }).catch(() => null);
    setDone(true);
  };

  const dark = tone === 'dark';
  if (done) {
    return (
      <p
        role="status"
        className={cn('font-serif text-xl italic', dark ? 'text-gold-light' : 'text-obsidian')}
      >
        Thank you. You will hear from us, quietly and rarely.
      </p>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          'flex items-end border-b',
          dark
            ? 'border-ivory/40 focus-within:border-gold-light'
            : 'border-obsidian/50 focus-within:border-gold',
        )}
      >
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${id}-error` : undefined}
          className={cn(
            'min-h-12 flex-1 bg-transparent py-3 text-base outline-none',
            dark
              ? 'text-ivory placeholder:text-ivory/50'
              : 'text-obsidian placeholder:text-stone-deep',
          )}
          {...register('email')}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'eyebrow min-h-12 px-2 transition-colors',
            dark ? 'hover:text-gold-light' : 'hover:text-gold',
          )}
        >
          Subscribe
        </button>
      </div>
      {errors.email && (
        <p
          id={`${id}-error`}
          className={cn('mt-2 text-sm', dark ? 'text-gold-light' : 'text-fit-tight')}
        >
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
