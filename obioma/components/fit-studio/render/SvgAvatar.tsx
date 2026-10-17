'use client';

import { useId, useMemo } from 'react';
import type { Product } from '@/lib/catalog/types';
import { evaluateSize, getLandmarks, resolveBody, describeSize } from '@/lib/fit';
import type { SizeResult, Zone, ZoneStatus } from '@/lib/fit/types';
import { SKIN_TONES } from '@/lib/store/measurements';
import { buildScene, CX, VIEW_H, VIEW_W, VIEW_TOP, groundY, type Scene } from './scene';
import { flattenScene, unflattenScene } from './flatten';
import { linePath, smoothPath, type Pt } from './path';
import { useSpringArray } from './useSpring';
import { luminance, textureFor, type Texture } from './textures';
import type { AvatarBody, View } from './types';

const ZONE_NAME: Record<Zone, string> = {
  shoulder: 'Shoulder',
  bust: 'Bust',
  waist: 'Waist',
  hip: 'Hip',
  length: 'Length',
  sleeve: 'Sleeve',
  inseam: 'Leg',
};

const STATUS_VAR: Record<ZoneStatus, string> = {
  tight: 'var(--color-fit-tight)',
  ideal: 'var(--color-fit-ideal)',
  loose: 'var(--color-fit-loose)',
};

const BACK_DETAILS = /^(crease|waistband|pleat|drape|slit|dart)/;

export type SvgAvatarProps = {
  body: AvatarBody;
  product: Product | null;
  size: string;
  colour: string;
  view: View;
  showHeatmap: boolean;
  className?: string;
  /** Pass an id to make the <svg> addressable for export. */
  svgId?: string;
};

export function SvgAvatar({ body, product, size, colour, view, showHeatmap, className, svgId }: SvgAvatarProps) {
  const uid = useId().replace(/:/g, '');
  const resolved = useMemo(() => resolveBody(body), [body]);
  const L = useMemo(() => getLandmarks(resolved), [resolved]);

  const garmentSize = product?.fitStudio.sizes.find((s) => s.label === size) ?? product?.fitStudio.sizes[0] ?? null;
  const result: SizeResult | null = useMemo(
    () => (product && garmentSize ? evaluateSize(resolved, product.fitStudio, garmentSize) : null),
    [product, garmentSize, resolved],
  );
  const target = useMemo(
    () => buildScene(resolved, L, product && garmentSize ? { spec: product.fitStudio, size: garmentSize, result } : null),
    [resolved, L, product, garmentSize, result],
  );
  const flat = useMemo(() => flattenScene(target), [target]);
  const animated = useSpringArray(flat, `${product?.id ?? 'none'}|${target.key}`);
  const scene = animated.length === flat.length ? unflattenScene(target, animated) : target;

  const skin = SKIN_TONES.find((t) => t.id === body.skinTone) ?? SKIN_TONES[3]!;
  const colourHex = product?.colours.find((c) => c.name === colour)?.hex ?? product?.colours[0]?.hex ?? 'var(--color-stone)';
  const dark = luminance(colourHex) < 0.18;
  const lineColour = dark ? 'rgba(255,255,255,0.28)' : 'rgba(17,16,16,0.28)';
  const texture: Texture = product ? textureFor(product) : 'plain';
  const statusOf = (z: Zone) => result?.zones.find((r) => r.zone === z);

  const title = product ? `Avatar wearing ${product.name} in size ${size}, ${colour}` : 'Avatar';
  const desc = result
    ? `${view === 'back' ? 'Back' : 'Front'} view. Fit score ${result.score} out of 100: ${describeSize(result)}. ${result.zones
        .map((z) => `${ZONE_NAME[z.zone]}: ${z.label}${z.detail ? `, ${z.detail}` : ''}`)
        .join('. ')}.`
    : 'Body silhouette without a garment.';

  const id = (s: string) => `${s}-${uid}`;
  const shape = (name: string) => scene.shapes[name];
  const hasSleeves = !!shape('sleeveR');

  const garmentLayer = product && shape('garment') && (
    <g>
      <path d={smoothPath(shape('garment')!)} fill={colourHex} />
      {texture !== 'plain' && <path d={smoothPath(shape('garment')!)} fill={`url(#${id('tex')})`} />}
      <path d={smoothPath(shape('garment')!)} fill={`url(#${id('shade')})`} />
    </g>
  );
  const sleeves = hasSleeves && (
    <g>
      {(['sleeveR', 'sleeveL'] as const).map((s) => (
        <g key={s}>
          <path d={smoothPath(shape(s)!)} fill={colourHex} />
          {texture !== 'plain' && <path d={smoothPath(shape(s)!)} fill={`url(#${id('tex')})`} />}
          <path d={smoothPath(shape(s)!)} fill={`url(#${id('shadeV')})`} />
        </g>
      ))}
    </g>
  );
  const arms = (
    <g fill={`url(#${id('skin')})`}>
      <path d={smoothPath(shape('armR')!)} />
      <path d={smoothPath(shape('armL')!)} />
    </g>
  );
  const piece2 = shape('piece2') && (
    <g>
      <path d={smoothPath(shape('piece2')!)} fill={colourHex} />
      <path d={smoothPath(shape('piece2')!)} fill={`url(#${id('shade')})`} />
      {texture !== 'plain' && <path d={smoothPath(shape('piece2')!)} fill={`url(#${id('tex')})`} />}
    </g>
  );

  const garmentOutline = shape('garment');
  const backSeam: Pt[] | null =
    garmentOutline && view === 'back'
      ? [
          [CX, scene.garmentType === 'trousers' || scene.garmentType === 'skirt' ? garmentOutline[0]![1] : scene.shapes.body![1]![1]],
          [CX, garmentOutline[garmentOutline.length / 2 - 1]![1] - 2],
        ]
      : null;

  return (
    <svg
      id={svgId}
      viewBox={`0 ${VIEW_TOP} ${VIEW_W} ${VIEW_H - VIEW_TOP}`}
      className={className}
      role="img"
      aria-labelledby={`${id('title')} ${id('desc')}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={id('title')}>{title}</title>
      <desc id={id('desc')}>{desc}</desc>
      <defs>
        <linearGradient id={id('skin')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={skin.shadow} />
          <stop offset="0.3" stopColor={skin.hex} />
          <stop offset="0.7" stopColor={skin.hex} />
          <stop offset="1" stopColor={skin.shadow} />
        </linearGradient>
        <radialGradient id={id('head')} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor={skin.hex} />
          <stop offset="1" stopColor={skin.shadow} />
        </radialGradient>
        <linearGradient id={id('shade')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.26" />
          <stop offset="0.18" stopColor="#000" stopOpacity="0.04" />
          <stop offset="0.42" stopColor="#fff" stopOpacity={texture === 'sheen' ? 0.16 : 0.06} />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={id('shadeV')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <TexturePattern id={id('tex')} texture={texture} dark={dark} />
        {(['tight', 'ideal', 'loose'] as const).map((s) => (
          <linearGradient key={s} id={id(`band-${s}`)} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={STATUS_VAR[s]} stopOpacity="0" />
            <stop offset="0.3" stopColor={STATUS_VAR[s]} stopOpacity="0.72" />
            <stop offset="0.7" stopColor={STATUS_VAR[s]} stopOpacity="0.72" />
            <stop offset="1" stopColor={STATUS_VAR[s]} stopOpacity="0" />
          </linearGradient>
        ))}
        <clipPath id={id('clip-main')}>
          {shape('garment') && <path d={smoothPath(shape('garment')!)} />}
          {shape('piece2') && scene.garmentType === 'suit' && <path d={smoothPath(shape('piece2')!)} />}
        </clipPath>
        <clipPath id={id('clip-sleeves')}>
          {hasSleeves && <path d={smoothPath(shape('sleeveR')!)} />}
          {hasSleeves && <path d={smoothPath(shape('sleeveL')!)} />}
        </clipPath>
        <clipPath id={id('clip-legs')}>{shape('piece2') && <path d={smoothPath(shape('piece2')!)} />}</clipPath>
      </defs>

      {/* Height rule */}
      <g aria-hidden="true">
        <line x1="34" x2="34" y1={scene.heights.crown} y2={groundY} stroke="var(--color-sand)" strokeWidth="1" />
        <line x1="28" x2="40" y1={scene.heights.crown} y2={scene.heights.crown} stroke="var(--color-gold)" strokeWidth="1" />
        {Array.from({ length: Math.floor((groundY - scene.heights.crown) / 35.5) + 1 }, (_, i) => (
          <line key={i} x1="34" x2={i % 5 === 0 ? 42 : 38} y1={groundY - i * 35.5} y2={groundY - i * 35.5} stroke="var(--color-sand)" strokeWidth="1" />
        ))}
      </g>

      <ellipse cx={shape('shadow')![0]![0]} cy={groundY + 2} rx={shape('shadow')![1]![0]} ry={6} fill="var(--color-obsidian)" opacity="0.08" />

      {/* Body */}
      <path d={smoothPath(shape('body')!)} fill={`url(#${id('skin')})`} />
      <ellipse cx={shape('head')![0]![0]} cy={shape('head')![0]![1]} rx={shape('head')![1]![0]} ry={shape('head')![1]![1]} fill={`url(#${id('head')})`} />
      {view === 'back' && (
        <g aria-hidden="true">
          <ellipse
            cx={shape('head')![0]![0]}
            cy={shape('head')![0]![1] - shape('head')![1]![1] * 0.15}
            rx={shape('head')![1]![0] * 1.02}
            ry={shape('head')![1]![1] * 0.88}
            fill={skin.shadow}
            opacity="0.55"
          />
          {!product && <line x1={CX} x2={CX} y1={scene.shapes.body![1]![1]} y2={scene.shapes.body![7]![1]} stroke={skin.shadow} strokeWidth="1.2" />}
        </g>
      )}

      {shape('base') && <path d={smoothPath(shape('base')!)} fill="var(--color-stone)" opacity="0.55" />}
      {piece2}
      {shape('shirt') && <path d={smoothPath(shape('shirt')!)} fill="var(--color-white)" stroke="var(--color-sand)" strokeWidth="0.75" />}
      {scene.coversArms ? (
        <>
          {arms}
          {garmentLayer}
        </>
      ) : (
        <>
          {garmentLayer}
          {arms}
        </>
      )}
      {sleeves}

      {/* Construction details */}
      <g fill="none" stroke={lineColour} strokeWidth="1" strokeLinecap="round" aria-hidden="true">
        {Object.entries(scene.details)
          .filter(([k]) => view === 'front' || BACK_DETAILS.test(k))
          .map(([k, pts]) => (
            <path
              key={k}
              d={pts.length > 2 ? smoothPath(pts, false) : linePath(pts)}
              stroke={k.startsWith('embroidery') ? 'var(--color-gold-light)' : undefined}
              strokeWidth={k.startsWith('embroidery') ? 1.4 : 1}
            />
          ))}
        {backSeam && <path d={linePath(backSeam)} />}
        {view === 'front' &&
          scene.buttons.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill={dark ? 'rgba(255,255,255,0.35)' : 'rgba(17,16,16,0.35)'} stroke="none" />)}
      </g>

      {/* Drag lines and folds */}
      <g fill="none" strokeLinecap="round" aria-hidden="true">
        {Object.entries(scene.stress).map(([k, pts]) => {
          const a = scene.intensity[k] ?? 0;
          if (a < 0.02) return null;
          const fold = /-f\d$|^pool/.test(k);
          return (
            <path
              key={k}
              d={smoothPath(pts, false)}
              stroke={dark ? '#ffffff' : '#000000'}
              strokeOpacity={a * (fold ? 0.22 : 0.32)}
              strokeWidth={fold ? 1.6 : 1.1}
            />
          );
        })}
      </g>

      {scene.coversArms && (
        <g fill={`url(#${id('skin')})`}>
          {/* hands emerge from long robes */}
          <path d={smoothPath(shape('armR')!.slice(5, 11))} />
          <path d={smoothPath(shape('armL')!.slice(5, 11))} />
        </g>
      )}

      {showHeatmap && result && <Heatmap scene={scene} statusOf={statusOf} id={id} />}
    </svg>
  );
}

function Heatmap({
  scene,
  statusOf,
  id,
}: {
  scene: Scene;
  statusOf: (z: Zone) => { status: ZoneStatus; label: string } | undefined;
  id: (s: string) => string;
}) {
  const bands = scene.bands.filter((b) => statusOf(b.zone));
  return (
    <g>
      {bands.map((b) => {
        const s = statusOf(b.zone)!;
        return (
          <rect
            key={`band-${b.zone}`}
            x="0"
            width={VIEW_W}
            y={b.top}
            height={Math.max(2, b.bottom - b.top)}
            fill={`url(#${id(`band-${s.status}`)})`}
            clipPath={`url(#${id(`clip-${b.clip}`)})`}
            style={{ mixBlendMode: 'multiply' }}
          />
        );
      })}
      <g fontFamily="var(--font-sans)" fontSize="12.5" letterSpacing="0.06em" aria-hidden="true">
        {bands.map((b, i) => {
          const s = statusOf(b.zone)!;
          const right = i % 2 === 0;
          const y = (b.top + b.bottom) / 2;
          const ax = right ? b.anchorX : 2 * CX - b.anchorX;
          const tx = right ? VIEW_W - 6 : 6;
          return (
            <g key={`label-${b.zone}`}>
              <line x1={ax} x2={right ? tx - 92 : tx + 92} y1={y} y2={y} stroke="var(--color-obsidian)" strokeOpacity="0.35" strokeWidth="0.75" />
              <circle cx={ax} cy={y} r="2.5" fill={STATUS_VAR[s.status]} />
              <text
                x={tx}
                y={y + 4}
                textAnchor={right ? 'end' : 'start'}
                fill="var(--color-obsidian)"
                stroke="var(--color-ivory)"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {ZONE_NAME[b.zone].toUpperCase()} · {s.label}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

function TexturePattern({ id, texture, dark }: { id: string; texture: Texture; dark: boolean }) {
  const ink = dark ? '#ffffff' : '#000000';
  switch (texture) {
    case 'twill':
      return (
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={ink} strokeOpacity="0.07" strokeWidth="1.2" />
        </pattern>
      );
    case 'rib':
      return (
        <pattern id={id} width="3.2" height="10" patternUnits="userSpaceOnUse">
          <line x1="0.8" y1="0" x2="0.8" y2="10" stroke={ink} strokeOpacity="0.12" strokeWidth="1.1" />
        </pattern>
      );
    case 'linen':
      return (
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 1.2h5M2.6 0v5" stroke={ink} strokeOpacity="0.06" strokeWidth="0.9" />
        </pattern>
      );
    case 'oxford':
      return (
        <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="1.5" height="1.5" fill={ink} fillOpacity="0.05" />
        </pattern>
      );
    case 'crepe':
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill={ink} fillOpacity="0.08" />
          <circle cx="4" cy="3.5" r="0.5" fill={ink} fillOpacity="0.06" />
        </pattern>
      );
    case 'damask':
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M8 2 L13 8 L8 14 L3 8 Z" fill="none" stroke={ink} strokeOpacity="0.08" strokeWidth="0.8" />
        </pattern>
      );
    case 'velvet':
    case 'sheen':
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#fff" fillOpacity="0" />
        </pattern>
      );
    default:
      return null;
  }
}
