'use client';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/src/components/Providers';
import Navbar from '@/app/src/components/Navbar';
import Link from 'next/link';
import { useAuth } from '@/app/src/hooks/useAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata: Metadata = {
//   title: 'Prospeo - Plateforme de génération de prospects',
//   description: 'Plateforme de génération de prospects qualifiés',
// };

function Sidebar() {
  // 'use client' obligatoire pour hook
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, isAdmin } = useAuth();
  if (!user) return null;
  return (
    <aside className="hidden md:flex flex-col w-56 h-screen bg-white border-r shadow-sm fixed top-0 left-0 z-20">
      <div className="flex flex-col gap-2 p-6 pt-8">
        <Link href="/" className="font-bold text-lg mb-6">
          Dashboard
        </Link>
        <Link
          href="/campaigns/new"
          className="text-gray-700 hover:text-blue-600"
        >
          Créer une campagne
        </Link>
        <Link href="/campaigns" className="text-gray-700 hover:text-blue-600">
          Mes campagnes
        </Link>
        {isAdmin && (
          <Link href="/admin" className="text-gray-700 hover:text-red-600">
            Admin
          </Link>
        )}
      </div>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <Navbar />
          <Sidebar />
          <div className="md:pl-56 min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
