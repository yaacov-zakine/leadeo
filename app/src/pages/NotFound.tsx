// src/app/not-found.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/src/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
