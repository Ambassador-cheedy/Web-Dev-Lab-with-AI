'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '@/lib/catalog/types';
import type { BodyBase, BodyMeasurements } from '@/lib/fit/types';
import { evaluateFit } from '@/lib/fit';
import { PRESETS } from '@/lib/fit/measurements';
import { SKIN_TONES, useActiveProfile, useMeasurements } from '@/lib/store/measurements';
import { useBag } from '@/lib/store/bag';
import { useLooks } from '@/lib/store/looks';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { UnitToggle } from '@/components/ui/UnitToggle';
import { DownloadIcon, CheckIcon } from '@/components/ui/Icons';
import { MeasurementForm } from './MeasurementForm';
import { OutfitPanel } from './OutfitPanel';
import { FitReportCard } from './FitReportCard';
import { CompareDialog } from './CompareDialog';
import { exportAvatarPng } from './exportImage';
import { svgFitRenderer } from './render/svgRenderer';
import type { AvatarBody, FitRenderer, View } from './render/types';

type Tab = 'body' | 'outfit' | 'fit';

export function FitStudio({
  products,
  initialSlug,
  renderer = svgFitRenderer,
}: {
  products: Product[];
  initialSlug?: string;
  renderer?: FitRenderer;
}) {
  const router = useRouter();
  const profile = useActiveProfile();
  const unit = useMeasurements((s) => s.unit);
  const setUnit = useMeasurements((s) => s.setUnit);
  const profiles = useMeasurements((s) => s.profiles);
  const saveProfile = useMeasurements((s) => s.save);
  const setActive = useMeasurements((s) => s.setActive);
  const removeAll = useMeasurements((s) => s.removeAll);
  const user = useAuth((s) => s.user);
  const addToBag = useBag((s) => s.add);
  const saveLook = useLooks((s) => s.save);
  const looks = useLooks((s) => s.looks);

  const initialProduct = products.find((p) => p.slug === initialSlug) ?? null;
  const [base, setBase] = useState<BodyBase>(profile?.base ?? initialProduct?.line ?? 'womenswear');
  const [skinTone, setSkinTone] = useState(profile?.skinTone ?? 'golden');
  const [profileId, setProfileId] = useState<string | undefined>(profile?.id);
  const [profileName, setProfileName] = useState(profile?.name ?? 'Me');
  const [initialValues, setInitialValues] = useState<Partial<BodyMeasurements>>(
    profile?.measurements ?? PRESETS[base][0]!.measurements,
  );
  const [measurements, setMeasurements] = useState<BodyMeasurements>(
    (profile?.measurements ?? PRESETS[base][0]!.measurements) as BodyMeasurements,
  );
  const [formKey, setFormKey] = useState(0);

  const [product, setProduct] = useState<Product>(initialProduct ?? products.find((p) => p.line === base) ?? products[0]!);
  const [colour, setColour] = useState(product.colours[0]!.name);
  const [manualSize, setManualSize] = useState<string | null>(null);
  const [view, setView] = useState<View>('front');
  const [heatmap, setHeatmap] = useState(false);
  const [tab, setTab] = useState<Tab>(initialProduct ? 'fit' : 'body');
  const [compareOpen, setCompareOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery('(min-width: 1024px)');

  const body: AvatarBody = useMemo(() => ({ base, skinTone, measurements }), [base, skinTone, measurements]);
  const report = useMemo(() => evaluateFit(body, product.fitStudio), [body, product]);
  const size = manualSize ?? (report.recommendedSize || product.fitStudio.sizes[0]!.label);

  const notify = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2600);
  };

  const onLive = useCallback((m: Partial<BodyMeasurements>) => {
    setMeasurements((prev) => ({
      height: m.height ?? prev.height,
      bust: m.bust ?? prev.bust,
      waist: m.waist ?? prev.waist,
      hip: m.hip ?? prev.hip,
      shoulder: m.shoulder,
      arm: m.arm,
      inseam: m.inseam,
      neck: m.neck,
      thigh: m.thigh,
      upperArm: m.upperArm,
    }));
  }, []);

  const loadValues = (m: Partial<BodyMeasurements>) => {
    setInitialValues(m);
    setMeasurements(m as BodyMeasurements);
    setFormKey((k) => k + 1);
  };

  const switchBase = (b: BodyBase) => {
    if (b === base) return;
    setBase(b);
    loadValues(PRESETS[b][0]!.measurements);
    const match = products.find((p) => p.line === b);
    if (product.line !== b && match) selectProduct(match);
  };

  const selectProduct = (p: Product) => {
    setProduct(p);
    setColour(p.colours[0]!.name);
    setManualSize(null);
  };

  const persist = (m: BodyMeasurements = measurements) => {
    const id = saveProfile({ id: profileId, name: profileName.trim() || 'Me', base, skinTone, measurements: m, syncedToAccount: !!user });
    setProfileId(id);
    return id;
  };

  const loadProfile = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setActive(id);
    setProfileId(p.id);
    setProfileName(p.name);
    setBase(p.base);
    setSkinTone(p.skinTone);
    loadValues(p.measurements);
  };

  const newProfile = () => {
    setProfileId(undefined);
    setProfileName(profiles.length ? `Profile ${profiles.length + 1}` : 'Me');
    loadValues(PRESETS[base][0]!.measurements);
  };

  const deleteAll = () => {
    if (!window.confirm('Delete all measurements saved on this device? This cannot be undone.')) return;
    removeAll();
    setProfileId(undefined);
    setProfileName('Me');
    loadValues(PRESETS[base][0]!.measurements);
    notify('Your measurements have been deleted');
  };

  const download = async () => {
    const svg = stageRef.current?.querySelector('svg');
    if (!svg) return;
    await exportAvatarPng(svg, `${product.name} · ${colour} · Size ${size}`, `obioma-${product.slug}-${size}.png`).catch(() =>
      notify('Sorry, the image could not be created'),
    );
  };

  const share = async () => {
    const url = `${window.location.origin}/fit-studio?product=${product.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: `${product.name} · Obioma`, url });
      else {
        await navigator.clipboard.writeText(url);
        notify('Link copied');
      }
    } catch {
      // share sheet dismissed
    }
  };

  const goMadeToMeasure = () => {
    persist();
    router.push(`/made-to-measure?product=${product.slug}`);
  };

  const current = report.sizes.find((s) => s.size === size)!;

  /* ---------- panels ---------- */

  const bodyPanel = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Body base" className="inline-flex border border-sand">
          {(['womenswear', 'menswear'] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={base === b}
              onClick={() => switchBase(b)}
              className={cn('eyebrow min-h-10 px-4', base === b ? 'bg-obsidian text-ivory' : 'text-stone-deep hover:text-obsidian')}
            >
              {b === 'womenswear' ? 'Womenswear' : 'Menswear'}
            </button>
          ))}
        </div>
        <UnitToggle
          unit={unit}
          onChange={(u) => {
            setUnit(u);
            setInitialValues(measurements);
            setFormKey((k) => k + 1);
          }}
        />
      </div>

      <fieldset className="mt-6">
        <legend className="eyebrow mb-3">Skin tone</legend>
        <div className="grid grid-cols-8 gap-2">
          {SKIN_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.name}
              aria-pressed={skinTone === t.id}
              onClick={() => setSkinTone(t.id)}
              className={cn('aspect-square w-full max-w-10 rounded-full border border-sand', skinTone === t.id && 'ring-1 ring-obsidian ring-offset-2 ring-offset-ivory')}
              style={{ background: t.hex }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="eyebrow mb-3">Quick start</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS[base].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadValues(p.measurements)}
              title={p.note}
              className="min-h-10 border border-sand px-3 text-xs hover:border-obsidian"
            >
              {p.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-3">
        <label className="block">
          <span className="eyebrow">Profile name</span>
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            maxLength={30}
            className="mt-1 min-h-11 w-full border-b border-sand bg-transparent text-base outline-none focus:border-gold"
          />
        </label>
        {profiles.length > 0 && (
          <label>
            <span className="sr-only">Load a saved profile</span>
            <select
              value={profileId ?? ''}
              onChange={(e) => (e.target.value === '__new' ? newProfile() : loadProfile(e.target.value))}
              className="min-h-11 max-w-36 border border-sand bg-ivory px-2 text-sm"
            >
              {!profileId && <option value="">Unsaved</option>}
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="__new">+ New profile</option>
            </select>
          </label>
        )}
      </div>

      <div className="mt-4">
        <MeasurementForm
          key={`${formKey}-${unit}-${base}`}
          base={base}
          unit={unit}
          initial={initialValues}
          onLive={onLive}
          onSave={(m) => {
            persist(m);
            notify(user ? 'Saved to your account' : 'Saved on this device');
          }}
          saveLabel={profileId ? 'Update profile' : 'Save profile'}
        />
      </div>

      <div className="mt-6 border-t border-sand pt-4 text-xs leading-relaxed text-stone-deep">
        <p>
          Your measurements stay on this device unless you save them to your account.{' '}
          <a href="/privacy#measurements" className="underline decoration-gold underline-offset-2">
            How we use them
          </a>
        </p>
        {profiles.length > 0 && (
          <button type="button" onClick={deleteAll} className="mt-3 min-h-10 text-fit-tight underline underline-offset-2">
            Delete my measurements
          </button>
        )}
      </div>
    </div>
  );

  const outfitPanel = (
    <OutfitPanel
      products={products}
      base={base}
      selected={product}
      onSelect={(p) => {
        selectProduct(p);
      }}
      colour={colour}
      onColour={setColour}
      size={size}
      onSize={setManualSize}
      report={report}
    />
  );

  const fitPanel = (
    <div>
      <FitReportCard product={product} report={report} size={size} unit={unit} base={base} onMadeToMeasure={goMadeToMeasure} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          className="col-span-2"
          onClick={() =>
            addToBag({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0]!, price: product.price, colour, size })
          }
        >
          Add to bag · size {size}
        </Button>
        <Button
          variant="secondary"
          className="px-3"
          onClick={() => {
            saveLook({ productSlug: product.slug, productName: product.name, colour, size, score: current.score, profileName });
            notify('Look saved');
          }}
        >
          Save look
        </Button>
        <Button variant="secondary" className="px-3" onClick={() => setCompareOpen(true)}>
          Compare
        </Button>
        <Button variant="secondary" className="px-3" onClick={download}>
          <DownloadIcon className="h-4 w-4" /> Image
        </Button>
        <Button variant="secondary" className="px-3" onClick={share}>
          Share
        </Button>
      </div>
      {looks.length > 0 && (
        <div className="mt-6">
          <h3 className="eyebrow mb-2 text-stone-deep">Saved looks</h3>
          <ul className="flex flex-wrap gap-2">
            {looks.slice(0, 6).map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    const p = products.find((x) => x.slug === l.productSlug);
                    if (!p) return;
                    selectProduct(p);
                    setColour(l.colour);
                    setManualSize(l.size);
                  }}
                  className="min-h-10 border border-sand px-3 text-left text-xs hover:border-obsidian"
                >
                  {l.productName} · {l.size}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /* ---------- stage ---------- */

  const stage = (
    <div className="relative flex h-full flex-col">
      <div ref={stageRef} className="relative min-h-0 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={product.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {renderer.render(body, product, size, colour, view, heatmap)}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <div role="radiogroup" aria-label="View" className="inline-flex border border-sand bg-ivory">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              onClick={() => setView(v)}
              className={cn('eyebrow min-h-10 px-3 text-[0.65rem]', view === v ? 'bg-obsidian text-ivory' : 'text-stone-deep')}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={heatmap}
          onClick={() => setHeatmap((h) => !h)}
          className={cn('eyebrow inline-flex min-h-10 items-center gap-2 border px-3 text-[0.65rem]', heatmap ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand bg-ivory text-stone-deep')}
        >
          <span aria-hidden="true" className="flex gap-0.5">
            <span className="h-2 w-2 rounded-full bg-fit-tight" />
            <span className="h-2 w-2 rounded-full bg-fit-ideal" />
            <span className="h-2 w-2 rounded-full bg-fit-loose" />
          </span>
          Fit heatmap
        </button>
        <p className="eyebrow ml-1 text-[0.65rem] text-stone-deep" aria-live="polite">
          Size {size} · {current.score}/100
        </p>
      </div>
      {heatmap && (
        <p className="mt-1 text-center text-[0.7rem] text-stone-deep">
          <span className="text-fit-tight">●</span> tight <span className="ml-2 text-fit-ideal">●</span> ideal{' '}
          <span className="ml-2 text-fit-loose">●</span> loose
        </p>
      )}
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'body', label: '1 · Body' },
    { id: 'outfit', label: '2 · Outfit' },
    { id: 'fit', label: '3 · Fit' },
  ];

  return (
    <>
      {!desktop ? (
      <div>
        <div className="sticky top-16 z-20 -mx-4 border-b border-sand bg-ivory px-4 pt-2 pb-3 sm:-mx-8 sm:px-8">
          <div className="mx-auto h-[46vh] max-w-sm">{stage}</div>
        </div>
        <div role="tablist" aria-label="Fit Studio steps" className="grid grid-cols-3 border-b border-sand">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn('eyebrow min-h-12', tab === t.id ? 'border-b-2 border-gold text-obsidian' : 'text-stone-deep')}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tabs.map((t) => (
          <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id} className="py-6">
            {t.id === 'body' ? bodyPanel : t.id === 'outfit' ? outfitPanel : fitPanel}
          </div>
        ))}
      </div>

      ) : (
      <div className="grid gap-8 grid-cols-[minmax(300px,360px)_1fr_minmax(320px,380px)] xl:gap-12">
        <section aria-labelledby="body-title" className="pb-12">
          <h2 id="body-title" className="mb-5 font-serif text-2xl">
            <span className="mr-2 text-gold">1</span> Your body
          </h2>
          {bodyPanel}
        </section>
        <section aria-label="Your avatar" className="sticky top-24 h-[calc(100vh-7rem)] self-start">
          {stage}
        </section>
        <section className="space-y-10 pb-12">
          <div>
            <h2 className="mb-5 font-serif text-2xl">
              <span className="mr-2 text-gold">2</span> Choose a piece
            </h2>
            {outfitPanel}
          </div>
          <div>
            <h2 className="mb-5 font-serif text-2xl">
              <span className="mr-2 text-gold">3</span> See your fit
            </h2>
            {fitPanel}
          </div>
        </section>
      </div>
      )}

      <AnimatePresence>
        {compareOpen && (
          <CompareDialog
            products={products}
            body={body}
            initial={{ productId: product.id, size, colour }}
            onClose={() => setCompareOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flash && (
          <motion.p
            role="status"
            className="fixed bottom-6 left-1/2 z-[65] flex -translate-x-1/2 items-center gap-2 bg-obsidian px-5 py-3 text-sm text-ivory"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <CheckIcon className="h-4 w-4 text-gold-light" /> {flash}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
