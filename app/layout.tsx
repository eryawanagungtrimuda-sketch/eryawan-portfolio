import type { Metadata } from 'next';
import { Belleza, Great_Vibes, Inter } from 'next/font/google';
import PortfolioClicks from './portfolio-clicks';
import { SITE_URL } from '@/lib/site-url';
import './globals.css';
import './portfolio-teaser.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const belleza = Belleza({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
});
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-signature',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Eryawan Agung | Portfolio Design Strategy',
  description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Eryawan Agung | Portfolio Design Strategy',
    description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
    url: '/',
    siteName: 'Eryawan Agung',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${belleza.variable} ${greatVibes.variable} bg-[#080807] text-[#f5f1e8] antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:border focus:border-[#D4AF37]/50 focus:bg-black focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-[#D4AF37] focus:outline-none"
        >
          Lewati ke konten utama
        </a>
        {children}
        <PortfolioClicks />
      </body>
    </html>
  );
}
