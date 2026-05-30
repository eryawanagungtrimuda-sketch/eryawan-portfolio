export type PostingPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp';

const PLATFORM_POSTING_DELAY_MS = 850;

export async function sendPlatformPostRequest(_platform: PostingPlatform): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, PLATFORM_POSTING_DELAY_MS));
}
