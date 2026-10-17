import type { FitRenderer } from './types';
import { SvgAvatar } from './SvgAvatar';

/** v1 renderer: parametric SVG. */
export const svgFitRenderer: FitRenderer = {
  render(body, garment, size, colour, view, showHeatmap) {
    return (
      <SvgAvatar
        body={body}
        product={garment}
        size={size}
        colour={colour}
        view={view === 'side' ? 'front' : view}
        showHeatmap={showHeatmap}
        className="h-full w-full"
        svgId="fit-avatar"
      />
    );
  },
};
