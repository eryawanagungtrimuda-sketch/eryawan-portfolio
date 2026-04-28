import type { Metadata } from 'next';
import { Belleza, Great_Vibes, Inter } from 'next/font/google';
import './globals.css';

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
  title: 'Eryawan Studio | Ruang yang masuk akal',
  description: 'Studio desain strategis yang memposisikan ruang sebagai keputusan bernilai jangka panjang.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${belleza.variable} ${greatVibes.variable} bg-[#080807] text-[#f5f1e8] antialiased`}>
        {children}
      </body>
    </html>
  );
}
