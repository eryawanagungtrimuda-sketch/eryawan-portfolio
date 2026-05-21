'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentType = 'karya' | 'wawasan';
type PlatformTab = 'instagram' | 'tiktok' | 'linkedin' | 'whatsapp';

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

type ComposerDraft = {
  igCaption: string;
  igHashtag: string;
  igStoryboard: string;
  igCarousel: string;
  igCta: string;
  tiktokHook: string;
  tiktokScript: string;
  tiktokCaption: string;
  tiktokHashtag: string;
  tiktokCta: string;
  linkedInCaption: string;
  linkedInBullets: string;
  linkedInCta: string;
  whatsappMessage: string;
  whatsappLink: string;
  ogImage: string;
};

type Props = { contentType: ContentType; slug: string };

function buildSocialDraft(data: DetailPayload): ComposerDraft {
  const tags = data.tags?.length ? data.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ') : '#DesainInterior #StudiKasus';
  const core = `${data.title}${data.year ? ` (${data.year})` : ''}`;
  const summary = data.summary || data.context || 'Proyek ini berangkat dari kebutuhan ruang yang spesifik dan terukur.';
  const context = data.context || data.summary || 'Konteks proyek difokuskan pada kebutuhan pengguna dan fungsi harian ruang.';
  const conflict = data.conflict || 'Tantangan utamanya adalah menyatukan fungsi, kenyamanan, dan karakter visual.';
  const decision = data.designDecision || data.solution || 'Keputusan desain diarahkan pada alur ruang yang efisien dan mudah dipakai.';
  const impact = data.impact || data.insight || 'Hasilnya terasa lebih nyaman dipakai, lebih rapi, dan relevan untuk aktivitas utama.';

  const igCaption = `Hook singkat: Ruang bagus bukan hanya soal tampilan, tapi soal strategi penggunaan.\n\nProyek: ${core}\n${summary}\n\nInsight: ${decision}\nDampak: ${impact}\n\nLihat studi lengkap di website: ${data.canonicalUrl}`;

  const igStoryboard = `Reels storyboard\n1) Pembuka masalah: ${conflict}\n2) Batasan ruang: ${context}\n3) Masalah ke solusi: ${decision}\n4) Sudut pandang pengguna: ${impact}\n5) Penutup + CTA website`;

  const igCarousel = `Carousel slide outline\nSlide 1: Hook + judul proyek\nSlide 2: Latar belakang singkat\nSlide 3: Pembuka masalah\nSlide 4: Batasan ruang\nSlide 5: Masalah ke solusi\nSlide 6: Sudut pandang pengguna + hasil\nSlide 7: CTA ke website`;

  const linkedInCaption = `Dalam proyek ${core}, kami memulai dari kebutuhan pengguna dan batasan ruang nyata.\n\n${context}\n\nKeputusan desain difokuskan agar fungsi ruang lebih efektif sekaligus tetap memiliki karakter visual yang kuat.\n\nDampak utama: ${impact}`;

  const linkedInBullets = `• Pembuka masalah: ${conflict}\n• Batasan ruang: ${context}\n• Masalah ke solusi: ${decision}\n• Sudut pandang pengguna: ${impact}`;

  const whatsappMessage = `Halo, saya mau share ${contentTypeLabel(data.category)} yang menurut saya relevan:\n${core}\n\n${summary}\n\nBaca lengkap di sini: ${data.canonicalUrl}`;

  return {
    igCaption,
    igHashtag: tags,
    igStoryboard,
    igCarousel,
    igCta: `Kunjungi website untuk studi lengkap: ${data.canonicalUrl}`,
    tiktokHook: '3 detik pembuka: Kenapa ruang ini jadi jauh lebih enak dipakai?',
    tiktokScript: `Script voice over\nPembuka masalah: ${conflict}\nBatasan ruang: ${context}\nMasalah ke solusi: ${decision}\nSudut pandang pengguna: ${impact}\nCTA: cek studi lengkap di website.`,
    tiktokCaption: `${core} — strategi ruang yang fokus pada fungsi dan pengalaman pengguna.\nDetail lengkap: ${data.canonicalUrl}`,
    tiktokHashtag: tags,
    tiktokCta: `Lanjut baca di website: ${data.canonicalUrl}`,
    linkedInCaption,
    linkedInBullets,
    linkedInCta: `Baca studi ${contentTypeLabel(data.category)} lengkap: ${data.canonicalUrl}`,
    whatsappMessage,
    whatsappLink: data.canonicalUrl,
    ogImage: data.ogImage,
  };
}

function contentTypeLabel(category?: string) {
  return category?.toLowerCase().includes('wawasan') ? 'wawasan' : 'karya';
}

export default function SocialContentStickyAction({ contentType, slug }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('instagram');
  const [draft, setDraft] = useState<ComposerDraft | null>(null);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const storageKey = `social-composer-${contentType}-${slug}`;

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

  useEffect(() => {
    if (!open || draft) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ComposerDraft;
      setDraft(parsed);
    } catch {
      // ignore invalid session data
    }
  }, [open, draft, storageKey]);

  useEffect(() => {
    if (!draft) return;
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  async function openModal() {
    setOpen(true);
    setActiveTab('instagram');
    if (payload || loading) return;
    setLoading(true);
    try {
      const endpoint = contentType === 'karya' ? `/api/projects/${slug}` : `/api/insights/${slug}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed fetching content');
      const data = (await res.json()) as DetailPayload;
      setPayload(data);
    } finally {
      setLoading(false);
    }
  }

  const generatedDraft = useMemo(() => (payload ? buildSocialDraft(payload) : null), [payload]);

  useEffect(() => {
    if (!generatedDraft || draft) return;
    setDraft(generatedDraft);
  }, [generatedDraft, draft]);

  function updateDraft<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function copyText(copyKey: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [copyKey]: true }));
      window.setTimeout(() => {
        setCopied((prev) => ({ ...prev, [copyKey]: false }));
      }, 2000);
    } catch {
      setCopied((prev) => ({ ...prev, [copyKey]: false }));
    }
  }

  if (!ready || !isAdmin) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <button
          type="button"
          aria-label="Buat konten sosial untuk halaman ini"
          onClick={openModal}
          className="font-sans min-h-11 rounded-2xl border border-[#D4AF37]/60 bg-[#090908]/85 px-5 py-2.5 text-sm font-semibold text-[#E6C676] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_25px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          Buat Konten Sosial
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Social Composer v2">
          <div ref={modalRef} className="font-sans max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#D4AF37]/35 bg-[#0E0D0B] p-4 text-[#F4F1EA] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#E6C676]">Social Composer v2</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/20 px-3 py-1 text-sm">Tutup</button>
            </div>

            {loading || !draft ? (
              <p className="mt-4 text-sm text-white/70">Menyiapkan draft konten berbasis template...</p>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {([
                      ['instagram', 'Instagram'],
                      ['tiktok', 'TikTok'],
                      ['linkedin', 'LinkedIn'],
                      ['whatsapp', 'WhatsApp'],
                    ] as [PlatformTab, string][]).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setActiveTab(key)} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${activeTab === key ? 'border-[#D4AF37]/80 bg-[#D4AF37]/20 text-[#E6C676]' : 'border-white/20 text-white/80'}`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'instagram' && (
                    <div className="space-y-3">
                      <Field label="Caption Instagram" value={draft.igCaption} onChange={(v) => updateDraft('igCaption', v)} rows={7} />
                      <Field label="Hashtag" value={draft.igHashtag} onChange={(v) => updateDraft('igHashtag', v)} rows={3} />
                      <Field label="Reels storyboard" value={draft.igStoryboard} onChange={(v) => updateDraft('igStoryboard', v)} rows={6} />
                      <Field label="Carousel slide outline" value={draft.igCarousel} onChange={(v) => updateDraft('igCarousel', v)} rows={6} />
                      <Field label="CTA website" value={draft.igCta} onChange={(v) => updateDraft('igCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption IG" copied={copied.igCaption} onClick={() => copyText('igCaption', `${draft.igCaption}\n${draft.igCta}\n${draft.igHashtag}`)} />
                        <CopyButton label="Copy Storyboard" copied={copied.igStoryboard} onClick={() => copyText('igStoryboard', draft.igStoryboard)} />
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Buka Instagram</a>
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'tiktok' && (
                    <div className="space-y-3">
                      <Field label="Hook 3 detik" value={draft.tiktokHook} onChange={(v) => updateDraft('tiktokHook', v)} rows={3} />
                      <Field label="Script voice over" value={draft.tiktokScript} onChange={(v) => updateDraft('tiktokScript', v)} rows={7} />
                      <Field label="Caption TikTok" value={draft.tiktokCaption} onChange={(v) => updateDraft('tiktokCaption', v)} rows={4} />
                      <Field label="Hashtag" value={draft.tiktokHashtag} onChange={(v) => updateDraft('tiktokHashtag', v)} rows={3} />
                      <Field label="CTA website" value={draft.tiktokCta} onChange={(v) => updateDraft('tiktokCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Script TikTok" copied={copied.tiktokScript} onClick={() => copyText('tiktokScript', `${draft.tiktokHook}\n\n${draft.tiktokScript}`)} />
                        <CopyButton label="Copy Caption TikTok" copied={copied.tiktokCaption} onClick={() => copyText('tiktokCaption', `${draft.tiktokCaption}\n${draft.tiktokCta}\n${draft.tiktokHashtag}`)} />
                        <a href="https://www.tiktok.com/upload" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Buka TikTok Upload</a>
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'linkedin' && (
                    <div className="space-y-3">
                      <Field label="Professional caption" value={draft.linkedInCaption} onChange={(v) => updateDraft('linkedInCaption', v)} rows={8} />
                      <Field label="Key insight bullet points" value={draft.linkedInBullets} onChange={(v) => updateDraft('linkedInBullets', v)} rows={6} />
                      <Field label="CTA ke halaman" value={draft.linkedInCta} onChange={(v) => updateDraft('linkedInCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy LinkedIn Caption" copied={copied.linkedinCaption} onClick={() => copyText('linkedinCaption', `${draft.linkedInCaption}\n\n${draft.linkedInBullets}\n\n${draft.linkedInCta}`)} />
                        <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Buka LinkedIn</a>
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div className="space-y-3">
                      <Field label="WhatsApp message" value={draft.whatsappMessage} onChange={(v) => updateDraft('whatsappMessage', v)} rows={6} />
                      <Field label="Link website" value={draft.whatsappLink} onChange={(v) => updateDraft('whatsappLink', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy WhatsApp" copied={copied.whatsapp} onClick={() => copyText('whatsapp', `${draft.whatsappMessage}\n${draft.whatsappLink}`)} />
                        <a href={`https://wa.me/?text=${encodeURIComponent(`${draft.whatsappMessage}\n${draft.whatsappLink}`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Share via WhatsApp</a>
                      </ButtonRow>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-[#E6C676]">Preview visual (OG image)</p>
                  <img src={draft.ogImage} alt="Preview OG" className="h-auto w-full rounded-xl border border-white/10 object-cover" />
                  <a href={draft.ogImage} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm">Buka Visual</a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block text-sm text-white/90">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-1 w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm text-[#F4F1EA] focus:border-[#D4AF37]/70 focus:outline-none" />
    </label>
  );
}

function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 pt-2">{children}</div>;
}

function CopyButton({ label, copied, onClick }: { label: string; copied?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#E6C676]">
      {copied ? 'Disalin' : label}
    </button>
  );
}
