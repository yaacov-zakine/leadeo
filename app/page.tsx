// src/app/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/src/hooks/useAuth';
import StatsCards from '@/app/src/components/dashboard/StatsCards';
import CampaignList from '@/app/src/components/dashboard/CampaignList';

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bienvenue, {user.user_metadata?.full_name || user.email}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Prospeo — plateforme de génération de prospects
        </p>
      </div>
      <StatsCards />
      <CampaignList />
    </div>
  );
}
