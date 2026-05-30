import type { ContentType, PublishChecklist } from './types';

export function buildPublishReport(contentType: ContentType, slug: string, checklist: PublishChecklist) {
  return `Judul:\n${contentType} - ${slug}\n\nChecklist:\n- Canva Design: ${checklist.canvaDesignDone ? 'Selesai' : 'Belum'}\n- IG Reels: ${checklist.instagramReelsPosted ? 'Selesai' : 'Belum'}\n- IG Carousel: ${checklist.instagramCarouselPosted ? 'Selesai' : 'Belum'}\n- TikTok: ${checklist.tiktokPosted ? 'Selesai' : 'Belum'}\n- YouTube Shorts: ${checklist.youtubeShortsPosted ? 'Selesai' : 'Belum'}\n- LinkedIn: ${checklist.linkedinPosted ? 'Selesai' : 'Belum'}\n- WhatsApp: ${checklist.whatsappShared ? 'Selesai' : 'Belum'}\n\nLinks:\nInstagram: ${checklist.instagramUrl}\nTikTok: ${checklist.tiktokUrl}\nYouTube: ${checklist.youtubeUrl}\nLinkedIn: ${checklist.linkedinUrl}\n\nCatatan:\nTanggal: ${checklist.postingDate}\nNotes: ${checklist.postingNotes}`;
}
