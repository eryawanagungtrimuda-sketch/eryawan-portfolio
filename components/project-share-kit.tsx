'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Link2,
  MessageCircle,
  Music2,
  Pin,
  Share2,
  Youtube,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type SharePlatform = 'instagram' | 'pinterest' | 'facebook' | 'linkedin' | 'whatsapp' | 'tiktok' | 'youtube';

type ProjectShareKitProps = {
  title: string;
  slug: string;
  canonicalUrl: string;
  summary?: string | null;
  context?: string | null;
  conflict?: string | null;
  designDecision?: string | null;
  approach?: string | null;
  impact?: string | null;
  insight?: string | null;
  category?: string | null;
  year?: string | number | null;
  areaTags?: string[] | null;
  coverImage?: string | null;
};

type ShareDraft = {
  title: string;
  body: string;
  instruction: string;
};

const platforms: { key: SharePlatform; label: string; Icon: typeof Instagram }[] = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'pinterest', label: 'Pinterest', Icon: Pin },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'youtube', label: 'YouTube Shorts', Icon: Youtube },
];

function clean(value?: string | null) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function shorten(value: string, limit: number) {
  const text = clean(value);
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1).trim() + '…';
}

function buildHashtags(areaTags?: string[] | null) {
  const area = (areaTags || [])
    .map((tag) => tag.replace(/[^a-z0-9]/gi, ''))
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => '#' + tag);
  return Array.from(new Set(['#DesainInterior', '#InteriorDesign', '#EryawanAgung', ...area])).join(' ');
}

function buildDrafts(props: ProjectShareKitProps): Record<SharePlatform, ShareDraft> {
  const projectName = clean(props.title) + (props.year ? ' (' + props.year + ')' : '');
  const context = clean(props.context) || clean(props.summary);
  const decision = clean(props.designDecision) || clean(props.approach) || clean(props.summary);
  const approach = clean(props.approach);
  const impact = clean(props.impact);
  const insight = clean(props.insight);
  const category = clean(props.category);
  const tags = buildHashtags(props.areaTags);
  const contextSentence = context ? shorten(context, 300) : 'Studi kasus desain interior ' + projectName + '.';
  const decisionSentence = decision ? 'Keputusan desain: ' + shorten(decision, 260) : '';
  const impactSentence = impact ? 'Dampak visual: ' + shorten(impact, 220) : '';
  const approachSentence = approach ? 'Pendekatan: ' + shorten(approach, 220) : '';
  const insightSentence = insight ? 'Insight desain: ' + shorten(insight, 200) : '';
  const link = props.canonicalUrl;

  return {
    instagram: {
      title: projectName,
      body: [
        projectName,
        '',
        contextSentence,
        decisionSentence,
        '',
        'Baca studi kasus lengkap: ' + link,
        '',
        tags,
      ].filter(Boolean).join('\n'),
      instruction: 'Salin caption, lalu unggah foto atau carousel proyek di Instagram. Tautan website bisa dicantumkan di bio atau Story.',
    },
    pinterest: {
      title: shorten(projectName + ' | Desain Interior ' + (category || 'Hunian'), 100),
      body: [
        'Studi kasus desain interior ' + projectName + '.',
        contextSentence,
        decisionSentence,
        'Lihat detail proyek: ' + link,
        tags,
      ].filter(Boolean).join('\n\n'),
      instruction: 'Salin judul dan deskripsi, lalu buat Pin menggunakan gambar cover atau gambar terbaik dari proyek.',
    },
    facebook: {
      title: projectName,
      body: [
        'Studi kasus interior: ' + projectName,
        '',
        contextSentence,
        decisionSentence,
        impactSentence,
        '',
        'Lihat proyek lengkap: ' + link,
      ].filter(Boolean).join('\n'),
      instruction: 'Caption dapat langsung ditempel pada postingan Facebook bersama gambar proyek.',
    },
    linkedin: {
      title: 'Studi Kasus Desain Interior — ' + projectName,
      body: [
        'Studi kasus desain interior: ' + projectName,
        '',
        contextSentence,
        decisionSentence,
        approachSentence,
        insightSentence,
        '',
        'Baca selengkapnya: ' + link,
        '',
        tags,
      ].filter(Boolean).join('\n'),
      instruction: 'Gunakan sebagai ringkasan profesional. Periksa kembali detail proyek sebelum memublikasikan.',
    },
    whatsapp: {
      title: projectName,
      body: [
        'Saya ingin berbagi studi kasus desain interior: ' + projectName + '.',
        contextSentence,
        'Lihat proyek lengkap di website: ' + link,
      ].filter(Boolean).join('\n\n'),
      instruction: 'Teks ini bisa dikirim ke kontak, grup, atau WhatsApp Status bersama gambar proyek.',
    },
    tiktok: {
      title: projectName,
      body: [
        'Di balik desain ' + projectName + ':',
        contextSentence,
        decisionSentence,
        'Studi kasus lengkap: ' + link,
        '',
        tags,
      ].filter(Boolean).join('\n'),
      instruction: 'Salin caption, lalu unggah video atau slideshow proyek melalui TikTok.',
    },
    youtube: {
      title: shorten(projectName + ' | Studi Kasus Desain Interior', 100),
      body: [
        'Studi kasus desain interior ' + projectName + '.',
        '',
        contextSentence,
        decisionSentence,
        impactSentence,
        insightSentence,
        '',
        'Lihat portfolio lengkap: ' + link,
        '',
        tags + ' #Shorts',
      ].filter(Boolean).join('\n'),
      instruction: 'Gunakan judul dan deskripsi ini saat mengunggah video pendek proyek ke YouTube Shorts.',
    },
  };
}

function getPlatformUrl(platform: SharePlatform, canonicalUrl: string, body: string) {
  const encodedUrl = encodeURIComponent(canonicalUrl);
  if (platform === 'facebook') return 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
  if (platform === 'linkedin') return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl;
  if (platform === 'whatsapp') return 'https://wa.me/?text=' + encodeURIComponent(body);
  if (platform === 'tiktok') return 'https://www.tiktok.com/upload';
  if (platform === 'youtube') return 'https://studio.youtube.com/';
  if (platform === 'pinterest') return 'https://www.pinterest.com/';
  return 'https://www.instagram.com/';
}

export default function ProjectShareKit(props: ProjectShareKitProps) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<SharePlatform>('instagram');
  const [copied, setCopied] = useState<'title' | 'body' | 'link' | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setIsAdmin(isAllowedAdminEmail(data.user?.email));
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setReady(true);
      }
    }

    void checkAdmin();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const drafts = useMemo(() => buildDrafts(props), [props]);
  const activeDraft = drafts[activePlatform];
  const activePlatformInfo = platforms.find((platform) => platform.key === activePlatform) || platforms[0];

  async function copyValue(value: string, kind: 'title' | 'body' | 'link') {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setFeedback(kind === 'title' ? 'Judul berhasil disalin.' : kind === 'body' ? 'Caption berhasil disalin.' : 'Tautan proyek berhasil disalin.');
    } catch {
      setCopied(null);
      setFeedback('Browser belum mengizinkan salin otomatis. Pilih teks lalu salin secara manual.');
    }
  }

  async function shareProjectLink() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: props.title,
          text: clean(props.summary) || clean(props.context),
          url: props.canonicalUrl,
        });
        setFeedback('Menu berbagi perangkat dibuka.');
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    await copyValue(props.canonicalUrl, 'link');
  }

  if (!ready || !isAdmin) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <button
          type="button"
          onClick={() => { setOpen(true); setFeedback(''); }}
          className="pointer-events-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#0B0A08]/95 px-6 py-3 font-sans text-sm font-semibold text-[#E6C676] shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur transition hover:border-[#D4AF37] hover:bg-[#17140D]"
          aria-label={'Siapkan konten sosial untuk ' + props.title}
        >
          <Share2 size={16} aria-hidden="true" />
          Siapkan Konten Sosial
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-2 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-share-kit-title"
            className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#D4AF37]/30 bg-[#0D0C0A] p-4 text-[#F4F1EA] shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Share Kit</p>
                <h2 id="project-share-kit-title" className="mt-2 font-display text-2xl font-normal leading-tight sm:text-3xl">Bagikan {props.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">Caption dan tautan disiapkan dari data proyek. Tidak ada biaya AI tambahan.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/15 text-white/75 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]" aria-label="Tutup Share Kit">×</button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {platforms.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActivePlatform(key); setCopied(null); setFeedback(''); }}
                  aria-pressed={activePlatform === key}
                  className={activePlatform === key ? 'flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/70 bg-[#D4AF37]/10 px-2 py-3 text-xs font-semibold text-[#E6C676] transition' : 'flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.025] px-2 py-3 text-xs font-semibold text-white/65 transition hover:border-white/25 hover:text-white'}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                {activeDraft.title ? (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor="share-kit-title" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Judul</label>
                      <button type="button" onClick={() => void copyValue(activeDraft.title, 'title')} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 px-3 text-xs text-white/75 hover:border-[#D4AF37]/45 hover:text-[#E6C676]"><Copy size={13} /> Salin judul</button>
                    </div>
                    <textarea id="share-kit-title" readOnly value={activeDraft.title} rows={2} className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/88 outline-none focus:border-[#D4AF37]/50" />
                  </div>
                ) : null}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="share-kit-caption" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Caption / Deskripsi</label>
                    <button type="button" onClick={() => void copyValue(activeDraft.body, 'body')} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#D4AF37]/35 px-3 text-xs text-[#E6C676] hover:bg-[#D4AF37]/10"><Copy size={13} /> Salin caption</button>
                  </div>
                  <textarea id="share-kit-caption" readOnly value={activeDraft.body} rows={8} className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/88 outline-none focus:border-[#D4AF37]/50" />
                </div>
                <p className="mt-3 text-xs leading-5 text-white/45">{activeDraft.instruction}</p>
                {feedback ? <p className="mt-3 text-sm text-[#E6C676]" role="status" aria-live="polite">{feedback}</p> : null}
              </div>

              <aside className="space-y-3">
                {props.coverImage ? (
                  <a href={props.coverImage} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={props.coverImage} alt={'Cover ' + props.title} className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                    <span className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-white/75"><ImageIcon size={14} /> Buka gambar cover <ExternalLink size={12} /></span>
                  </a>
                ) : null}
                <button type="button" onClick={() => void copyValue(props.canonicalUrl, 'link')} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 hover:border-[#D4AF37]/45 hover:text-[#E6C676]"><Link2 size={15} /> Salin tautan proyek</button>
                <button type="button" onClick={() => void shareProjectLink()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#E6C676] hover:bg-[#D4AF37]/15"><Share2 size={15} /> Bagikan tautan</button>
                <a href={getPlatformUrl(activePlatform, props.canonicalUrl, activeDraft.body)} target="_blank" rel="noreferrer" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#080807] hover:bg-[#E2C866]"><ExternalLink size={15} /> Buka {activePlatformInfo.label}</a>
                <p className="text-xs leading-5 text-white/38">Website menyiapkan materi, bukan menerbitkan posting secara otomatis. Periksa caption dan gambar sebelum unggah.</p>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
