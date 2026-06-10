import type { Metadata, Viewport } from 'next';
import PortfolioClicks from './portfolio-clicks';
import { ToastProvider } from '@/components/toast-provider';
import { SITE_URL, absoluteUrl } from '@/lib/site-url';
import './globals.css';
import './portfolio-teaser.css';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Eryawan Agung | Portfolio Design Strategy',
  description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
  authors: [{ name: 'Eryawan Agung', url: SITE_URL }],
  creator: 'Eryawan Agung',
  publisher: 'Eryawan Agung',
  keywords: ['Eryawan Agung', 'design strategy', 'spatial logic', 'portfolio desain', 'interior strategy'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'Eryawan Agung | Portfolio Design Strategy',
    description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
    url: absoluteUrl('/'),
    siteName: 'Eryawan Agung',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: 'Eryawan Agung Portfolio Design Strategy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eryawan Agung | Portfolio Design Strategy',
    description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
    images: [absoluteUrl('/opengraph-image')],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080807',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preload" as="image" href="/hero.jpg" />
        <link rel="preload" as="font" href="/fonts/Belleza-Regular.ttf" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        style={{
          ['--font-inter' as string]: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          ['--font-display' as string]: 'Belleza, Inter, ui-sans-serif, system-ui, sans-serif',
          ['--font-signature' as string]: '"Great Vibes", "Segoe Script", "Brush Script MT", cursive',
        }}
        className="bg-[#080807] text-[#f5f1e8] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:border focus:border-[#D4AF37]/50 focus:bg-black focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-[#D4AF37] focus:outline-none"
        >
          Lewati ke konten utama
        </a>
        <ToastProvider>
          {children}
          <PortfolioClicks />
          <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        </ToastProvider>
      </body>
    </html>
  );
}
