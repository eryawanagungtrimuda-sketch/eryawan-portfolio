import type { PlatformTab, PublishChecklist, RegenerableField } from './types';

export const defaultChecklist: PublishChecklist = {
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

export const platformTabs: [PlatformTab, string][] = [
  ['canva', 'Canva'],
  ['instagram', 'Instagram'],
  ['threads', 'Threads'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube Shorts'],
  ['linkedin', 'LinkedIn'],
  ['whatsapp', 'WhatsApp'],
  ['checklist', 'Checklist'],
];

export const regenerableFieldsByTab: Partial<Record<PlatformTab, RegenerableField[]>> = {
  canva: ['canvaReelsTimeline', 'canvaCarouselSlides', 'canvaOverlayText'],
  instagram: ['igCaption', 'igHashtag'],
  threads: ['threadsPost', 'threadsReplyIdeas'],
  tiktok: ['tiktokHook', 'tiktokScript', 'tiktokCaption', 'tiktokHashtag'],
  youtube: ['youtubeTitle', 'youtubeDescription'],
  linkedin: ['linkedInCaption', 'linkedInBullets'],
  whatsapp: ['whatsappMessage'],
};
