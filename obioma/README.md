# Obioma

A luxury fashion house website with a **Fit Studio**: enter your measurements, choose a
piece, and see in real time how it sits on a body shaped like yours, with a zone-by-zone
fit report and a size recommendation.

Built with Next.js (App Router) + TypeScript, Tailwind CSS v4, Framer Motion, Zustand,
React Hook Form + Zod, and Stripe Checkout (test mode).

## Getting started

```bash
cd obioma
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Vitest unit tests (fit engine, units) |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run format` | Prettier (with Tailwind class sorting) |

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | No | Stripe **test** secret key (`sk_test_...`). Without it, checkout runs in mock mode and goes straight to the success page. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public URL, used for metadata, sitemap, JSON-LD and Stripe redirect URLs. Defaults to `http://localhost:3000`. |

Deploy to Vercel by importing the repository, setting the **root directory to `obioma`**,
and adding the variables above.

## Project structure

```
app/                     Routes (App Router). One folder per page; API stubs in app/api.
components/
  layout/                Header, footer, bag drawer, search, cookie banner, dialogs
  ui/                    Buttons, logo, icons, reveal animations, accordions
  product/               Product cards, gallery, purchase panel, collection filters, bag
  fit-studio/            Fit Studio UI (form, outfit picker, report, compare)
    render/              The avatar renderer (FitRenderer interface + parametric SVG)
  home/, account/, forms/
data/                    Sample catalogue, collections, editorial content, image URLs
lib/
  fit/                   Fit engine (pure, renderer-agnostic, unit-tested)
  catalog/               Catalogue access layer (swap for a CMS / Shopify here)
  payments/              Stripe Checkout, isolated (server + client)
  auth/                  Mock email-only auth behind an AuthProvider interface
  store/                 Zustand stores persisted to localStorage
docs/fit-studio-v2.md    Design note for the 3D renderer
```

## Design tokens

All colours live in `app/globals.css` under `@theme` and are used as Tailwind utilities
(`bg-ivory`, `text-obsidian`, `border-sand`, `text-gold`, `bg-fit-ideal`...) or as CSS
variables (`var(--color-gold)`) in SVG. `stone-deep` is an extra, darker stone used for
small secondary text so it passes WCAG AA on ivory and bone; plain `stone` is for
placeholders and icons. Gold is decoration only (rules, focus rings, active states).

Fonts are Cormorant Garamond (display) and Manrope (body), loaded with `next/font`.

## The Fit Studio

### Fit engine (`lib/fit`)

Pure TypeScript with no React or DOM dependency:

1. **Resolve the body** (`body.ts`): optional measurements (shoulder, arm, inseam, neck,
   thigh, upper arm) are estimated from height/bust/hip using simple anthropometric
   ratios when missing, and flagged as estimated. Landmark heights (bust, waist, hip,
   knee, mid-calf, ankle...) are derived from height and inseam.
2. **Ease per zone** (`engine.ts`): `ease = garment − body`. Circumference zones accept
   extra negative ease on stretch fabrics (`stretch × 12%` of the body measurement).
   Each zone is classified tight / ideal / loose against the product's `idealEase`, with
   a plain-English label (snug, too tight, relaxed, slightly long...).
3. **Length** is scored by where the hem lands on this body relative to the designed
   hemline (`intendedHem`: hip, knee, midi, ankle...), and described against the nearest
   landmark ("falls 4 cm below the knee").
4. **Scores:** each zone scores 96–100 inside its ideal range (highest at the centre) and
   falls off smoothly (Gaussian) outside it, more steeply for tight than loose. Zones are
   weighted by garment type (`weights.ts`); estimated measurements count half. The size
   score is the weighted average, tempered by the worst important zone so a bust that
   cannot close is never hidden by three perfect zones.
5. **Recommendation:** the highest-scoring size. If it scores below 60, made to measure
   is suggested. Near-ties are reported as "between M and L".

Run `npm test` to see the cases covered: ideal fit, too tight, too loose, between sizes,
stretch fabric, missing optional measurements, hem placement, made-to-measure fallback,
and every enabled product recommending the expected size for a standard body.

### Avatar renderer (`components/fit-studio/render`)

`FitRenderer` is the seam between the UI and the drawing:

```ts
interface FitRenderer {
  render(body, garment, size, colour, view, showHeatmap): ReactNode;
}
```

v1 (`svgFitRenderer`) builds a parametric scene (`scene.ts`) from the resolved body and
the garment measurements at the selected size: control points for neck, shoulders,
bust, waist, hips, thighs, knees and ankles, smoothed into cubic Béziers. Garments are
drawn from the same points, so tight garments sit skin-tight with drag lines, loose ones
hang wider with folds, and hems land at the right height. Every point list has a fixed
length per garment type, so changes are spring-animated point by point (`useSpring.ts`).
See `docs/fit-studio-v2.md` for the 3D upgrade path.

### Privacy

Measurements are stored on the device (localStorage) unless saved to the account, can be
deleted from the Fit Studio or account page, and are explained in `/privacy`.

## Adding a product

Add an entry to `data/products.ts`:

1. Basic fields: `id`, `slug`, `name`, `price` (whole pounds), `category`, `line`
   (`womenswear` / `menswear`), `colours` (name + hex), `images`, copy fields.
2. `fitStudio`:
   - `garmentType` and `fitStyle` choose the drawing and the zone weights.
   - `sizes`: **finished garment** measurements per size, in cm (circumference for
     bust/waist/hip, seam-to-seam shoulder, sleeve from shoulder point, length from the
     high point shoulder, or from the waist for skirts, inseam for trousers).
   - `idealEase`: the ease range per zone the piece is designed for (min/max cm). Only
     zones listed here are scored.
   - `stretch`: 0 for woven, up to ~0.6 for high-stretch knits.
   - `intendedHem`: where the hem should land, used to score length.
   - Set `enabled: false` to hide a piece from the Fit Studio (its sizes still feed the
     size guide table).
3. `madeToMeasure` / `madeToMeasurePrice` to offer it bespoke.

Run `npm test`: the "every enabled product" test checks that a standard body gets a
sensible recommendation for the new piece.

To move the catalogue to a CMS or Shopify Storefront API, reimplement the functions in
`lib/catalog/index.ts`; pages only use those.

## Payments

`lib/payments/server.ts` creates a Stripe Checkout Session, re-reading prices from the
catalogue on the server. Use test cards such as `4242 4242 4242 4242`. Without a key the
mock flow still records the order locally and shows `/order/success`.

## Placeholders to replace before launch

- Photography (Unsplash placeholders, see `public/images/README.md`).
- Copy marked as placeholder (atelier story, testimonials, terms, contact details).
- API stubs: `/api/newsletter`, `/api/contact`, `/api/made-to-measure` validate input and
  return a reference, but do not deliver anywhere yet.
- Mock auth (`lib/auth`) and mock orders.
