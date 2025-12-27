import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: 'Jelantah Point - Setor Jelantah',
  description: 'Platform penukaran minyak jelantah menjadi poin',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import { DataProvider } from '@/context/DataContext';
import { SocketProvider } from '@/context/SocketContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable}`}>
        <SocketProvider>
          <DataProvider>
            <Navbar />
            <div className="pt-0"> {/* Removed padding-top as navbar is now sticky/overlay potentially or we want full control */}
              {children}
            </div>
          </DataProvider>
        </SocketProvider>
      </body>
    </html>
  );
}