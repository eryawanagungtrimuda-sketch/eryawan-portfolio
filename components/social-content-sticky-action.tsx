'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentType = 'karya' | 'wawasan';

type DetailPayload = {
  title: string;
  slug: string;
  summary: string;
  context: string;
  conflict: string;
  designDecision: string;
  solution: string;
  impact: string;
  insight: string;
  visual: string;
  year: string;
  category: string;
  tags: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

type Props = { contentType: ContentType; slug: string };

function buildSocialDraft(data: DetailPayload) {
  const tags = data.tags?.length ? data.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ') : '#InteriorDesign #CaseStudy';
  const core = `${data.title}${data.year ? ` (${data.year})` : ''}`;
  const reelsIdeas = [
    `IDE 1 — Hook: "Kenapa ruang ini terasa sempit meski luas?"\nStoryboard:\n1) Opening before visual (${core})\n2) Masalah: ${data.conflict || data.summary}\n3) Keputusan: ${data.designDecision || data.solution}\n4) Hasil: ${data.impact || data.insight}\nCTA: Simpan untuk referensi renovasi.`,
    `IDE 2 — Hook: "3 keputusan kecil yang ubah kualitas ruang"\nStoryboard:\n1) Context: ${data.context || data.summary}\n2) Decision #1 #2 #3 (highlight visual)\n3) Final reveal + dampak\nCTA: Comment area rumah yang mau dibedah.`,
    `IDE 3 — Hook: "Bukan soal gaya, tapi strategi ruang"\nStoryboard:\n1) Problem framing\n2) Constraint & trade-off\n3) Solusi akhir + hasil pengguna\nCTA: Share ke partner/kontraktor.`
  ];

  const carouselIdeas = [
    `Carousel 1 (Problem → Solution)\nSlide 1: Judul proyek\nSlide 2: Context\nSlide 3: Konflik\nSlide 4: Keputusan desain\nSlide 5: Solusi\nSlide 6: Impact + CTA`,
    `Carousel 2 (Lessons Learned)\nSlide 1: Hook insight\nSlide 2-4: 3 prinsip desain dari proyek\nSlide 5: Before/after visual\nSlide 6: Ajak diskusi`,
    `Carousel 3 (Client POV)\nSlide 1: Ekspektasi awal klien\nSlide 2: Constraint nyata\nSlide 3: Kompromi desain\nSlide 4: Hasil akhir\nSlide 5: Insight kunci\nSlide 6: CTA konsultasi`
  ];

  const igCaption = `✨ ${core}\n\n${data.summary || data.context}\n\nMasalah utama: ${data.conflict || '-'}\nKeputusan desain: ${data.designDecision || data.solution || '-'}\nDampak: ${data.impact || data.insight || '-'}\n\nLihat studi lengkap: ${data.canonicalUrl}\n${tags}`;

  const linkedIn = `Dalam proyek ${data.title}, kami tidak mulai dari estetika—kami mulai dari masalah ruang.\n\nContext: ${data.context || data.summary}\nTantangan: ${data.conflict || '-'}\nKeputusan kunci: ${data.designDecision || data.solution || '-'}\nImpact: ${data.impact || data.insight || '-'}\n\nArtikel lengkap: ${data.canonicalUrl}`;

  const whatsapp = `Ini konten yang relevan untuk diskusi kita:\n${data.title}\n\n${data.ogDescription}\n\n${data.canonicalUrl}`;

  return {
    igCaption,
    reelsIdeas,
    carouselIdeas,
    linkedIn,
    whatsapp,
    ogImage: data.ogImage,
  };
}

export default function SocialContentStickyAction({ contentType, slug }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkAdmin() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setIsAdmin(isAllowedAdminEmail(data.user?.email));
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      } finally {
        if (mounted) setReady(true);
      }
    }
    checkAdmin();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const root = modalRef.current;
    if (!root) return;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const first = elements[0];
    const last = elements[elements.length - 1];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab' || !first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  async function openModal() {
    setOpen(true);
    if (payload || loading) return;
    setLoading(true);
    try {
      const endpoint = contentType === 'karya' ? `/api/projects/${slug}` : `/api/insights/${slug}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed fetching content');
      const data = await res.json();
      setPayload(data);
    } finally {
      setLoading(false);
    }
  }

  const socialDraft = useMemo(() => (payload ? buildSocialDraft(payload) : null), [payload]);

  async function copyAll() {
    if (!socialDraft) return;
    const text = [
      'IG Reels Caption + Storyboard',
      socialDraft.igCaption,
      ...socialDraft.reelsIdeas,
      'Carousel Instagram',
      ...socialDraft.carouselIdeas,
      'LinkedIn Caption',
      socialDraft.linkedIn,
      'WhatsApp Message',
      socialDraft.whatsapp,
    ].join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyState('done');
    } catch {
      setCopyState('error');
    }
  }

  if (!ready || !isAdmin) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <button
          type="button"
          aria-label="Buat konten sosial untuk proyek ini"
          onClick={openModal}
          className="min-h-11 rounded-2xl border border-[#D4AF37]/60 bg-[#090908]/85 px-5 py-2.5 text-sm font-semibold text-[#E6C676] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_25px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          Buat Konten Sosial
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Modal konten sosial">
          <div ref={modalRef} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#D4AF37]/35 bg-[#0E0D0B] p-4 text-[#F4F1EA] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#E6C676]">Generator Konten Sosial</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/20 px-3 py-1 text-sm">Tutup</button>
            </div>
            {loading || !socialDraft ? <p className="mt-4 text-sm text-white/70">Menyiapkan konten otomatis...</p> : (
              <div className="mt-5 space-y-4">
                <img src={socialDraft.ogImage} alt="Preview OG" className="h-auto w-full rounded-xl border border-white/10 object-cover" />
                <label className="block text-sm">IG Reels caption + storyboard<textarea defaultValue={[socialDraft.igCaption, ...socialDraft.reelsIdeas].join('\n\n')} className="mt-1 min-h-40 w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm" /></label>
                <label className="block text-sm">Carousel Instagram<textarea defaultValue={socialDraft.carouselIdeas.join('\n\n')} className="mt-1 min-h-32 w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm" /></label>
                <label className="block text-sm">LinkedIn caption<textarea defaultValue={socialDraft.linkedIn} className="mt-1 min-h-28 w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm" /></label>
                <label className="block text-sm">WhatsApp message<textarea defaultValue={socialDraft.whatsapp} className="mt-1 min-h-24 w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm" /></label>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={copyAll} className="rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#E6C676]">Copy semua teks</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(socialDraft.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Share via WhatsApp</a>
                  <span className="text-xs text-white/65">{copyState === 'done' ? 'Teks berhasil disalin.' : copyState === 'error' ? 'Clipboard gagal, copy manual dari field.' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
