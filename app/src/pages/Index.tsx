// src/app/index/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/src/hooks/useAuth';
import { Button } from '@/app/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/src/components/ui/card';

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bienvenue, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Prospeo - Plateforme de génération de prospects
        </p>

        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/campaigns/new')}>
            Créer une campagne
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/campaigns')}
          >
            Voir mes campagnes
          </Button>
          {isAdmin && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => router.push('/admin')}
            >
              Interface Admin
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Création simple</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Créez vos campagnes en quelques clics avec notre interface
              intuitive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suivi en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Suivez l'avancement de vos campagnes avec des métriques
              détaillées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats garantis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Obtenez des prospects qualifiés pour développer votre business.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
