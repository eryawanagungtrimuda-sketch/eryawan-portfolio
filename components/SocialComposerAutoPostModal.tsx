'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { buildPromotionUrl, toUtmContentLabel } from '@/lib/utm-links';

import type {
  ComposerDraft,
  ContentGoal,
  DetailPayload,
  PlatformTab,
  PublishChecklist,
  RegenerableField,
  SocialComposerAutoPostModalProps,
} from './social-composer/types';
import { defaultChecklist, platformTabs, regenerableFieldsByTab } from './social-composer/constants';
import { buildSocialDrafts } from './social-composer/drafts';
import { ensureThreadsCta, fallbackText } from './social-composer/post-processing';
import { applyRegeneratedFields } from './social-composer/parsers';
import { readStoredChecklist, readStoredDraft, removeStoredChecklist, writeStoredChecklist, writeStoredDraft } from './social-composer/persistence';
import { copyText, triggerBrowserDownload } from './social-composer/actions';
import { buildPublishReport } from './social-composer/report';
import { sendPlatformPostRequest, type PostingPlatform } from './social-composer/platform-posting';
import { ButtonRow, ChecklistItem, ChecklistSection, CopyButton, Field, InputField } from './social-composer/ui';

const promoInsertTargetByTab: Partial<Record<PlatformTab, keyof ComposerDraft>> = {
  instagram: 'igCta',
  threads: 'threadsCta',
  tiktok: 'tiktokCta',
  facebook: 'facebookCta',
  youtube: 'youtubeDescription',
  linkedin: 'linkedInCta',
  whatsapp: 'whatsappLink',
};

const promoHelpByTab: Partial<Record<PlatformTab, string>> = {
  instagram: 'Untuk Instagram, gunakan link ini di bio, story link sticker, atau komentar pin karena link di caption tidak selalu bisa diklik.',
  tiktok: 'Untuk TikTok, gunakan link ini di bio atau caption bila tersedia untuk akun Anda.',
  facebook: 'Untuk Facebook, link ini bisa langsung ditempatkan di caption agar kunjungan tetap terbaca.',
  youtube: 'Untuk YouTube Shorts, link ini paling aman ditempatkan di deskripsi.',
  linkedin: 'Untuk LinkedIn, link ini bisa ditempatkan di caption atau komentar pertama sesuai gaya publish.',
  threads: 'Untuk Threads, gunakan link ini di post, reply lanjutan, atau bio sesuai kebutuhan.',
  whatsapp: 'Untuk kanal manual, gunakan link ini di pesan, bio, komentar pin, story link, atau deskripsi sesuai platform.',
};

export default function SocialComposerAutoPostModal({ contentType, slug, buttonClassName, wrapperClassName }: SocialComposerAutoPostModalProps) {
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
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [checklistFeedback, setChecklistFeedback] = useState<{ tone: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
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
    const storedDraft = readStoredDraft(storageKey);
    if (!storedDraft) return;
    const normalized = ensureThreadsCta(storedDraft, payload?.canonicalUrl);
    setDraft(normalized);
  }, [open, draft, payload?.canonicalUrl, storageKey]);

  useEffect(() => {
    if (!draft) return;
    writeStoredDraft(storageKey, draft);
  }, [draft, storageKey]);

  useEffect(() => {
    if (!open) return;
    void loadChecklistFromServer();
  // loadChecklistFromServer is intentionally called on modal/key changes only; it reads the latest auth/session at call time.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistStorageKey, open]);


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

  const promoLinks = useMemo(() => {
    if (!payload || contentType !== 'karya') return null;
    const path = `/karya/${payload.slug || slug}`;
    const contentLabel = toUtmContentLabel(payload.slug || payload.title || slug);
    const target = { path, contentLabel };

    const links: Partial<Record<PlatformTab, string>> = {
      instagram: buildPromotionUrl({ target, source: 'instagram', campaign: 'portfolio_content', content: contentLabel }),
      threads: buildPromotionUrl({ target, source: 'manual', campaign: 'portfolio_content', content: contentLabel }),
      tiktok: buildPromotionUrl({ target, source: 'tiktok', campaign: 'portfolio_content', content: contentLabel }),
      facebook: buildPromotionUrl({ target, source: 'facebook', campaign: 'portfolio_content', content: contentLabel }),
      youtube: buildPromotionUrl({ target, source: 'youtube_short', campaign: 'portfolio_content', content: contentLabel }),
      linkedin: buildPromotionUrl({ target, source: 'linkedin', campaign: 'portfolio_content', content: contentLabel }),
      whatsapp: buildPromotionUrl({ target, source: 'manual', campaign: 'portfolio_content', content: contentLabel }),
    };

    return links;
  }, [contentType, payload, slug]);

  const activePromoLink = promoLinks?.[activeTab];

  function insertPromoLinkToDraft() {
    if (!activePromoLink) return;
    const targetField = promoInsertTargetByTab[activeTab];
    if (!targetField) return;
    const label = activeTab === 'youtube' ? `Lihat studi lengkap:\n${activePromoLink}` : `Link dengan tracking: ${activePromoLink}`;
    const currentValue = String(draft?.[targetField] || '');
    if (currentValue.includes(activePromoLink)) return;
    updateDraft(targetField, `${currentValue.trim()}${currentValue.trim() ? '\n' : ''}${label}` as ComposerDraft[typeof targetField]);
  }


  useEffect(() => {
    if (!generatedDraft || draft) return;
    setDraft(ensureThreadsCta(generatedDraft, payload?.canonicalUrl));
  }, [generatedDraft, draft, payload?.canonicalUrl]);

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
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value } as ComposerDraft;
      return ensureThreadsCta(next, payload?.canonicalUrl);
    });
  }

  function copyDraftText(copyKey: string, text: string) {
    void copyText(copyKey, text, setCopied);
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

      const nextDraft = applyRegeneratedFields(draft, blankFields, regenerated);
      setDraft(nextDraft);
      writeStoredDraft(storageKey, nextDraft);
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
        nextDraft[field] = fallbackText(generatedDraft, field);
      }
      setDraft(nextDraft);
      writeStoredDraft(storageKey, nextDraft);
      setRegenFeedback({ tone: 'warning', message: 'AI belum tersedia, memakai template cadangan.' });
    } finally {
      setRegenLoading(false);
    }
  }

  async function postToPlatform(platform: PostingPlatform) {
    if (!draft) return;
    setPostStatus((prev) => ({ ...prev, [platform]: { state: 'posting', message: 'Mengirim konten...' } }));
    try {
      await sendPlatformPostRequest(platform);
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
      const fallbackName = `${payload.slug}-images.zip`;
      const disposition = response.headers.get('Content-Disposition') || '';
      const matched = disposition.match(/filename=\"?([^\";]+)\"?/i);
      triggerBrowserDownload(blob, matched?.[1] || fallbackName);
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
    removeStoredChecklist(checklistStorageKey);
    setChecklistFeedback({ tone: 'warning', message: 'Checklist direset di layar ini. Klik Simpan Checklist untuk menyimpan reset ke database.' });
  }

  function checklistToApiPayload() {
    return {
      content_type: contentType,
      content_slug: slug,
      content_title: payload?.title || null,
      instagram_reels_posted: checklist.instagramReelsPosted,
      instagram_carousel_posted: checklist.instagramCarouselPosted,
      threads_posted: checklist.threadsPosted,
      tiktok_posted: checklist.tiktokPosted,
      facebook_posted: checklist.facebookPosted,
      youtube_shorts_posted: checklist.youtubeShortsPosted,
      linkedin_posted: checklist.linkedinPosted,
      whatsapp_shared: checklist.whatsappShared,
      instagram_url: checklist.instagramUrl,
      threads_url: checklist.threadsUrl,
      tiktok_url: checklist.tiktokUrl,
      facebook_url: checklist.facebookUrl,
      youtube_shorts_url: checklist.youtubeUrl,
      linkedin_url: checklist.linkedinUrl,
      whatsapp_url: checklist.whatsappUrl,
      posting_date: checklist.postingDate,
      notes: checklist.postingNotes,
    };
  }

  function checklistFromApiRow(row: Record<string, unknown> | null): PublishChecklist {
    if (!row) return readStoredChecklist(checklistStorageKey);
    return {
      ...defaultChecklist,
      instagramReelsPosted: row.instagram_reels_posted === true,
      instagramCarouselPosted: row.instagram_carousel_posted === true,
      threadsPosted: row.threads_posted === true,
      tiktokPosted: row.tiktok_posted === true,
      facebookPosted: row.facebook_posted === true,
      youtubeShortsPosted: row.youtube_shorts_posted === true,
      linkedinPosted: row.linkedin_posted === true,
      whatsappShared: row.whatsapp_shared === true,
      instagramUrl: typeof row.instagram_url === 'string' ? row.instagram_url : '',
      threadsUrl: typeof row.threads_url === 'string' ? row.threads_url : '',
      tiktokUrl: typeof row.tiktok_url === 'string' ? row.tiktok_url : '',
      facebookUrl: typeof row.facebook_url === 'string' ? row.facebook_url : '',
      youtubeUrl: typeof row.youtube_shorts_url === 'string' ? row.youtube_shorts_url : '',
      linkedinUrl: typeof row.linkedin_url === 'string' ? row.linkedin_url : '',
      whatsappUrl: typeof row.whatsapp_url === 'string' ? row.whatsapp_url : '',
      postingDate: typeof row.posting_date === 'string' ? row.posting_date : '',
      postingNotes: typeof row.notes === 'string' ? row.notes : '',
    };
  }

  async function loadChecklistFromServer() {
    if (!open) return;
    setChecklistLoading(true);
    setChecklistFeedback(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Sesi admin tidak ditemukan.');
      const params = new URLSearchParams({ content_type: contentType, content_slug: slug });
      const response = await fetch(`/api/admin/social-composer-checklist?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (!response.ok) throw new Error('Gagal memuat checklist.');
      const result = (await response.json()) as { checklist: Record<string, unknown> | null };
      const nextChecklist = checklistFromApiRow(result.checklist);
      setChecklist(nextChecklist);
      writeStoredChecklist(checklistStorageKey, nextChecklist);
      setChecklistFeedback({ tone: 'success', message: result.checklist ? 'Checklist dimuat.' : 'Belum ada checklist database; memakai data browser bila tersedia.' });
    } catch {
      const localChecklist = readStoredChecklist(checklistStorageKey);
      setChecklist(localChecklist);
      setChecklistFeedback({ tone: 'warning', message: 'Gagal memuat database. Memakai checklist browser admin.' });
    } finally {
      setChecklistLoading(false);
    }
  }

  async function saveChecklistToServer() {
    setChecklistSaving(true);
    setChecklistFeedback(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Sesi admin tidak ditemukan.');
      const response = await fetch('/api/admin/social-composer-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(checklistToApiPayload()),
      });
      if (!response.ok) throw new Error('Gagal menyimpan checklist.');
      const result = (await response.json()) as { checklist: Record<string, unknown> | null };
      const nextChecklist = checklistFromApiRow(result.checklist);
      setChecklist(nextChecklist);
      writeStoredChecklist(checklistStorageKey, nextChecklist);
      setChecklistFeedback({ tone: 'success', message: 'Checklist tersimpan' });
    } catch {
      setChecklistFeedback({ tone: 'error', message: 'Gagal menyimpan checklist' });
    } finally {
      setChecklistSaving(false);
    }
  }

  const checklistProgress = [
    checklist.instagramReelsPosted || checklist.instagramCarouselPosted,
    checklist.threadsPosted,
    checklist.tiktokPosted,
    checklist.facebookPosted,
    checklist.youtubeShortsPosted,
    checklist.linkedinPosted,
    checklist.whatsappShared,
  ].filter(Boolean).length;

  function joinPublishPackSections(sections: Array<string | undefined | null>) {
    return sections.map((section) => String(section || '').trim()).filter(Boolean).join('\n\n');
  }

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function removePublishPackDuplicateLinks(section: string | undefined | null) {
    const text = String(section || '');
    if (!activePromoLink || !payload?.canonicalUrl || !text.trim()) return text;

    const linksToRemove = [payload.canonicalUrl, activePromoLink].filter(Boolean);
    const withoutDuplicateLinks = linksToRemove.reduce((currentText, link) => {
      const escapedLink = escapeRegExp(link);
      return currentText.replace(new RegExp(escapedLink, 'g'), '');
    }, text);

    return withoutDuplicateLinks
      .split('\n')
      .map((line) => line.replace(/[ \t]{2,}/g, ' ').trimEnd())
      .filter((line) => !/^(link promosi|link dengan tracking|lihat studi lengkap)\s*:?\s*$/i.test(line.trim()))
      .join('\n')
      .trim();
  }

  function buildTrackedPublishPackSections(sections: Array<string | undefined | null>, promoLine: string) {
    const cleanedSections = activePromoLink && payload?.canonicalUrl ? sections.map(removePublishPackDuplicateLinks) : sections;
    return joinPublishPackSections([...cleanedSections, promoLine]);
  }

  function buildPublishPackText() {
    if (!draft) return '';
    const promoLine = activePromoLink ? `Link promosi: ${activePromoLink}` : '';

    if (activeTab === 'instagram') {
      const instagramPromoLine = activePromoLink ? `Link promosi (paling aman untuk bio, story, atau komentar pin): ${activePromoLink}` : '';
      return buildTrackedPublishPackSections([draft.igCaption, draft.igCta, draft.igHashtag], instagramPromoLine);
    }

    if (activeTab === 'tiktok') {
      return buildTrackedPublishPackSections([draft.tiktokCaption, draft.tiktokCta, draft.tiktokHashtag], promoLine);
    }

    if (activeTab === 'facebook') {
      return buildTrackedPublishPackSections([draft.facebookCaption, draft.facebookCta], promoLine);
    }

    if (activeTab === 'youtube') {
      return buildTrackedPublishPackSections([draft.youtubeDescription, draft.youtubeHashtags], promoLine);
    }

    if (activeTab === 'linkedin') {
      return buildTrackedPublishPackSections([draft.linkedInCaption, draft.linkedInBullets, draft.linkedInCta], promoLine);
    }

    if (activeTab === 'threads') {
      return buildTrackedPublishPackSections([draft.threadsPost, draft.threadsCta], promoLine);
    }

    if (activeTab === 'whatsapp') {
      return buildTrackedPublishPackSections([draft.whatsappMessage], activePromoLink || draft.whatsappLink);
    }

    return '';
  }

  function renderPublishPackPanel() {
    const publishPackText = buildPublishPackText();
    if (!publishPackText) return null;
    const isYoutube = activeTab === 'youtube';

    return (
      <div className="rounded-2xl border border-white/14 bg-white/[0.04] p-3 sm:p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#E6C676]">Paket Siap Posting</p>
            <p className="text-xs leading-5 text-white/68">Gabungan caption, CTA, hashtag, dan link promosi yang siap disalin sebelum upload manual.</p>
          </div>
          {isYoutube ? (
            <div className="rounded-xl border border-white/12 bg-black/25 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E6C676]/80">Judul YouTube</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white/88">{draft?.youtubeTitle}</p>
            </div>
          ) : null}
          <textarea
            readOnly
            value={publishPackText}
            rows={isYoutube ? 7 : 9}
            aria-label={isYoutube ? 'Paket Deskripsi YouTube' : 'Paket Siap Posting'}
            className="min-h-11 w-full max-w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm font-sans text-[#F4F1EA] break-words focus:border-[#D4AF37]/70 focus:outline-none"
          />
          <ButtonRow>
            <CopyButton label="Salin Paket Posting" copied={copied[`${activeTab}PublishPack`]} onClick={() => copyDraftText(`${activeTab}PublishPack`, publishPackText)} />
          </ButtonRow>
        </div>
      </div>
    );
  }

  function renderPromoLinkPanel() {
    if (!activePromoLink) return null;

    return (
      <div className="rounded-2xl border border-[#D4AF37]/35 bg-[#151209]/80 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#E6C676]">Link Promosi</p>
            <p className="text-xs leading-5 text-white/68">Gunakan link ini di caption, bio, komentar pin, story link, atau deskripsi sesuai platform.</p>
            {promoHelpByTab[activeTab] ? <p className="text-xs leading-5 text-white/62">{promoHelpByTab[activeTab]}</p> : null}
          </div>
          <div className="break-all rounded-xl border border-white/12 bg-black/25 p-3 text-xs leading-5 text-white/82">{activePromoLink}</div>
          <ButtonRow>
            <CopyButton label="Salin Link" copied={copied[`${activeTab}PromoLink`]} onClick={() => copyDraftText(`${activeTab}PromoLink`, activePromoLink)} />
            {promoInsertTargetByTab[activeTab] ? (
              <button type="button" onClick={insertPromoLinkToDraft} className="min-h-11 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-sans text-white/82">
                Sisipkan Link ke Caption
              </button>
            ) : null}
          </ButtonRow>
        </div>
      </div>
    );
  }

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
                {platformTabs.map(([key, label]) => (
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
                                copyDraftText(
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
                            <CopyButton label="Copy Reels" copied={copied.canvaReels} onClick={() => copyDraftText('canvaReels', draft.canvaReelsTimeline)} />
                            <CopyButton label="Copy Carousel" copied={copied.canvaCarousel} onClick={() => copyDraftText('canvaCarousel', draft.canvaCarouselSlides)} />
                            <CopyButton label="Copy Overlay" copied={copied.canvaOverlay} onClick={() => copyDraftText('canvaOverlay', draft.canvaOverlayText)} />
                          </ButtonRow>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'instagram' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Asset visual diproduksi dulu di Canva, lalu upload langsung atau share dari Canva ke Instagram.</p>
                      <p className="text-xs text-[#E6C676]/90">Untuk Reels dan Carousel, gunakan brief lengkap di tab Canva.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Caption Instagram" value={draft.igCaption} onChange={(v) => updateDraft('igCaption', v)} rows={7} />
                      <Field label="Hashtag" value={draft.igHashtag} onChange={(v) => updateDraft('igHashtag', v)} rows={3} />
                      <Field label="CTA website" value={draft.igCta} onChange={(v) => updateDraft('igCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption IG" copied={copied.igCaption} onClick={() => copyDraftText('igCaption', `${draft.igCaption}\n${draft.igCta}\n${draft.igHashtag}`)} />
                        <button type="button" onClick={() => postToPlatform('instagram')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to Instagram</button>
                      </ButtonRow>
                      {postStatus.instagram ? <p className="text-xs text-white/75">{postStatus.instagram.message}</p> : null}
                    </div>
                  )}



                  {activeTab === 'threads' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Format ini dibuat untuk percakapan ringan di Threads: reflektif, natural, tanpa hard selling.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Threads Post" value={draft.threadsPost} onChange={(v) => updateDraft('threadsPost', v)} rows={9} />
                      <Field label="Reply Ideas" value={draft.threadsReplyIdeas} onChange={(v) => updateDraft('threadsReplyIdeas', v)} rows={6} />
                      <Field label="CTA" value={ensureThreadsCta(draft, payload?.canonicalUrl).threadsCta} onChange={(v) => updateDraft('threadsCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Threads Post" copied={copied.threadsPost} onClick={() => {
                          const ensured = ensureThreadsCta(draft, payload?.canonicalUrl);
                          copyDraftText('threadsPost', `${ensured.threadsPost}\n\n${ensured.threadsCta}`);
                        }} />
                        <CopyButton label="Copy Reply Ideas" copied={copied.threadsReplies} onClick={() => copyDraftText('threadsReplies', draft.threadsReplyIdeas)} />
                      </ButtonRow>
                    </div>
                  )}
                  {activeTab === 'tiktok' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Video MP4 bisa dibagikan langsung dari Canva Share atau diupload manual ke TikTok.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Hook 3 detik" value={draft.tiktokHook} onChange={(v) => updateDraft('tiktokHook', v)} rows={3} />
                      <Field label="Script voice over" value={draft.tiktokScript} onChange={(v) => updateDraft('tiktokScript', v)} rows={7} />
                      <Field label="Caption TikTok" value={draft.tiktokCaption} onChange={(v) => updateDraft('tiktokCaption', v)} rows={4} />
                      <Field label="Hashtag" value={draft.tiktokHashtag} onChange={(v) => updateDraft('tiktokHashtag', v)} rows={3} />
                      <Field label="CTA website" value={draft.tiktokCta} onChange={(v) => updateDraft('tiktokCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Script TikTok" copied={copied.tiktokScript} onClick={() => copyDraftText('tiktokScript', `${draft.tiktokHook}\n\n${draft.tiktokScript}`)} />
                        <CopyButton label="Copy Caption TikTok" copied={copied.tiktokCaption} onClick={() => copyDraftText('tiktokCaption', `${draft.tiktokCaption}\n${draft.tiktokCta}\n${draft.tiktokHashtag}`)} />
                        <button type="button" onClick={() => postToPlatform('tiktok')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to TikTok</button>
                      </ButtonRow>
                      {postStatus.tiktok ? <p className="text-xs text-white/75">{postStatus.tiktok.message}</p> : null}
                    </div>
                  )}


                  {activeTab === 'facebook' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Gunakan visual utama atau carousel dari Canva, lalu tempatkan link promosi langsung di caption Facebook.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Caption Facebook" value={draft.facebookCaption} onChange={(v) => updateDraft('facebookCaption', v)} rows={7} />
                      <Field label="CTA Facebook" value={draft.facebookCta} onChange={(v) => updateDraft('facebookCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption Facebook" copied={copied.facebookCaption} onClick={() => copyDraftText('facebookCaption', `${draft.facebookCaption}\n\n${draft.facebookCta}`)} />
                      </ButtonRow>
                    </div>
                  )}

                  {activeTab === 'youtube' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Gunakan MP4 dari Canva untuk upload ke YouTube Shorts agar alur produksi tetap satu pintu.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Judul SEO YouTube Shorts" value={draft.youtubeTitle} onChange={(v) => updateDraft('youtubeTitle', v)} rows={3} />
                      <Field label="Deskripsi singkat" value={draft.youtubeDescription} onChange={(v) => updateDraft('youtubeDescription', v)} rows={5} />
                      <Field label="Hashtag (wajib #Shorts)" value={draft.youtubeHashtags} onChange={(v) => updateDraft('youtubeHashtags', v)} rows={3} />
                      <Field label="Upload guide" value={draft.youtubeUploadGuide} onChange={(v) => updateDraft('youtubeUploadGuide', v)} rows={6} />
                      <ButtonRow>
                        <CopyButton label="Copy Caption YouTube Shorts" copied={copied.youtubeCaption} onClick={() => copyDraftText('youtubeCaption', `${draft.youtubeTitle}\n\n${draft.youtubeDescription}\n\n${draft.youtubeHashtags}`)} />
                        <CopyButton label="Copy Upload Guide" copied={copied.youtubeGuide} onClick={() => copyDraftText('youtubeGuide', draft.youtubeUploadGuide)} />
                        <button type="button" onClick={() => postToPlatform('youtube')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to YouTube Shorts</button>
                      </ButtonRow>
                      {postStatus.youtube ? <p className="text-xs text-white/75">{postStatus.youtube.message}</p> : null}
                    </div>
                  )}

                  {activeTab === 'linkedin' && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Export carousel atau visual utama dari Canva terlebih dahulu, lalu gunakan narasi profesional saat publish di LinkedIn.</p>
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="Professional caption" value={draft.linkedInCaption} onChange={(v) => updateDraft('linkedInCaption', v)} rows={8} />
                      <Field label="Key insight bullet points" value={draft.linkedInBullets} onChange={(v) => updateDraft('linkedInBullets', v)} rows={6} />
                      <Field label="CTA ke halaman" value={draft.linkedInCta} onChange={(v) => updateDraft('linkedInCta', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy LinkedIn Caption" copied={copied.linkedinCaption} onClick={() => copyDraftText('linkedinCaption', `${draft.linkedInCaption}\n\n${draft.linkedInBullets}\n\n${draft.linkedInCta}`)} />
                        <button type="button" onClick={() => postToPlatform('linkedin')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Post to LinkedIn</button>
                      </ButtonRow>
                      {postStatus.linkedin ? <p className="text-xs text-white/75">{postStatus.linkedin.message}</p> : null}
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div className="space-y-3">
                      {renderPromoLinkPanel()}
                      {renderPublishPackPanel()}
                      <Field label="WhatsApp message" value={draft.whatsappMessage} onChange={(v) => updateDraft('whatsappMessage', v)} rows={6} />
                      <Field label="Link website" value={draft.whatsappLink} onChange={(v) => updateDraft('whatsappLink', v)} rows={2} />
                      <ButtonRow>
                        <CopyButton label="Copy WhatsApp" copied={copied.whatsapp} onClick={() => copyDraftText('whatsapp', `${draft.whatsappMessage}\n${draft.whatsappLink}`)} />
                        <button type="button" onClick={() => postToPlatform('whatsapp')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-sans text-white/80">Share via WhatsApp</button>
                      </ButtonRow>
                      {postStatus.whatsapp ? <p className="text-xs text-white/75">{postStatus.whatsapp.message}</p> : null}
                    </div>
                  )}

                  {activeTab === 'checklist' && (
                    <div className="space-y-4 rounded-xl border border-[#D4AF37]/30 bg-[#11100f] p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#E6C676]">Checklist Publikasi</p>
                        <p className="text-sm text-white/78">{checklistProgress} dari 7 kanal sudah diposting</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#D4AF37]" style={{ width: `${(checklistProgress / 7) * 100}%` }} /></div>
                        <p className="text-xs text-white/65">Checklist ini tersimpan di database admin melalui tombol Simpan Checklist. Alur ini hanya pencatatan manual, bukan auto-posting.</p>
                        {checklistFeedback ? <p className={`rounded-xl border p-3 text-xs ${checklistFeedback.tone === 'success' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : checklistFeedback.tone === 'error' ? 'border-red-300/25 bg-red-300/10 text-red-100' : 'border-amber-300/25 bg-amber-300/10 text-amber-100'}`}>{checklistFeedback.message}</p> : null}
                      </div>

                      <ChecklistSection title="Produksi">
                        <ChecklistItem label="Canva Design selesai" checked={checklist.canvaDesignDone} onChange={(value) => updateChecklist('canvaDesignDone', value)} />
                      </ChecklistSection>

                      <ChecklistSection title="Distribusi Manual">
                        <ChecklistItem label="Instagram Reels sudah diposting" checked={checklist.instagramReelsPosted} onChange={(value) => updateChecklist('instagramReelsPosted', value)} />
                        <ChecklistItem label="Instagram Carousel sudah diposting" checked={checklist.instagramCarouselPosted} onChange={(value) => updateChecklist('instagramCarouselPosted', value)} />
                        <ChecklistItem label="Threads sudah diposting" checked={checklist.threadsPosted} onChange={(value) => updateChecklist('threadsPosted', value)} />
                        <ChecklistItem label="TikTok sudah diposting" checked={checklist.tiktokPosted} onChange={(value) => updateChecklist('tiktokPosted', value)} />
                        <ChecklistItem label="Facebook sudah diposting" checked={checklist.facebookPosted} onChange={(value) => updateChecklist('facebookPosted', value)} />
                        <ChecklistItem label="YouTube Shorts sudah diposting" checked={checklist.youtubeShortsPosted} onChange={(value) => updateChecklist('youtubeShortsPosted', value)} />
                        <ChecklistItem label="LinkedIn sudah diposting" checked={checklist.linkedinPosted} onChange={(value) => updateChecklist('linkedinPosted', value)} />
                        <ChecklistItem label="WhatsApp sudah dibagikan" checked={checklist.whatsappShared} onChange={(value) => updateChecklist('whatsappShared', value)} />
                      </ChecklistSection>

                      <ChecklistSection title="URL Posting dan Link Promosi">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            ['Instagram', 'instagramUrl', promoLinks?.instagram],
                            ['Threads', 'threadsUrl', promoLinks?.threads],
                            ['TikTok', 'tiktokUrl', promoLinks?.tiktok],
                            ['Facebook', 'facebookUrl', promoLinks?.facebook],
                            ['YouTube Shorts', 'youtubeUrl', promoLinks?.youtube],
                            ['LinkedIn', 'linkedinUrl', promoLinks?.linkedin],
                            ['WhatsApp', 'whatsappUrl', promoLinks?.whatsapp],
                          ].map(([label, field, promoLink]) => (
                            <div key={field} className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                              <InputField label={`${label} URL Posting`} value={String(checklist[field as keyof PublishChecklist] || '')} onChange={(value) => updateChecklist(field as keyof PublishChecklist, value as never)} />
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-[#E6C676]/90">Link Promosi</p>
                                {promoLink ? (
                                  <div className="space-y-2">
                                    <p className="break-all rounded-xl border border-white/10 bg-black/25 p-2 text-xs leading-5 text-white/75">{promoLink}</p>
                                    <CopyButton label="Salin Link Promosi" copied={copied[`checklist-${field}`]} onClick={() => copyDraftText(`checklist-${field}`, String(promoLink))} />
                                  </div>
                                ) : <p className="text-xs leading-5 text-white/48">Link promosi tersedia setelah data konten proyek dimuat.</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ChecklistSection>

                      <ChecklistSection title="Catatan Posting">
                        <InputField label="Tanggal Posting" value={checklist.postingDate} onChange={(value) => updateChecklist('postingDate', value)} />
                        <Field label="Catatan Posting" value={checklist.postingNotes} onChange={(value) => updateChecklist('postingNotes', value)} rows={4} />
                      </ChecklistSection>

                      <ButtonRow>
                        <button type="button" onClick={saveChecklistToServer} disabled={checklistSaving} className="rounded-full border border-[#D4AF37]/70 bg-[#D4AF37]/15 px-4 py-2 text-sm font-semibold text-[#E6C676] disabled:cursor-not-allowed disabled:opacity-60">{checklistSaving ? 'Menyimpan...' : 'Simpan Checklist'}</button>
                        <button type="button" onClick={loadChecklistFromServer} disabled={checklistLoading} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 disabled:cursor-not-allowed disabled:opacity-60">{checklistLoading ? 'Memuat...' : 'Muat Ulang Checklist'}</button>
                        <CopyButton label="Copy Laporan Publish" copied={copied.publishReport} onClick={() => copyDraftText('publishReport', buildPublishReport(contentType, slug, checklist))} />
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

                  {activeTab !== 'checklist' && (
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
                  )}
                </div>
        </div>
      ) : null}
    </>
  );
}
