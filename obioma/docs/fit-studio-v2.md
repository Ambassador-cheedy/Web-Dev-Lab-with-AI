# Fit Studio v2: 3D renderer (design note)

Status: **planned, not built.** v1 ships a parametric SVG avatar. This note describes
how a 3D version replaces it without touching the fit engine or the Fit Studio UI.

## What stays the same

| Layer                                                          | Location                                                | v2 impact                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Fit engine (ease, zone scores, size recommendation)            | `lib/fit/`                                              | None. Pure functions; the renderer only reads its output.          |
| Body model (resolved measurements, landmarks, hem positions)   | `lib/fit/body.ts`                                       | None. 3D uses the same landmark heights to drive bones and morphs. |
| Product data (`fitStudio` spec, garment measurements per size) | `data/products.ts`, `lib/catalog`                       | Add optional `model3d` asset URLs per garment type.                |
| UI (measurement form, outfit picker, fit report, compare)      | `components/fit-studio/*`                               | None, apart from choosing the renderer.                            |
| Renderer contract                                              | `components/fit-studio/render/types.ts` (`FitRenderer`) | v2 implements the same interface.                                  |

```ts
interface FitRenderer {
  render(body, garment, size, colour, view: 'front' | 'back' | 'side', showHeatmap): ReactNode;
}
```

`FitStudio` takes `renderer` as a prop (default `svgFitRenderer`). v2 passes
`threeFitRenderer`, ideally behind a capability check (WebGL2, device memory) with the
SVG renderer as the fallback.

## Body: morphable mesh

- **Library:** React Three Fiber + drei, loaded with `next/dynamic` (`ssr: false`) so the
  3D bundle only loads on the Fit Studio.
- **Base meshes:** one womenswear and one menswear base body (glTF, ~15k triangles),
  neutral A-pose, sculpted in the same stylised, featureless language as v1.
- **Blend shapes (morph targets)** authored for: bust/chest girth, under-bust, waist girth,
  hip girth, thigh girth, upper-arm girth, shoulder width, neck girth, belly depth, seat
  depth. Each is authored at a +1 unit of girth so weights can be solved linearly.
- **Driving the morphs:** for each girth, solve the morph weight so the mesh's measured
  circumference at the landmark height (`getLandmarks`) equals the user's measurement.
  Measure by slicing the mesh with a plane at that height; a few Newton iterations per
  change are fast enough to run on the slider.
- **Height and limb lengths:** scale bones rather than morphs: spine/pelvis from
  height, femur/tibia from inseam, humerus/forearm from arm length.
- **Skin tone:** the same eight tones as a `MeshStandardMaterial` colour plus a subtle
  subsurface approximation.

## Garments: 3D meshes with simple cloth

- One template mesh per `garmentType` (dress, top, shirt, jacket, trousers, skirt, suit,
  agbada, kaftan), skinned to the same skeleton, with matching blend shapes.
- **Size fitting:** set the garment morphs from the garment measurements at the selected
  size (not the body's), exactly as v1 sets SVG widths from garment circumference.
- **Collision and drape:** a position-based-dynamics cloth pass (for example a small
  custom solver in a Web Worker, or `three-cloth` style Verlet) run for ~60 iterations
  after each change, with the body as a signed-distance collider. Fitted garments use
  high stiffness; relaxed/oversized pieces (kaftan, agbada) get lower stiffness and
  gravity-driven drape.
- **Tension visualisation:** per-vertex stretch ratio from the solver replaces v1's drag
  lines; render as subtle normal-map wrinkles plus, in heatmap mode, a vertex-colour
  overlay using the engine's zone status (`fit-tight`, `fit-ideal`, `fit-loose`).
- **Fabric:** PBR materials per `textureFor()` family (twill, rib, linen, sheen, damask),
  tinted with the selected colour.

## Views and interaction

- 360° orbit with `OrbitControls`, clamped polar angle; front/back/side buttons animate
  the camera to fixed azimuths so the existing `view` prop still works.
- Respect `prefers-reduced-motion` by snapping the camera and skipping cloth settling
  animation.
- Keep the SVG `<desc>` approach for accessibility: render a visually hidden text
  description of the fit report alongside the canvas.

## Optional: "upload a photo" mode

- Client-side pose and silhouette estimation (e.g. MediaPipe Pose + selfie
  segmentation) from a front and side photo with a known height.
- Estimate girths from silhouette widths with the same ellipse model v1 uses in
  reverse, pre-fill the measurement form, and **ask the user to confirm**.
- Photos are processed on the device and never uploaded. Update the privacy page.

## Performance budget

- 3D bundle < 250 kB gzipped, lazy loaded. Target 60 fps on a 2021 mid-range phone;
  fall back to SVG below a frame-time threshold.
- Cloth solve off the main thread; morph solve on the main thread (cheap).

## Migration steps

1. Add `components/fit-studio/render3d/ThreeFitRenderer.tsx` implementing `FitRenderer`.
2. Add a renderer switch in `FitStudioLoader` (feature flag + capability check).
3. Author base bodies and garment templates; add `model3d` fields to products.
4. Ship behind a flag; compare recommendations (should be identical, since the engine is shared) and user satisfaction against v1.
