# AutoParts Benin — marketing site

A premium, motion-driven single-page site built from the AutoParts Benin 2026 client brief.

## Run it
It's a static site with no build step:

```bash
cd autoparts-benin
python3 -m http.server 8000   # then open http://localhost:8000
```

## What's inside
- `index.html`: all content (hero, market opportunity, competitor matrix, research, revenue model, three strategic moves, 90-day plan, risk, sign-up CTA)
- `css/styles.css`: design tokens, layout and responsive rules
- `js/main.js`: motion and interactions
- Libraries load from CDNs: GSAP 3.12.5 + ScrollTrigger and Chart.js 4.4.1 (cdnjs), Lenis 1.1.13 (jsDelivr)

## Motion
- Preloader, then a staged hero reveal with a parallax photo and a rotating brake-disc graphic
- Lenis smooth scrolling synced with GSAP ScrollTrigger
- Word-by-word headline reveals, count-up stats and 3D tilt cards
- A cinematic image frame that opens as you scroll
- A sticky image that swaps as each "three forces" argument scrolls past
- Pinned horizontal scroll through the 90-day plan with a live day counter
- A magnetic cursor and buttons on desktop
- `prefers-reduced-motion` is respected: animation is skipped and all content shows immediately

## Notes
- Photos are hot-linked from Unsplash. If an image fails to load, a branded gradient takes its place.
- The sign-up form is front-end only. Connect it to a backend or form service to collect submissions.
