export type ContentType = 'karya' | 'wawasan';
export type PlatformTab =
  | 'canva'
  | 'instagram'
  | 'threads'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'whatsapp'
  | 'checklist';

export type PublishChecklist = {
  canvaDesignDone: boolean;
  instagramReelsPosted: boolean;
  instagramCarouselPosted: boolean;
  threadsPosted: boolean;
  tiktokPosted: boolean;
  facebookPosted: boolean;
  youtubeShortsPosted: boolean;
  linkedinPosted: boolean;
  whatsappShared: boolean;
  postingDate: string;
  postingNotes: string;
  instagramUrl: string;
  threadsUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  whatsappUrl: string;
};

export type DetailPayload = {
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

export type ComposerDraft = {
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
  facebookCaption: string;
  facebookCta: string;
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

export type RegenerableField =
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

export type ContentGoal = 'profesional' | 'edukatif' | 'viral-ready' | 'soft-selling';

export type SocialComposerAutoPostModalProps = {
  contentType: ContentType;
  slug: string;
  buttonClassName?: string;
  wrapperClassName?: string;
};
