'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BodyBase, BodyMeasurements } from '@/lib/fit/types';
import { estimateOptional } from '@/lib/fit/body';
import {
  MEASUREMENT_FIELDS,
  fieldLabel,
  measurementSchema,
  softWarnings,
  toCm,
  type MeasurementKey,
} from '@/lib/fit/measurements';
import { toDisplay, type Unit } from '@/lib/units';
import { Button } from '@/components/ui/Button';
import { MeasureField } from './MeasureField';

type FormValues = Partial<Record<MeasurementKey, number>>;

type Props = {
  base: BodyBase;
  unit: Unit;
  /** Starting values in cm. The form is keyed by the parent, so this is read once. */
  initial: Partial<BodyMeasurements>;
  /** Called on every change with the valid values, in cm. */
  onLive: (m: Partial<BodyMeasurements>) => void;
  onSave: (m: BodyMeasurements) => void;
  saveLabel: string;
};

export function MeasurementForm({ base, unit, initial, onLive, onSave, saveLabel }: Props) {
  const defaultValues = useMemo(() => {
    const v: FormValues = {};
    for (const f of MEASUREMENT_FIELDS) {
      const cm = initial[f.key];
      if (cm != null) v[f.key] = toDisplay(cm, unit, 1);
    }
    return v;
  }, [initial, unit]);

  const { control, handleSubmit, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(measurementSchema(unit) as never) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- watch() subscription drives live avatar updates
    const sub = watch((values) => onLive(toCm(values as FormValues, unit)));
    return () => sub.unsubscribe();
  }, [watch, onLive, unit]);

  const live = toCm(watch(), unit);
  const warnings = softWarnings(live);
  const estimates =
    live.height && live.bust && live.hip
      ? estimateOptional(base, {
          height: live.height,
          bust: live.bust,
          waist: live.waist ?? 70,
          hip: live.hip,
        })
      : null;

  const required = MEASUREMENT_FIELDS.filter((f) => f.required);
  const optional = MEASUREMENT_FIELDS.filter((f) => !f.required);

  const renderField = (f: (typeof MEASUREMENT_FIELDS)[number]) => (
    <Controller
      key={f.key}
      name={f.key}
      control={control}
      render={({ field, fieldState }) => (
        <MeasureField
          field={f}
          label={fieldLabel(f, base)}
          unit={unit}
          value={field.value}
          onChange={field.onChange}
          estimate={
            !f.required && estimates && f.key in estimates
              ? toDisplay(estimates[f.key as keyof typeof estimates], unit, unit === 'cm' ? 0 : 1)
              : undefined
          }
          error={fieldState.error?.message}
          warning={warnings[f.key]}
        />
      )}
    />
  );

  return (
    <form
      onSubmit={handleSubmit((values) => onSave(toCm(values, unit) as BodyMeasurements))}
      noValidate
      aria-label="Your measurements"
    >
      <fieldset>
        <legend className="eyebrow mb-1">Required</legend>
        <div className="divide-sand/70 divide-y">{required.map(renderField)}</div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="eyebrow">Optional</legend>
        <p className="text-stone-deep mt-1 text-xs">
          These improve accuracy. Empty fields are estimated from your height and build.
        </p>
        <div className="divide-sand/70 divide-y">{optional.map(renderField)}</div>
      </fieldset>
      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={!formState.isValid && formState.isSubmitted}
      >
        {saveLabel}
      </Button>
      {formState.isSubmitted && !formState.isValid && (
        <p role="alert" className="text-fit-tight mt-2 text-sm">
          Please check the highlighted measurements.
        </p>
      )}
    </form>
  );
}
