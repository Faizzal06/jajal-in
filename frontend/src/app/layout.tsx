import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import { AuthProvider } from '@/lib/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TemuLokal - Temukan Hidden Gem Indonesia',
  description: 'Platform discovery hidden gems, UMKM, dan pengalaman budaya otentik di seluruh Indonesia.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#446900',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body-md">
        <AuthProvider>{children}</AuthProvider>
        <BottomNav />
      </body>
    </html>
  );
}
