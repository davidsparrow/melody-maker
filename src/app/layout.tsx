import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/navigation/Header';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Melody Magic - AI-Assisted Song Section Generator',
  description: 'Upload a song, analyze it with AI, and generate complementary sections like intros, outros, and bridges.',
  keywords: 'AI music, song generation, audio analysis, music production, BPM detection, key detection',
  authors: [{ name: 'Melody Magic Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
