'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentType = 'karya' | 'wawasan';
type PlatformTab = 'canva' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp' | 'checklist';

type PublishChecklist = {
  canvaDesignDone: boolean;
  instagramReelsPosted: boolean;
  instagramCarouselPosted: boolean;
  tiktokPosted: boolean;
  youtubeShortsPosted: boolean;
  linkedinPosted: boolean;
  whatsappShared: boolean;
  postingDate: string;
  postingNotes: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
};

const defaultChecklist: PublishChecklist = {
  canvaDesignDone: false,
  instagramReelsPosted: false,
  instagramCarouselPosted: false,
  tiktokPosted: false,
  youtubeShortsPosted: false,
  linkedinPosted: false,
  whatsappShared: false,
  postingDate: '',
  postingNotes: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
};

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
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeHashtags: string;
  youtubeUploadGuide: string;
  linkedInCaption: string;
  linkedInBullets: string;
  linkedInCta: string;
  whatsappMessage: string;
  whatsappLink: string;
  canvaReelsTimeline: string;
  canvaCarouselSlides: string;
  canvaOverlayText: string;
  canvaVisualGuide: string;
  canvaExportGuide: string;
  canvaShareGuide: string;
  ogImage: string;
};

type Props = { contentType: ContentType; slug: string };

function buildSocialDraft(data: DetailPayload, contentType: ContentType): ComposerDraft {
  const tags = data.tags?.length ? data.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ') : '#DesainInterior #StudiKasus';
  const core = `${data.title}${data.year ? ` (${data.year})` : ''}`;
  const summary = data.summary || data.context || 'Proyek ini berangkat dari kebutuhan ruang yang spesifik dan terukur.';
  const context = data.context || data.summary || 'Konteks proyek difokuskan pada kebutuhan pengguna dan fungsi harian ruang.';
  const conflict = data.conflict || 'Tantangan utamanya adalah menyatukan fungsi, kenyamanan, dan karakter visual.';
  const decision = data.designDecision || data.solution || 'Keputusan desain diarahkan pada alur ruang yang efisien dan mudah dipakai.';
  const impact = data.impact || data.insight || 'Hasilnya terasa lebih nyaman dipakai, lebih rapi, dan relevan untuk aktivitas utama.';
  const insight = data.insight || 'Ruang yang berhasil adalah ruang yang terasa sederhana dipakai, bukan sekadar terlihat bagus.';
  const visualUrl = data.ogImage || data.visual;

  const igCaption = `Hook singkat: Ruang bagus bukan hanya soal tampilan, tapi soal strategi penggunaan.\n\nProyek: ${core}\n${summary}\n\nInsight: ${decision}\nDampak: ${impact}\n\nLihat studi lengkap di website: ${data.canonicalUrl}`;

  const igStoryboard = `Reels storyboard\n1) Pembuka masalah: ${conflict}\n2) Batasan ruang: ${context}\n3) Masalah ke solusi: ${decision}\n4) Sudut pandang pengguna: ${impact}\n5) Penutup + CTA website`;

  const igCarousel = `Carousel slide outline\nSlide 1: Hook + judul proyek\nSlide 2: Latar belakang singkat\nSlide 3: Pembuka masalah\nSlide 4: Batasan ruang\nSlide 5: Masalah ke solusi\nSlide 6: Sudut pandang pengguna + hasil\nSlide 7: CTA ke website`;

  const linkedInCaption = `Dalam proyek ${core}, kami memulai dari kebutuhan pengguna dan batasan ruang nyata.\n\n${context}\n\nKeputusan desain difokuskan agar fungsi ruang lebih efektif sekaligus tetap memiliki karakter visual yang kuat.\n\nDampak utama: ${impact}`;
  const youtubeTitle = `${core} | Transformasi Ruang yang Lebih Fungsional #Shorts`;
  const youtubeDescription = `Proyek ${core} dimulai dari konteks nyata: ${shortText(context, 120)}\n\nSolusi utamanya: ${shortText(decision, 120)}\nDampak: ${shortText(impact, 120)}\n\nLihat studi lengkap di website:\n${data.canonicalUrl}`;
  const youtubeHashtags = `${tags} #Shorts #YouTubeShorts`;
  const youtubeUploadGuide = `Upload ke YouTube Shorts menggunakan file MP4 yang sama dari export Canva.\n1) Pastikan rasio 9:16 (1080 x 1920).\n2) Judul tetap singkat, jelas, dan mengandung kata kunci utama.\n3) Tempel deskripsi + hashtag untuk konteks dan jangkauan.\n4) Cek cover frame terbaik sebelum publish.`;

  const linkedInBullets = `• Pembuka masalah: ${conflict}\n• Batasan ruang: ${context}\n• Masalah ke solusi: ${decision}\n• Sudut pandang pengguna: ${impact}`;

  const whatsappMessage = `Halo, saya mau share ${contentTypeLabel(contentType)} yang menurut saya relevan:\n${core}\n\n${summary}\n\nBaca lengkap di sini: ${data.canonicalUrl}`;
  const canvaReelsTimeline = `0-3 detik:
Visual: Hero shot ${core} dengan framing clean dan gerak zoom-in ringan.
Teks: "Ruang bagus bukan cuma soal tampilan."
Narasi: "Sering kali ruang terlihat estetik, tapi belum nyaman dipakai."

3-6 detik:
Visual: Potongan area yang menunjukkan konteks ruang dan aktivitas utama.
Teks: "Konteks: ${context}"
Narasi: "Di proyek ini, konteks utamanya adalah ${context.toLowerCase()}."

6-10 detik:
Visual: Detail titik masalah + transisi ke sketsa/hasil solusi.
Teks: "Masalah: ${conflict}"
Narasi: "Tantangan utamanya adalah ${conflict.toLowerCase()}."

10-14 detik:
Visual: Before/after angle atau urutan alur ruang yang sudah diperbaiki.
Teks: "Solusi: ${decision}"
Narasi: "Keputusan desain kami: ${decision.toLowerCase()}."

14-15 detik:
Visual: Closing shot paling kuat + website URL di bawah.
Teks: "Lihat studi lengkap di website"
Narasi: "Hasilnya: ${impact.toLowerCase()}. Cek studi lengkapnya di website."`;

  const canvaCarouselSlides = `Slide 1: Hook
${core}
"Dari ruang yang rapi, menjadi ruang yang lebih bekerja."

Slide 2: Konteks
${summary}

Slide 3: Masalah
${conflict}

Slide 4: Batasan ruang
${context}

Slide 5: Keputusan desain
${designLabel(data.designDecision, data.solution)}

Slide 6: Dampak
${impact}
Insight tambahan: ${insight}

Slide 7: CTA website
Lihat studi ${contentTypeLabel(contentType)} lengkap:
${data.canonicalUrl}`;

  const canvaOverlayText = `"Ruang bagus harus enak dipakai."
"Masalah utama: ${shortText(conflict)}"
"Batasan: ${shortText(context)}"
"Solusi: ${shortText(decision)}"
"Dampak: ${shortText(impact)}"
"Lihat studi lengkap di website"`;

  const canvaVisualGuide = `Opening hero image:
- Gunakan OG/hero image sebagai scene pembuka untuk membangun konteks visual.

Detail material image:
- Ambil crop detail material, tekstur, atau sambungan yang merepresentasikan kualitas desain.

Activity/user image:
- Pilih foto dengan interaksi pengguna atau aktivitas utama agar manfaat ruang terasa nyata.

Closing image:
- Gunakan frame hasil akhir paling kuat, lalu tambahkan URL website sebagai CTA.

Referensi visual utama:
${visualUrl}`;

  const canvaExportGuide = `Reels:
- Ukuran: 1080 x 1920 px
- Format: MP4
- Durasi: 15 detik

Carousel:
- Ukuran: 1080 x 1350 px
- Format: PNG/JPG
- Jumlah: 7 slide

Best practice:
- Jaga teks agar tidak terlalu bawah (safe area).
- Gunakan overlay gelap untuk menjaga keterbacaan.
- Gunakan teks putih dengan aksen emas agar konsisten dengan brand.`;
  const canvaShareGuide = `- Setelah desain selesai, klik Share di Canva.
- Gunakan Instagram untuk posting Reels atau Carousel.
- Gunakan TikTok untuk upload video vertikal.
- Gunakan Download jika ingin upload manual ke YouTube Shorts atau LinkedIn.
- Gunakan Schedule jika akun Canva mendukung penjadwalan.
- Pastikan video tetap 1080 x 1920 untuk Reels, TikTok, dan Shorts.
- Pastikan carousel tetap 1080 x 1350 untuk Instagram Feed.`;

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
    youtubeTitle,
    youtubeDescription,
    youtubeHashtags,
    youtubeUploadGuide,
    linkedInCaption,
    linkedInBullets,
    linkedInCta: `Baca studi ${contentTypeLabel(contentType)} lengkap: ${data.canonicalUrl}`,
    whatsappMessage,
    whatsappLink: data.canonicalUrl,
    canvaReelsTimeline,
    canvaCarouselSlides,
    canvaOverlayText,
    canvaVisualGuide,
    canvaExportGuide,
    canvaShareGuide,
    ogImage: data.ogImage,
  };
}

function shortText(text: string, max = 90) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function designLabel(designDecision: string, solution: string) {
  return designDecision || solution || 'Keputusan desain diarahkan untuk membuat alur ruang lebih efisien dan nyaman.';
}

function contentTypeLabel(contentType: ContentType) {
  return contentType === 'wawasan' ? 'wawasan' : 'karya';
}

export default function SocialContentStickyAction({ contentType, slug }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('canva');
  const [draft, setDraft] = useState<ComposerDraft | null>(null);
  const [checklist, setChecklist] = useState<PublishChecklist>(defaultChecklist);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<keyof ComposerDraft>>(new Set());
  const [regenNotes, setRegenNotes] = useState('');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const storageKey = `social-composer-${contentType}-${slug}`;
  const checklistStorageKey = `social-publish-checklist-${contentType}-${slug}`;

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

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(checklistStorageKey);
      if (!raw) {
        setChecklist(defaultChecklist);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PublishChecklist>;
      setChecklist({ ...defaultChecklist, ...parsed });
    } catch {
      setChecklist(defaultChecklist);
    }
  }, [checklistStorageKey, open]);

  useEffect(() => {
    if (!open) return;
    localStorage.setItem(checklistStorageKey, JSON.stringify(checklist));
  }, [checklist, checklistStorageKey, open]);

  async function openModal() {
    setOpen(true);
    setActiveTab('canva');
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

  const generatedDraft = useMemo(() => (payload ? buildSocialDraft(payload, contentType) : null), [contentType, payload]);

  useEffect(() => {
    if (!generatedDraft || draft) return;
    setDraft(generatedDraft);
  }, [generatedDraft, draft]);

  function updateDraft<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirtyFields((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function regenerateCanvaMissingOnly() {
    if (!draft || !generatedDraft) return;
    const canvaKeys: (keyof ComposerDraft)[] = ['canvaReelsTimeline', 'canvaCarouselSlides', 'canvaOverlayText'];
    const nextDraft: ComposerDraft = { ...draft };

    for (const key of canvaKeys) {
      const current = String(draft[key] ?? '').trim();
      const base = String(generatedDraft[key] ?? '').trim();
      if (!current || dirtyFields.has(key) || current !== base) {
        nextDraft[key] = generatedDraft[key];
      }
    }

    if (regenNotes.trim()) {
      nextDraft.canvaOverlayText = `${nextDraft.canvaOverlayText}

Catatan revisi admin:
${regenNotes.trim()}`;
    }

    setDraft(nextDraft);
    setCopied((prev) => ({ ...prev, regen: true }));
    window.setTimeout(() => setCopied((prev) => ({ ...prev, regen: false })), 2000);
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

  function updateChecklist<K extends keyof PublishChecklist>(key: K, value: PublishChecklist[K]) {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  }

  function resetChecklist() {
    setChecklist(defaultChecklist);
    localStorage.removeItem(checklistStorageKey);
  }

  function buildPublishReport() {
    return `Judul:\n${contentType} - ${slug}\n\nChecklist:\n- Canva Design: ${checklist.canvaDesignDone ? 'Selesai' : 'Belum'}\n- IG Reels: ${checklist.instagramReelsPosted ? 'Selesai' : 'Belum'}\n- IG Carousel: ${checklist.instagramCarouselPosted ? 'Selesai' : 'Belum'}\n- TikTok: ${checklist.tiktokPosted ? 'Selesai' : 'Belum'}\n- YouTube Shorts: ${checklist.youtubeShortsPosted ? 'Selesai' : 'Belum'}\n- LinkedIn: ${checklist.linkedinPosted ? 'Selesai' : 'Belum'}\n- WhatsApp: ${checklist.whatsappShared ? 'Selesai' : 'Belum'}\n\nLinks:\nInstagram: ${checklist.instagramUrl}\nTikTok: ${checklist.tiktokUrl}\nYouTube: ${checklist.youtubeUrl}\nLinkedIn: ${checklist.linkedinUrl}\n\nCatatan:\nTanggal: ${checklist.postingDate}\nNotes: ${checklist.postingNotes}`;
  }

  const checklistProgress = [
    checklist.canvaDesignDone,
    checklist.instagramReelsPosted,
    checklist.instagramCarouselPosted,
    checklist.tiktokPosted,
    checklist.youtubeShortsPosted,
    checklist.linkedinPosted,
    checklist.whatsappShared,
  ].filter(Boolean).length;

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
        <div className="fixed inset-x-3 top-4 z-50 flex justify-center sm:inset-x-6" role="dialog" aria-modal="true" aria-label="Social Composer v2">
          <div ref={modalRef} className="font-sans max-h-[86vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#D4AF37]/35 bg-[#0E0D0B]/95 p-4 text-[#F4F1EA] shadow-2xl backdrop-blur sm:p-6">
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
                      ['canva', 'Canva'],
                      ['instagram', 'Instagram'],
                      ['tiktok', 'TikTok'],
                      ['youtube', 'YouTube Shorts'],
                      ['linkedin', 'LinkedIn'],
                      ['whatsapp', 'WhatsApp'],
                      ['checklist', 'Checklist'],
                    ] as [PlatformTab, string][]).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setActiveTab(key)} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${activeTab === key ? 'border-[#D4AF37]/80 bg-[#D4AF37]/20 text-[#E6C676]' : 'border-white/20 text-white/80'}`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'canva' && (
                    <div className="space-y-3">
                      <p className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-3 text-sm text-[#F4F1EA]">
                        Produksi visual utama di Canva, lalu gunakan fitur Share Canva untuk posting ke Instagram, TikTok, YouTube Shorts, atau download manual.
                      </p>
                      <Field label="Reels Timeline 15 Detik" value={draft.canvaReelsTimeline} onChange={(v) => updateDraft('canvaReelsTimeline', v)} rows={16} />
                      <Field label="Carousel 7 Slide" value={draft.canvaCarouselSlides} onChange={(v) => updateDraft('canvaCarouselSlides', v)} rows={14} />
                      <Field label="Teks Overlay" value={draft.canvaOverlayText} onChange={(v) => updateDraft('canvaOverlayText', v)} rows={8} />
                      <Field label="Visual Guide" value={draft.canvaVisualGuide} onChange={(v) => updateDraft('canvaVisualGuide', v)} rows={10} />
                      <Field label="Catatan revisi admin (opsional)" value={regenNotes} onChange={setRegenNotes} rows={3} />
                      <Field label="Export Guide" value={draft.canvaExportGuide} onChange={(v) => updateDraft('canvaExportGuide', v)} rows={10} />
                      <Field label="Canva Share Guide" value={draft.canvaShareGuide} onChange={(v) => updateDraft('canvaShareGuide', v)} rows={9} />
                      <ButtonRow>
                        <CopyButton label="Copy Reels Brief" copied={copied.canvaReels} onClick={() => copyText('canvaReels', draft.canvaReelsTimeline)} />
                        <CopyButton label="Copy Carousel Brief" copied={copied.canvaCarousel} onClick={() => copyText('canvaCarousel', draft.canvaCarouselSlides)} />
                        <CopyButton label="Copy Overlay Text" copied={copied.canvaOverlay} onClick={() => copyText('canvaOverlay', draft.canvaOverlayText)} />
                        <CopyButton label="Copy Canva Share Guide" copied={copied.canvaShare} onClick={() => copyText('canvaShare', draft.canvaShareGuide)} />
                        <CopyButton
                          label="Copy Semua Canva Brief"
                          copied={copied.canvaAll}
                          onClick={() =>
                            copyText(
                              'canvaAll',
                              `Reels Timeline 15 Detik\n${draft.canvaReelsTimeline}\n\nCarousel 7 Slide\n${draft.canvaCarouselSlides}\n\nTeks Overlay\n${draft.canvaOverlayText}\n\nVisual Guide\n${draft.canvaVisualGuide}\n\nExport Guide\n${draft.canvaExportGuide}\n\nCanva Share Guide\n${draft.canvaShareGuide}`,
                            )
                          }
                        />
                        <button type="button" onClick={regenerateCanvaMissingOnly} className="rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#E6C676]">{copied.regen ? 'Disalin' : 'Regenerate Missing Canva'}</button>
                        <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Buka Canva</a>
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'instagram' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Asset visual diproduksi dulu di Canva, lalu upload langsung atau share dari Canva ke Instagram.</p>
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
                      <p className="text-sm text-white/75">Video MP4 bisa dibagikan langsung dari Canva Share atau diupload manual ke TikTok.</p>
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

                  {activeTab === 'youtube' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Gunakan MP4 dari Canva untuk upload ke YouTube Shorts agar alur produksi tetap satu pintu.</p>
                      <Field label="Judul SEO YouTube Shorts" value={draft.youtubeTitle} onChange={(v) => updateDraft('youtubeTitle', v)} rows={3} />
                      <Field label="Deskripsi singkat" value={draft.youtubeDescription} onChange={(v) => updateDraft('youtubeDescription', v)} rows={5} />
                      <Field label="Hashtag (wajib #Shorts)" value={draft.youtubeHashtags} onChange={(v) => updateDraft('youtubeHashtags', v)} rows={3} />
                      <Field label="Upload guide" value={draft.youtubeUploadGuide} onChange={(v) => updateDraft('youtubeUploadGuide', v)} rows={6} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption YouTube Shorts" copied={copied.youtubeCaption} onClick={() => copyText('youtubeCaption', `${draft.youtubeTitle}\n\n${draft.youtubeDescription}\n\n${draft.youtubeHashtags}`)} />
                        <CopyButton label="Copy Upload Guide" copied={copied.youtubeGuide} onClick={() => copyText('youtubeGuide', draft.youtubeUploadGuide)} />
                        <a href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm">Buka YouTube Studio</a>
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'linkedin' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Export carousel atau visual utama dari Canva terlebih dahulu, lalu gunakan narasi profesional saat publish di LinkedIn.</p>
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

                  {activeTab === 'checklist' && (
                    <div className="space-y-4 rounded-xl border border-[#D4AF37]/30 bg-[#11100f] p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#E6C676]">Progress: {checklistProgress}/7 selesai</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#D4AF37]" style={{ width: `${(checklistProgress / 7) * 100}%` }} /></div>
                        <p className="text-xs text-white/65">Checklist ini tersimpan di browser admin. Belum masuk database.</p>
                      </div>

                      <ChecklistSection title="Production">
                        <ChecklistItem label="Canva Design selesai" checked={checklist.canvaDesignDone} onChange={(value) => updateChecklist('canvaDesignDone', value)} />
                      </ChecklistSection>

                      <ChecklistSection title="Distribution">
                        <ChecklistItem label="Instagram Reels sudah diposting" checked={checklist.instagramReelsPosted} onChange={(value) => updateChecklist('instagramReelsPosted', value)} />
                        <ChecklistItem label="Instagram Carousel sudah diposting" checked={checklist.instagramCarouselPosted} onChange={(value) => updateChecklist('instagramCarouselPosted', value)} />
                        <ChecklistItem label="TikTok sudah diposting" checked={checklist.tiktokPosted} onChange={(value) => updateChecklist('tiktokPosted', value)} />
                        <ChecklistItem label="YouTube Shorts sudah diposting" checked={checklist.youtubeShortsPosted} onChange={(value) => updateChecklist('youtubeShortsPosted', value)} />
                        <ChecklistItem label="LinkedIn sudah diposting" checked={checklist.linkedinPosted} onChange={(value) => updateChecklist('linkedinPosted', value)} />
                        <ChecklistItem label="WhatsApp sudah dibagikan" checked={checklist.whatsappShared} onChange={(value) => updateChecklist('whatsappShared', value)} />
                      </ChecklistSection>

                      <ChecklistSection title="Posting Links">
                        <InputField label="Instagram URL" value={checklist.instagramUrl} onChange={(value) => updateChecklist('instagramUrl', value)} />
                        <InputField label="TikTok URL" value={checklist.tiktokUrl} onChange={(value) => updateChecklist('tiktokUrl', value)} />
                        <InputField label="YouTube Shorts URL" value={checklist.youtubeUrl} onChange={(value) => updateChecklist('youtubeUrl', value)} />
                        <InputField label="LinkedIn URL" value={checklist.linkedinUrl} onChange={(value) => updateChecklist('linkedinUrl', value)} />
                      </ChecklistSection>

                      <ChecklistSection title="Notes">
                        <InputField label="Tanggal posting" value={checklist.postingDate} onChange={(value) => updateChecklist('postingDate', value)} />
                        <Field label="Catatan posting" value={checklist.postingNotes} onChange={(value) => updateChecklist('postingNotes', value)} rows={4} />
                      </ChecklistSection>

                      <ButtonRow>
                        <CopyButton label="Copy Laporan Publish" copied={copied.publishReport} onClick={() => copyText('publishReport', buildPublishReport())} />
                        <button type="button" onClick={resetChecklist} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">Reset Checklist</button>
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

function ChecklistSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#E6C676]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChecklistItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#D4AF37]" />
      <span>{label}</span>
    </label>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-white/90">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-[#11100f] px-3 py-2 text-sm text-[#F4F1EA] focus:border-[#D4AF37]/70 focus:outline-none" />
    </label>
  );
}
