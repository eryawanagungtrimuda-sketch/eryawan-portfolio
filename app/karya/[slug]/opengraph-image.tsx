import { ImageResponse } from 'next/og';
import { absoluteUrl } from '@/lib/site-url';
import { getPublishedProjectBySlug } from '@/lib/projects';

export const runtime = 'nodejs';
export const alt = 'Studi Kasus Proyek | Eryawan Agung';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function resolveImageUrl(url?: string | null) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

function trimText(content?: string | null, max = 190) {
  if (!content) return null;
  const cleaned = content.trim();
  if (!cleaned) return null;
  return cleaned.length > max ? `${cleaned.slice(0, max - 3)}...` : cleaned;
}

function resolveProjectImage(project: Awaited<ReturnType<typeof getPublishedProjectBySlug>>) {
  if (!project) return absoluteUrl('/hero.jpg');
  const galleryImage = [...(project.project_images || [])]
    .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
    .find((image) => image.image_url)?.image_url;

  return resolveImageUrl(project.cover_image) || resolveImageUrl(galleryImage) || absoluteUrl('/hero.jpg');
}

export default async function Image({ params }: { params: { slug: string } }) {
  const project = await getPublishedProjectBySlug(params.slug);
  const ogImage = resolveProjectImage(project);
  const hasProject = Boolean(project);
  const description = trimText(project?.problem) || trimText(project?.konteks) || 'Studi kasus desain yang membaca masalah ruang, keputusan desain, dan dampaknya terhadap pengguna.';
  const category = trimText(project?.design_category) || trimText(project?.category);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #050505 0%, #0B0A08 46%, #151109 100%)',
          color: '#F4F1EA',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 12%, rgba(212,175,55,0.22), transparent 38%)' }} />
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, border: '1px solid rgba(212,175,55,0.48)' }} />

        <div style={{ position: 'absolute', top: 24, right: 24, bottom: 24, width: 430, display: 'flex', overflow: 'hidden' }}>
          <img src={ogImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.35) 48%, rgba(5,5,5,0.58) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '62px 520px 62px 72px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 2, background: '#D4AF37' }} />
              <span style={{ fontSize: 30, letterSpacing: 1.6, color: '#D4AF37', textTransform: 'uppercase' }}>Studi Kasus Proyek</span>
            </div>
            <h1 style={{ margin: 0, fontSize: hasProject ? 60 : 54, lineHeight: 1.05, letterSpacing: -1.4, display: 'flex' }}>
              {hasProject ? project?.title : 'Proyek tidak ditemukan'}
            </h1>
            <p style={{ margin: 0, fontSize: 27, lineHeight: 1.35, color: 'rgba(244,241,234,0.82)', display: 'flex' }}>{description}</p>
            {category ? <span style={{ fontSize: 21, color: 'rgba(212,175,55,0.92)', letterSpacing: 0.8 }}>Kategori: {category}</span> : null}
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
