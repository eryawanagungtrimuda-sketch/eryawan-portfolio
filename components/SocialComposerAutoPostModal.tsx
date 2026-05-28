'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentType = 'karya' | 'wawasan';
type PlatformTab = 'canva' | 'instagram' | 'threads' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp' | 'checklist';

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
  id: string;
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
  threadsPost: string;
  threadsReplyIdeas: string;
  threadsCta: string;
  ogImage: string;
};
type RegenerableField =
  | 'canvaReelsTimeline'
  | 'canvaCarouselSlides'
  | 'canvaOverlayText'
  | 'threadsPost'
  | 'threadsReplyIdeas'
  | 'igCaption'
  | 'igHashtag'
  | 'tiktokHook'
  | 'tiktokScript'
  | 'tiktokCaption'
  | 'tiktokHashtag'
  | 'youtubeTitle'
  | 'youtubeDescription'
  | 'linkedInCaption'
  | 'linkedInBullets'
  | 'whatsappMessage';
type ContentGoal = 'profesional' | 'edukatif' | 'viral-ready' | 'soft-selling';

type Props = {
  contentType: ContentType;
  slug: string;
  buttonClassName?: string;
  wrapperClassName?: string;
};

export function buildSocialDrafts(data: DetailPayload, contentType: ContentType): ComposerDraft {
  const tags = data.tags?.length ? data.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ') : '#DesainInterior #StudiKasus';
  const core = `${data.title}${data.year ? ` (${data.year})` : ''}`;
  const summary = data.summary || data.context || 'Proyek ini berangkat dari kebutuhan ruang yang spesifik dan terukur.';
  const context = data.context || data.summary || 'Konteks proyek difokuskan pada kebutuhan pengguna dan fungsi harian ruang.';
  const conflict = data.conflict || 'Tantangan utamanya adalah menyatukan fungsi, kenyamanan, dan karakter visual.';
  const decision = data.designDecision || data.solution || 'Keputusan desain diarahkan pada alur ruang yang efisien dan mudah dipakai.';
  const impact = data.impact || data.insight || 'Hasilnya terasa lebih nyaman dipakai, lebih rapi, dan relevan untuk aktivitas utama.';
  const insight = data.insight || 'Ruang yang berhasil adalah ruang yang terasa sederhana dipakai, bukan sekadar terlihat bagus.';
  const visualUrl = data.ogImage || data.visual;

  const igCaption = `Ruang yang enak dipakai selalu dimulai dari strategi yang tepat, bukan dari tampilan dulu.\n\nDi ${core}, fokus utamanya ada di alur aktivitas, prioritas fungsi, dan keputusan detail yang relevan untuk pemakaian harian.\n\n${shortText(decision, 160)} Hasilnya, ${shortText(impact, 140)}.\n\nLihat studi lengkap di website: ${data.canonicalUrl}`;

  const igStoryboard = `Reels storyboard\n1) Pembuka masalah: ${conflict}\n2) Batasan ruang: ${context}\n3) Masalah ke solusi: ${decision}\n4) Sudut pandang pengguna: ${impact}\n5) Penutup + CTA website`;

  const igCarousel = `Carousel slide outline\nSlide 1: Hook + judul proyek\nSlide 2: Latar belakang singkat\nSlide 3: Pembuka masalah\nSlide 4: Batasan ruang\nSlide 5: Masalah ke solusi\nSlide 6: Sudut pandang pengguna + hasil\nSlide 7: CTA ke website`;

  const linkedInCaption = `Dalam proyek ${core}, kami memulai dari kebutuhan pengguna dan batasan ruang nyata.\n\n${context}\n\nKeputusan desain difokuskan agar fungsi ruang lebih efektif sekaligus tetap memiliki karakter visual yang kuat.\n\nDampak utama: ${impact}`;
  const youtubeTitle = `${core} | Transformasi Ruang yang Lebih Fungsional #Shorts`;
  const youtubeDescription = `Proyek ${core} dimulai dari konteks nyata: ${shortText(context, 120)}\n\nSolusi utamanya: ${shortText(decision, 120)}\nDampak: ${shortText(impact, 120)}\n\nLihat studi lengkap di website:\n${data.canonicalUrl}`;
  const youtubeHashtags = `${tags} #Shorts #YouTubeShorts`;
  const youtubeUploadGuide = `Upload ke YouTube Shorts menggunakan file MP4 yang sama dari export Canva.\n1) Pastikan rasio 9:16 (1080 x 1920).\n2) Judul tetap singkat, jelas, dan mengandung kata kunci utama.\n3) Tempel deskripsi + hashtag untuk konteks dan jangkauan.\n4) Cek cover frame terbaik sebelum publish.`;

  const linkedInBullets = `• Keputusan desain dimulai dari kebutuhan pengguna utama dan ritme aktivitas harian.\n• Zoning disusun agar fungsi inti berjalan beriringan tanpa saling mengganggu.\n• Sirkulasi dipertegas untuk mengurangi friksi dan menjaga alur tetap efisien.\n• Material dan pencahayaan dipilih untuk performa pakai yang konsisten.\n• Dampaknya terasa langsung: ruang lebih tertata, ringan dipakai, dan relevan.`;

  const whatsappMessage = `Baru selesai menulis ${contentTypeLabel(contentType)} tentang ${core}.\n\nYang dibahas bukan hanya hasil akhirnya, tapi juga cara membaca kebutuhan pengguna dan kenapa keputusan zoning, alur ruang, serta materialnya diambil seperti itu.\n\nKalau sedang cari referensi praktis untuk strategi ruang yang lebih terarah dan nyaman dipakai, ini bisa membantu.\n\nBaca lengkap di sini:\n${data.canonicalUrl}`;
  const canvaReelsTimeline = `0-3 detik
Visual:
Hero shot area utama dengan gerakan kamera pelan.
Narasi:
Ruang ini terlihat rapi, tapi ritme pakainya perlu dibaca ulang.
Overlay:
Rapi belum tentu selesai

3-6 detik
Visual:
Sorot titik aktivitas utama saat ruang digunakan.
Narasi:
Tantangan muncul ketika fungsi istirahat, kerja, dan simpan belum selaras.
Overlay:
Fungsi belum berjalan seimbang

6-9 detik
Visual:
Tampilkan perubahan layout dan prioritas area.
Narasi:
Kami rapikan keputusan area supaya alur harian terasa lebih jelas.
Overlay:
Alur harian dibuat terarah

9-12 detik
Visual:
Close-up material, cahaya, dan storage.
Narasi:
Detail dipilih agar ruang tetap ringan dipakai dari pagi sampai malam.
Overlay:
Detail kecil, dampak nyata

12-15 detik
Visual:
Final reveal dari sudut terbaik.
Narasi:
Hasil akhirnya lebih tertata dan siap dipakai setiap hari.
Overlay:
Lihat studi lengkap di website`;

  const canvaCarouselSlides = `Slide 1 — Hook
Rapi belum tentu selesai
Ruang yang terlihat bersih belum tentu enak dipakai setiap hari.

Slide 2 — Konteks
Berangkat dari ritme harian
${shortText(summary, 140)}

Slide 3 — Masalah
Titik friksi mulai terasa
${shortText(conflict, 140)}

Slide 4 — Keputusan Desain
Prioritas area dirapikan
${shortText(decision, 140)}

Slide 5 — Detail Penting
Detail menentukan kualitas pakai
Material, cahaya, dan penyimpanan dipilih untuk ritme aktivitas nyata.

Slide 6 — Hasil
Ruang terasa lebih terarah
${shortText(impact, 140)}

Slide 7 — CTA
Lanjut lihat proses lengkap
Baca studi lengkapnya di website: ${data.canonicalUrl}`;

  const canvaOverlayText = `Rapi belum tentu siap dipakai
Ritme harian perlu dibaca ulang
Area prioritas dibuat lebih jelas
Cahaya dan material dibuat selaras
Ruang kini terasa lebih terarah
Lihat studi lengkap di website`;

  const threadsPost = `Ruang yang terlihat rapi belum tentu langsung enak dipakai.

Di ${core}, keputusan utama dimulai dari membaca ritme harian, titik friksi, dan cara pengguna berpindah antar area.

Saat alur, material, dan pencahayaan diselaraskan, hasilnya terasa lebih siap dipakai, bukan hanya terlihat selesai.

Bagian mana yang biasanya paling sering terlewat saat menata ruang seperti ini?`;

  const threadsReplyIdeas = `• Menariknya, masalah kecil di awal sering paling menentukan rasa ruang.
• Pencahayaan bukan cuma soal terang, tapi soal kontrol suasana.
• Area simpan yang tepat bikin ritme harian jauh lebih ringan.
• Keputusan material kecil bisa mengubah pengalaman pakai.`;

  const threadsCta = `Baca studi lengkapnya di website: ${data.canonicalUrl}`;

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
    tiktokHook: 'Rapi itu mudah dilihat, nyaman dipakai itu tantangannya.',
    tiktokScript: `Di proyek ${core}, tantangan utamanya ada di alur pakai yang sering saling bertabrakan.\nKami rapikan zonanya supaya perpindahan aktivitas terasa lebih natural.\nMaterial dan pencahayaan juga disesuaikan agar ritme harian lebih nyaman.\nHasilnya bukan cuma terlihat rapi, tapi memang enak dipakai.\nKalau mau lihat detail prosesnya, studi lengkapnya ada di website.`,
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
    threadsPost,
    threadsReplyIdeas,
    threadsCta,
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

export default function SocialComposerAutoPostModal({ contentType, slug, buttonClassName, wrapperClassName }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>('canva');
  const [draft, setDraft] = useState<ComposerDraft | null>(null);
  const [checklist, setChecklist] = useState<PublishChecklist>(defaultChecklist);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [regenNotes, setRegenNotes] = useState('');
  const [regenGoal, setRegenGoal] = useState<ContentGoal>('viral-ready');
  const [isGoalTouched, setIsGoalTouched] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenFeedback, setRegenFeedback] = useState<{ tone: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [postStatus, setPostStatus] = useState<Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp', { state: 'idle' | 'posting' | 'success' | 'error'; message: string }>>>({});
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const storageKey = `social-composer-${contentType}-${slug}`;
  const checklistStorageKey = `social-publish-checklist-${contentType}-${slug}`;
  const regenerableFieldsByTab: Partial<Record<PlatformTab, RegenerableField[]>> = {
    canva: ['canvaReelsTimeline', 'canvaCarouselSlides', 'canvaOverlayText'],
    instagram: ['igCaption', 'igHashtag'],
    threads: ['threadsPost', 'threadsReplyIdeas'],
    tiktok: ['tiktokHook', 'tiktokScript', 'tiktokCaption', 'tiktokHashtag'],
    youtube: ['youtubeTitle', 'youtubeDescription'],
    linkedin: ['linkedInCaption', 'linkedInBullets'],
    whatsapp: ['whatsappMessage'],
  };

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
    persistDrafts(draft);
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
    setIsGoalTouched(false);
    setRegenGoal('viral-ready');
    setRegenFeedback(null);
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

  const generatedDraft = useMemo(() => (payload ? buildSocialDrafts(payload, contentType) : null), [contentType, payload]);

  useEffect(() => {
    if (!generatedDraft || draft) return;
    setDraft(generatedDraft);
  }, [generatedDraft, draft]);

  useEffect(() => {
    if (!open) return;
    if (isGoalTouched) return;
    if (activeTab === 'linkedin') {
      setRegenGoal('profesional');
      return;
    }
    if (activeTab === 'whatsapp') {
      setRegenGoal('soft-selling');
      return;
    }
    setRegenGoal('viral-ready');
  }, [activeTab, isGoalTouched, open]);

  function updateDraft<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function regenerateMissingFields() {
    if (!draft || !generatedDraft || regenLoading) return;
    const fieldsForActiveTab = regenerableFieldsByTab[activeTab] || [];
    const blankFields = fieldsForActiveTab.filter((field) => !String(draft[field] ?? '').trim());
    if (blankFields.length === 0) {
      setRegenFeedback({ tone: 'warning', message: 'Tidak ada bagian kosong di tab ini untuk diperbarui.' });
      return;
    }

    setRegenLoading(true);
    setRegenFeedback({ tone: 'warning', message: 'Membuat ulang bagian kosong...' });
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setRegenFeedback({ tone: 'error', message: 'Sesi admin tidak ditemukan. Silakan login ulang.' });
        return;
      }

      const source = {
        title: payload?.title || '',
        category: payload?.category || null,
        designCategory: payload?.category || null,
        style: null,
        year: payload?.year || null,
        areaSize: null,
        summary: payload?.summary || null,
        problem: payload?.conflict || null,
        solution: payload?.solution || payload?.designDecision || null,
        impact: payload?.impact || null,
        keyInsight: payload?.insight || null,
        url: payload?.canonicalUrl || '',
      };

      const response = await fetch('/api/social-composer/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentType, slug, source, blankFields, goal: regenGoal, notes: regenNotes.trim() || null }),
      });
      if (!response.ok) throw new Error('Regenerasi gagal.');
      const result = (await response.json()) as { data: Partial<Record<RegenerableField, string>>; fallbackUsed?: boolean; debugReason?: string };
      const regenerated = result.data || {};

      const nextDraft = { ...draft };
      for (const field of blankFields) {
        if (String(nextDraft[field] ?? '').trim()) continue;
        const nextValue = regenerated[field];
        if (typeof nextValue === 'string' && nextValue.trim()) nextDraft[field] = nextValue;
      }
      setDraft(nextDraft);
      persistDrafts(nextDraft);
      setRegenFeedback({
        tone: result.fallbackUsed ? 'warning' : 'success',
        message: result.fallbackUsed
          ? `AI fallback aktif: ${result.debugReason || 'openai_unavailable'}. Cek Vercel Function Logs untuk detail.`
          : 'Bagian kosong berhasil diperbarui dengan AI.',
      });
    } catch {
      const nextDraft = { ...draft };
      for (const field of blankFields) {
        if (String(nextDraft[field] ?? '').trim()) continue;
        nextDraft[field] = generatedDraft[field];
      }
      setDraft(nextDraft);
      persistDrafts(nextDraft);
      setRegenFeedback({ tone: 'warning', message: 'AI belum tersedia, memakai template cadangan.' });
    } finally {
      setRegenLoading(false);
    }
  }

  function persistDrafts(nextDraft?: ComposerDraft) {
    const source = nextDraft ?? draft;
    if (!source) return;
    sessionStorage.setItem(storageKey, JSON.stringify(source));
  }

  async function postToPlatform(platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp') {
    if (!draft) return;
    setPostStatus((prev) => ({ ...prev, [platform]: { state: 'posting', message: 'Mengirim konten...' } }));
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 850));
      if (platform === 'instagram') updateChecklist('instagramReelsPosted', true);
      if (platform === 'tiktok') updateChecklist('tiktokPosted', true);
      if (platform === 'youtube') updateChecklist('youtubeShortsPosted', true);
      if (platform === 'linkedin') updateChecklist('linkedinPosted', true);
      if (platform === 'whatsapp') updateChecklist('whatsappShared', true);
      setPostStatus((prev) => ({ ...prev, [platform]: { state: 'success', message: 'Posting berhasil disimulasikan tanpa keluar dari modal.' } }));
    } catch {
      setPostStatus((prev) => ({ ...prev, [platform]: { state: 'error', message: 'Gagal posting. Coba lagi.' } }));
    }
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

  async function downloadAllImages() {
    if (!payload?.id || downloadAllLoading) return;
    setDownloadAllLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Session admin tidak ditemukan.');

      const response = await fetch(`/api/download-project-images?projectId=${encodeURIComponent(payload.id)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal membuat ZIP gambar.');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const fallbackName = `${payload.slug}-images.zip`;
      const disposition = response.headers.get('Content-Disposition') || '';
      const matched = disposition.match(/filename=\"?([^\";]+)\"?/i);
      anchor.href = objectUrl;
      anchor.download = matched?.[1] || fallbackName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('[SocialComposer] download all images failed', error);
    } finally {
      setDownloadAllLoading(false);
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
      <div className={wrapperClassName || 'fixed inset-x-0 bottom-4 z-40 flex justify-center px-4'}>
        <button
          type="button"
          aria-label="Buat konten sosial untuk halaman ini"
          onClick={openModal}
          className={buttonClassName || 'inline-flex min-h-11 min-w-[200px] max-w-[calc(100vw-48px)] items-center justify-center whitespace-nowrap rounded-full border border-[#D4AF37]/60 bg-[#0B0A08]/90 px-7 py-3 font-sans text-sm font-semibold text-[#E6C676] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_25px_rgba(0,0,0,0.45)] backdrop-blur'}
        >
          Buat Konten Sosial
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-3 top-3 z-50 flex justify-center sm:inset-x-6 sm:top-4" role="dialog" aria-modal="true" aria-label="Social Composer v2">
          <div ref={modalRef} className="font-sans max-h-[90dvh] w-[calc(100vw-24px)] max-w-5xl overflow-x-hidden overflow-y-auto rounded-3xl border border-[#D4AF37]/35 bg-[#0E0D0B]/95 p-3 text-[#F4F1EA] shadow-2xl backdrop-blur sm:max-h-[88vh] sm:p-6">
            <div className="sticky top-0 z-30 -mx-3 space-y-3 border-b border-[#D4AF37]/20 bg-[#090807]/90 px-3 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="pr-2 text-base font-semibold text-[#E6C676] sm:text-lg">Social Composer v2</h2>
                <button type="button" onClick={() => setOpen(false)} className="min-h-11 shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Tutup</button>
              </div>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {([
                  ['canva', 'Canva'],
                  ['instagram', 'Instagram'],
                  ['threads', 'Threads'],
                  ['tiktok', 'TikTok'],
                  ['youtube', 'YouTube Shorts'],
                  ['linkedin', 'LinkedIn'],
                  ['whatsapp', 'WhatsApp'],
                  ['checklist', 'Checklist'],
                ] as [PlatformTab, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveTab(key)} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-sans font-medium ${activeTab === key ? 'border-[#D4AF37]/80 bg-[#D4AF37]/20 text-[#E6C676]' : 'border-white/20 text-white/80'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading || !draft ? (
              <p className="mt-4 text-sm text-white/70">Menyiapkan draft konten berbasis template...</p>
            ) : (
              <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-[1.1fr,0.9fr] lg:gap-5">
                <div className="min-w-0 space-y-4">
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
                      <div className="space-y-4 pt-2 font-sans">
                        <div className="space-y-2">
                          <p className="text-xs text-[#F4F1EA]/80">Alur cepat: unduh gambar, salin brief lengkap, lalu buka Canva.</p>
                          <p className="text-sm font-semibold text-[#E6C676]">Aksi Utama</p>
                          <ButtonRow>
                            <button
                              type="button"
                              onClick={downloadAllImages}
                              disabled={downloadAllLoading || !payload?.id}
                              title="Unduh semua gambar proyek untuk produksi konten di Canva"
                              className="min-h-11 w-full max-w-full rounded-full border border-[#D4AF37]/80 bg-[#1A1406] px-4 py-2 text-sm font-semibold text-[#E6C676] sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {downloadAllLoading ? 'Menyiapkan ZIP...' : 'Download Semua Gambar'}
                            </button>
                            <CopyButton
                              label="Copy Brief Lengkap"
                              copied={copied.canvaAll}
                              className="border-[#D4AF37]/80 bg-[#D4AF37]/15 font-semibold"
                              onClick={() =>
                                copyText(
                                  'canvaAll',
                                  `Reels Timeline 15 Detik\n${draft.canvaReelsTimeline}\n\nCarousel 7 Slide\n${draft.canvaCarouselSlides}\n\nTeks Overlay\n${draft.canvaOverlayText}\n\nVisual Guide\n${draft.canvaVisualGuide}\n\nExport Guide\n${draft.canvaExportGuide}\n\nCanva Share Guide\n${draft.canvaShareGuide}`,
                                )
                              }
                            />
                            <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full max-w-full items-center justify-center whitespace-nowrap rounded-full border border-[#D4AF37]/70 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#E6C676] sm:w-auto">Buka Canva</a>
                          </ButtonRow>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white/85">Opsi Detail</p>
                          <ButtonRow>
                            <CopyButton label="Copy Reels" copied={copied.canvaReels} onClick={() => copyText('canvaReels', draft.canvaReelsTimeline)} />
                            <CopyButton label="Copy Carousel" copied={copied.canvaCarousel} onClick={() => copyText('canvaCarousel', draft.canvaCarouselSlides)} />
                            <CopyButton label="Copy Overlay" copied={copied.canvaOverlay} onClick={() => copyText('canvaOverlay', draft.canvaOverlayText)} />
                          </ButtonRow>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'instagram' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Asset visual diproduksi dulu di Canva, lalu upload langsung atau share dari Canva ke Instagram.</p>
                      <p className="text-xs text-[#E6C676]/90">Untuk Reels dan Carousel, gunakan brief lengkap di tab Canva.</p>
                      <Field label="Caption Instagram" value={draft.igCaption} onChange={(v) => updateDraft('igCaption', v)} rows={7} />
                      <Field label="Hashtag" value={draft.igHashtag} onChange={(v) => updateDraft('igHashtag', v)} rows={3} />
                      <Field label="CTA website" value={draft.igCta} onChange={(v) => updateDraft('igCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption IG" copied={copied.igCaption} onClick={() => copyText('igCaption', `${draft.igCaption}\n${draft.igCta}\n${draft.igHashtag}`)} />
                        <button type="button" onClick={() => postToPlatform('instagram')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to Instagram</button>
                      </ButtonRow>
                      {postStatus.instagram ? <p className="text-xs text-white/75">{postStatus.instagram.message}</p> : null}
                    </div>
                  )}



                  {activeTab === 'threads' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Format ini dibuat untuk percakapan ringan di Threads: reflektif, natural, tanpa hard selling.</p>
                      <Field label="Threads Post" value={draft.threadsPost} onChange={(v) => updateDraft('threadsPost', v)} rows={9} />
                      <Field label="Reply Ideas" value={draft.threadsReplyIdeas} onChange={(v) => updateDraft('threadsReplyIdeas', v)} rows={6} />
                      <Field label="CTA" value={draft.threadsCta} onChange={(v) => updateDraft('threadsCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Threads Post" copied={copied.threadsPost} onClick={() => copyText('threadsPost', `${draft.threadsPost}\n\n${draft.threadsCta}`)} />
                        <CopyButton label="Copy Reply Ideas" copied={copied.threadsReplies} onClick={() => copyText('threadsReplies', draft.threadsReplyIdeas)} />
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
                        <button type="button" onClick={() => postToPlatform('tiktok')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to TikTok</button>
                      </ButtonRow>
                      {postStatus.tiktok ? <p className="text-xs text-white/75">{postStatus.tiktok.message}</p> : null}
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
                        <button type="button" onClick={() => postToPlatform('youtube')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to YouTube Shorts</button>
                      </ButtonRow>
                      {postStatus.youtube ? <p className="text-xs text-white/75">{postStatus.youtube.message}</p> : null}
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
                        <button type="button" onClick={() => postToPlatform('linkedin')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to LinkedIn</button>
                      </ButtonRow>
                      {postStatus.linkedin ? <p className="text-xs text-white/75">{postStatus.linkedin.message}</p> : null}
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div className="space-y-3">
                      <Field label="WhatsApp message" value={draft.whatsappMessage} onChange={(v) => updateDraft('whatsappMessage', v)} rows={6} />
                      <Field label="Link website" value={draft.whatsappLink} onChange={(v) => updateDraft('whatsappLink', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy WhatsApp" copied={copied.whatsapp} onClick={() => copyText('whatsapp', `${draft.whatsappMessage}\n${draft.whatsappLink}`)} />
                        <button type="button" onClick={() => postToPlatform('whatsapp')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Share via WhatsApp</button>
                      </ButtonRow>
                      {postStatus.whatsapp ? <p className="text-xs text-white/75">{postStatus.whatsapp.message}</p> : null}
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

                <div className="min-w-0 space-y-3">
                  <p className="text-sm text-[#E6C676]">Preview visual (OG image)</p>
                  <div className="w-full max-w-full overflow-hidden rounded-xl border border-white/10">
                    <img src={draft.ogImage} alt="Preview OG" className="h-auto w-full max-w-full object-cover" />
                  </div>
                  <a href={draft.ogImage} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/20 px-4 py-2 text-sm font-sans">Buka Visual</a>
                </div>
              </div>
                  )}

                  <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#13110d]/70 p-3 font-sans sm:p-4">
                    <p className="text-sm font-semibold text-[#E6C676]">Opsi Lanjutan</p>
                    <p className="mt-1 text-xs text-white/70">Bagian kosong akan dibuat ulang dengan AI. Bagian yang sudah diedit tidak ditimpa.</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <label className="text-xs text-white/70">Tujuan konten</label>
                      <select
                        value={regenGoal}
                        onChange={(event) => {
                          setRegenGoal(event.target.value as ContentGoal);
                          setIsGoalTouched(true);
                        }}
                        className="min-h-11 w-full rounded-lg border border-white/20 bg-[#11100f] px-3 py-2 text-sm font-sans text-[#F4F1EA]"
                      >
                        <option value="profesional">Profesional</option>
                        <option value="edukatif">Edukatif</option>
                        <option value="viral-ready">Viral-ready</option>
                        <option value="soft-selling">Soft-selling</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={regenerateMissingFields}
                      disabled={regenLoading}
                      className="mt-3 min-h-11 w-full rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-sans text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {regenLoading ? 'Membuat ulang bagian kosong...' : 'Perbarui Bagian Kosong'}
                    </button>
                    <p className="mt-2 text-xs text-white/70">Kosongkan kolom tertentu, lalu klik tombol ini. Kolom lain tidak akan ditimpa.</p>
                    {regenFeedback ? <p className={`mt-2 text-xs ${regenFeedback.tone === 'success' ? 'text-[#E6C676]' : 'text-white/75'}`}>{regenFeedback.message}</p> : null}
                  </div>
                </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block max-w-full text-sm text-white/90">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-1 min-h-11 w-full max-w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm font-sans text-[#F4F1EA] break-words focus:border-[#D4AF37]/70 focus:outline-none" />
    </label>
  );
}

function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 pt-2 sm:gap-3">{children}</div>;
}

function CopyButton({ label, copied, onClick, className = '' }: { label: string; copied?: boolean; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-11 max-w-full whitespace-nowrap rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm font-sans text-[#E6C676] ${className}`}>
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
