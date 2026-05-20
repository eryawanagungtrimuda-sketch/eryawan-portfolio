import { ImageResponse } from 'next/og';
import { absoluteUrl } from '@/lib/site-url';
import { getPublishedInsightBySlug } from '@/lib/insights';

export const runtime = 'nodejs';
export const alt = 'Wawasan Desain | Eryawan Agung';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

function trimExcerpt(excerpt?: string | null) {
  if (!excerpt) return null;
  const cleaned = excerpt.trim();
  if (!cleaned) return null;
  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const insight = await getPublishedInsightBySlug(params.slug);
  const coverImage = resolveImageUrl(insight?.cover_image) || absoluteUrl('/hero.jpg');
  const hasInsight = Boolean(insight);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #060606 0%, #0B0A08 45%, #13100A 100%)',
          color: '#F4F1EA',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 15%, rgba(212,175,55,0.22), transparent 40%)' }} />
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, border: '1px solid rgba(212,175,55,0.45)' }} />

        <div style={{ position: 'absolute', top: 24, right: 24, bottom: 24, width: 430, display: 'flex', overflow: 'hidden' }}>
          <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,6,6,0.9) 0%, rgba(6,6,6,0.2) 48%, rgba(6,6,6,0.5) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '64px 520px 64px 72px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 2, background: '#D4AF37' }} />
              <span style={{ fontSize: 30, letterSpacing: 1.8, color: '#D4AF37', textTransform: 'uppercase' }}>Wawasan Desain</span>
            </div>
            <h1 style={{ margin: 0, fontSize: hasInsight ? 62 : 54, lineHeight: 1.05, letterSpacing: -1.5, display: 'flex' }}>
              {hasInsight ? insight?.title : 'Insight tidak ditemukan'}
            </h1>
            {hasInsight && trimExcerpt(insight?.excerpt) ? <p style={{ margin: 0, fontSize: 28, lineHeight: 1.35, color: 'rgba(244,241,234,0.8)', display: 'flex' }}>{trimExcerpt(insight?.excerpt)}</p> : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 34, color: '#F4F1EA' }}>Eryawan Agung</span>
            <span style={{ fontSize: 22, color: 'rgba(244,241,234,0.68)', letterSpacing: 0.8 }}>eryawanagung.my.id</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
