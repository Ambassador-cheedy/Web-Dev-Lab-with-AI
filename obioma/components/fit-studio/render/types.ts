import type { ReactNode } from 'react';
import type { BodyProfile } from '@/lib/fit/types';
import type { Product } from '@/lib/catalog/types';

export type View = 'front' | 'back' | 'side';

/** A body profile plus how the avatar should look. */
export type AvatarBody = BodyProfile & { skinTone: string };

/**
 * Anything that can draw a body wearing a garment. v1 is the parametric SVG
 * renderer; a React Three Fiber renderer can implement the same interface
 * (see docs/fit-studio-v2.md) without touching the fit engine or the UI.
 */
export interface FitRenderer {
  render(
    body: AvatarBody,
    garment: Product | null,
    size: string,
    colour: string,
    view: View,
    showHeatmap: boolean,
  ): ReactNode;
}
