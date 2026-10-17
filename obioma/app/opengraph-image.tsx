import { ImageResponse } from 'next/og';

export const alt = 'Obioma · Made for the body you live in';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/* Satori renders outside the page, so brand tokens are repeated here as literals. */
const OBSIDIAN = '#111010';
const IVORY = '#F6F1E9';
const GOLD = '#B8925A';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: OBSIDIAN,
        color: IVORY,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          border: `2px solid ${IVORY}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 54,
            height: 78,
            borderRadius: '50%',
            border: `5px solid ${IVORY}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ width: 36, height: 58, borderRadius: '50%', border: `1.5px solid ${GOLD}` }}
          />
        </div>
      </div>
      <div style={{ marginTop: 48, fontSize: 84, letterSpacing: 28, fontFamily: 'serif' }}>
        OBIOMA
      </div>
      <div style={{ marginTop: 24, width: 80, height: 1, background: GOLD }} />
      <div
        style={{
          marginTop: 24,
          fontSize: 30,
          opacity: 0.8,
          fontFamily: 'serif',
          fontStyle: 'italic',
        }}
      >
        Made for the body you live in.
      </div>
    </div>,
    size,
  );
}
