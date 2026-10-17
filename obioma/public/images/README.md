# Imagery

All imagery on the site is **placeholder photography** loaded from Unsplash
(see `data/images.ts` and the `images` arrays in `data/products.ts`).

Before launch, replace every placeholder with Obioma's own photography:

1. Add optimised originals here, e.g. `public/images/products/adaeze-column-dress-1.jpg`
   (recommended: 2000px on the long edge, 4:5 portrait for products, JPEG/AVIF).
2. Update the paths in `data/products.ts` and `data/images.ts` to `/images/...`.
3. Remove the `images.unsplash.com` entry from `remotePatterns` in `next.config.ts`.

If an image fails to load, `EditorialImage` shows a quiet branded placeholder rather
than a broken-image icon.
