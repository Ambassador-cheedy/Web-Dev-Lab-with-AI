'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { useHydrated } from '@/lib/store/hydration';
import { useMeasurements } from '@/lib/store/measurements';
import { useOrders } from '@/lib/store/orders';
import { useWishlist } from '@/lib/store/wishlist';
import { useLooks } from '@/lib/store/looks';
import type { Product } from '@/lib/catalog/types';
import { formatLength } from '@/lib/units';
import { cn, formatPrice } from '@/lib/utils';
import { Button, ButtonLink } from '@/components/ui/Button';
import { UnitToggle } from '@/components/ui/UnitToggle';
import { ProductCard } from '@/components/product/ProductCard';
import { Field, inputClass } from '@/components/forms/Field';

const TABS = [
  { id: 'measurements', label: 'My measurements' },
  { id: 'orders', label: 'Orders' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'requests', label: 'Made to measure' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function AccountView({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'measurements') as TabId;
  const setTab = (id: TabId) => router.replace(`/account?tab=${id}`, { scroll: false });

  if (!hydrated) return <div className="h-96" aria-busy="true" />;

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-20">
      <aside className="min-w-0">
        {user ? (
          <div className="border-b border-sand pb-6">
            <p className="eyebrow text-stone-deep">Signed in as</p>
            <p className="mt-1 truncate">{user.name ?? user.email}</p>
            <button type="button" onClick={() => signOut()} className="eyebrow link-luxe mt-3 min-h-10">
              Sign out
            </button>
          </div>
        ) : (
          <SignIn />
        )}
        <nav aria-label="Account sections" className="mt-6">
          <ul role="tablist" aria-orientation="vertical" className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <li key={t.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`acc-tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`acc-panel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'eyebrow min-h-11 w-full shrink-0 px-3 text-left whitespace-nowrap transition-colors lg:border-l',
                    tab === t.id ? 'border-gold bg-bone text-obsidian' : 'border-transparent text-stone-deep hover:text-obsidian',
                  )}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className="min-w-0" id={`acc-panel-${tab}`} role="tabpanel" aria-labelledby={`acc-tab-${tab}`}>
        {tab === 'measurements' && <MeasurementsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'wishlist' && <WishlistTab products={products} />}
        {tab === 'requests' && <RequestsTab />}
      </section>
    </div>
  );
}

function SignIn() {
  const signIn = useAuth((s) => s.signIn);
  const schema = z.object({ email: z.email('Please enter a valid email address'), name: z.string().optional() });
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit((v) => signIn(v.email, v.name || undefined))} noValidate className="space-y-4 border-b border-sand pb-6">
      <p className="font-serif text-2xl">Sign in</p>
      <p className="text-xs text-stone-deep">Demo sign-in: email only, stored on this device.</p>
      <Field label="Email" error={formState.errors.email?.message}>
        <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
      </Field>
      <Field label="Name (optional)">
        <input autoComplete="name" className={inputClass} {...register('name')} />
      </Field>
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}

function Empty({ children, cta }: { children: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="border border-sand p-10 text-center">
      <p className="font-serif text-2xl italic">{children}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

function MeasurementsTab() {
  const profiles = useMeasurements((s) => s.profiles);
  const remove = useMeasurements((s) => s.remove);
  const removeAll = useMeasurements((s) => s.removeAll);
  const setActive = useMeasurements((s) => s.setActive);
  const activeId = useMeasurements((s) => s.activeId);
  const unit = useMeasurements((s) => s.unit);
  const setUnit = useMeasurements((s) => s.setUnit);
  const user = useAuth((s) => s.user);
  const looks = useLooks((s) => s.looks);
  const removeLook = useLooks((s) => s.remove);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-title font-light">My measurements</h2>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
      <p className="mt-2 max-w-xl text-sm text-stone-deep">
        {user
          ? 'Profiles saved while signed in are linked to your account.'
          : 'Your measurements stay on this device unless you save them to your account.'}
      </p>
      {profiles.length === 0 ? (
        <div className="mt-8">
          <Empty cta={<ButtonLink href="/fit-studio">Open the Fit Studio</ButtonLink>}>No measurement profiles yet.</Empty>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <li key={p.id} className={cn('border p-6', p.id === activeId ? 'border-gold' : 'border-sand')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl">{p.name}</h3>
                  <p className="text-xs text-stone-deep">
                    {p.base === 'womenswear' ? 'Womenswear' : 'Menswear'} · updated {dateFmt.format(new Date(p.updatedAt))}
                    {p.syncedToAccount ? ' · on account' : ' · this device'}
                  </p>
                </div>
                {p.id === activeId && <span className="eyebrow bg-obsidian px-2 py-1 text-[0.6rem] text-ivory">Active</span>}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {(['height', 'bust', 'waist', 'hip', 'shoulder', 'inseam'] as const)
                  .filter((k) => p.measurements[k] != null)
                  .map((k) => (
                    <div key={k}>
                      <dt className="text-xs text-stone-deep capitalize">{k === 'bust' && p.base === 'menswear' ? 'chest' : k}</dt>
                      <dd className="tabular-nums">{formatLength(p.measurements[k]!, unit)}</dd>
                    </div>
                  ))}
              </dl>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {p.id !== activeId && (
                  <button type="button" onClick={() => setActive(p.id)} className="eyebrow link-luxe min-h-10">
                    Make active
                  </button>
                )}
                <Link href="/fit-studio" onClick={() => setActive(p.id)} className="eyebrow link-luxe inline-flex min-h-10 items-center">
                  Edit in Fit Studio
                </Link>
                <button
                  type="button"
                  onClick={() => window.confirm(`Delete “${p.name}”?`) && remove(p.id)}
                  className="eyebrow min-h-10 text-fit-tight"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {profiles.length > 0 && (
        <button
          type="button"
          onClick={() => window.confirm('Delete all measurement profiles from this device?') && removeAll()}
          className="mt-6 min-h-10 text-sm text-fit-tight underline underline-offset-2"
        >
          Delete my measurements
        </button>
      )}
      {looks.length > 0 && (
        <div className="mt-14">
          <h3 className="eyebrow mb-3 text-stone-deep">Saved looks</h3>
          <ul className="divide-y divide-sand border-y border-sand">
            {looks.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <Link href={`/fit-studio?product=${l.productSlug}`} className="link-luxe">
                  {l.productName} · {l.colour} · size {l.size}
                </Link>
                <span className="text-stone-deep">
                  {l.profileName} · fit {l.score}
                  <button type="button" onClick={() => removeLook(l.id)} className="ml-4 text-fit-tight" aria-label={`Remove saved look ${l.productName}`}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const MOCK_ORDER = {
  id: 'OB-1042',
  createdAt: '2026-08-14T10:00:00Z',
  lines: [{ name: 'Nneka Wrap Dress', colour: 'Terracotta', size: 'M', quantity: 1, price: 540 }],
  total: 540,
  status: 'Delivered' as const,
};

function OrdersTab() {
  const orders = useOrders((s) => s.orders);
  const all = [...orders, MOCK_ORDER];
  return (
    <div>
      <h2 className="text-title font-light">Orders</h2>
      <ul className="mt-8 space-y-4">
        {all.map((o) => (
          <li key={o.id} className="border border-sand p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-xl">Order {o.id}</p>
              <p className="eyebrow text-stone-deep">{o.status}</p>
            </div>
            <p className="text-xs text-stone-deep">{dateFmt.format(new Date(o.createdAt))}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {o.lines.map((l, i) => (
                <li key={i}>
                  {l.quantity} × {l.name} · {l.colour} · {l.size}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">Total {formatPrice(o.total)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-stone-deep">Order {MOCK_ORDER.id} is sample data.</p>
    </div>
  );
}

function WishlistTab({ products }: { products: Product[] }) {
  const ids = useWishlist((s) => s.ids);
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <div>
      <h2 className="text-title font-light">Wishlist</h2>
      {items.length === 0 ? (
        <div className="mt-8">
          <Empty cta={<ButtonLink href="/collections" variant="secondary">Explore the collection</ButtonLink>}>Nothing saved yet.</Empty>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} sizes="(min-width: 768px) 25vw, 50vw" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestsTab() {
  const requests = useOrders((s) => s.requests);
  return (
    <div>
      <h2 className="text-title font-light">Made-to-measure requests</h2>
      {requests.length === 0 ? (
        <div className="mt-8">
          <Empty cta={<ButtonLink href="/made-to-measure" variant="oxblood">Begin a request</ButtonLink>}>No requests yet.</Empty>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {requests.map((r) => (
            <li key={r.id} className="border border-sand p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-serif text-xl">{r.productName ?? 'A new piece'}</p>
                <p className="eyebrow text-oxblood">{r.status}</p>
              </div>
              <p className="text-xs text-stone-deep">
                {r.id} · {dateFmt.format(new Date(r.createdAt))}
              </p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-stone-deep">Occasion</dt>
                  <dd>{r.occasion}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-deep">Profile</dt>
                  <dd>{r.profileName ?? 'To be measured'}</dd>
                </div>
                {r.consultation && (
                  <div>
                    <dt className="text-xs text-stone-deep">Consultation</dt>
                    <dd>
                      {r.consultation.type === 'virtual' ? 'Virtual' : 'In person'}, {dateFmt.format(new Date(r.consultation.date))} at {r.consultation.time}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
