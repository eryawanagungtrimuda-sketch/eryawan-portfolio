import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Eryawan Agung Trimuda | Portfolio',
  description: 'Portfolio pribadi Eryawan Agung Trimuda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} bg-sand text-ink antialiased`}>{children}</body>
    </html>
  );
}
