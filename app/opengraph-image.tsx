import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Eryawan Agung Portfolio Design Strategy';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #080807 0%, #11110f 42%, #1d1a10 100%)',
          color: '#F4F1EA',
          padding: '72px',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              color: '#D4AF37',
              fontSize: 24,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Eryawan Agung
          </div>

          <div
            style={{
              maxWidth: 900,
              fontSize: 74,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              fontWeight: 600,
            }}
          >
            Portfolio Design Strategy
          </div>

          <div
            style={{
              maxWidth: 760,
              color: 'rgba(244,241,234,0.68)',
              fontSize: 30,
              lineHeight: 1.35,
              fontWeight: 400,
            }}
          >
            Strategic Design, Spatial Logic, and Professional Collaboration
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(212,175,55,0.28)',
            paddingTop: '28px',
            color: 'rgba(244,241,234,0.62)',
            fontSize: 22,
            letterSpacing: '0.08em',
          }}
        >
          <span>eryawanagung.my.id</span>
          <span style={{ color: '#D4AF37' }}>Design Strategy</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
