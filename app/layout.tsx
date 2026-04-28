import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Eryawan Studio | Ruang yang masuk akal',
  description: 'Studio desain strategis yang memposisikan ruang sebagai keputusan bernilai jangka panjang.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${cormorant.variable} bg-[#080807] text-[#f5f1e8] antialiased`}>
        {children}
      </body>
    </html>
  );
}
