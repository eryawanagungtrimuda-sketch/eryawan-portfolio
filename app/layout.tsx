import type { Metadata } from 'next';
import { Belleza, Great_Vibes, Inter } from 'next/font/google';
import PortfolioClicks from './portfolio-clicks';
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
  title: 'Eryawan Agung | Portfolio Design Strategy',
  description: 'Portfolio personal Eryawan Agung untuk design strategy, spatial logic, dan kolaborasi profesional.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${belleza.variable} ${greatVibes.variable} bg-[#080807] text-[#f5f1e8] antialiased`}>
        {children}
        <PortfolioClicks />
      </body>
    </html>
  );
}
