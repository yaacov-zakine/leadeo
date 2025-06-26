'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/src/integrations/client';
import { Tables } from '@/app/src/integrations/types';
import { useAuth } from '@/app/src/hooks/useAuth';
import Link from 'next/link';

type Campaign = Tables<'campaigns'>;
type CampaignWithUser = Campaign & { user?: Record<string, any> };

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [internalStatus, setInternalStatus] = useState<string>('');
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('ADMIN DEBUG', { user, isAdmin, authLoading });
    if (!authLoading && !isAdmin) {
      // Redirection à gérer différemment si besoin
      window.location.href = '/unauthorized';
      return;
    }
  }, [user, isAdmin, authLoading]);

  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      try {
        // Fallback sans jointure : on charge juste les campagnes
        const { data, error } = await supabase.from('campaigns').select('*');
        if (error) throw error;
        // On ajoute un flag pour afficher un message d'alerte dans l'UI
        const fallbackArray = data as CampaignWithUser[];
        (fallbackArray as any).noJoin = true;
        return fallbackArray;
      } catch (err: unknown) {
        console.error('[ADMIN] Erreur dans queryFn:', err);
        if (err instanceof Error) throw new Error(err.message);
        throw new Error(
          typeof err === 'object' ? JSON.stringify(err) : String(err),
        );
      }
    },
    enabled: true,
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Campaign>;
    }) => {
      const filteredUpdates = { ...updates };
      if ('created_date' in filteredUpdates && !filteredUpdates.created_date) {
        delete filteredUpdates.created_date;
      }
      if (
        'delivery_date' in filteredUpdates &&
        !filteredUpdates.delivery_date
      ) {
        delete filteredUpdates.delivery_date;
      }
      const { data, error } = await supabase
        .from('campaigns')
        .update(filteredUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
    onError: (error: unknown) => {
      console.error('Erreur lors de la mise à jour de la campagne:', error);
    },
  });

  useEffect(() => {
    if (selectedCampaign) {
      setAdminNotes(selectedCampaign.admin_notes || '');
      setInternalStatus(selectedCampaign.internal_status || '');
    }
  }, [selectedCampaign]);

  console.log('[ADMIN] Render', { isLoading, error, campaigns });
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="bg-red-50 text-red-700 rounded-lg p-8 text-center font-bold shadow-lg">
          Erreur de chargement des campagnes :<br />
          <pre className="text-xs text-left whitespace-pre-wrap break-all">
            {error.message || JSON.stringify(error)}
          </pre>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Calcul des stats globales
  const total = campaigns?.length || 0;
  const aValider =
    campaigns?.filter((c) => c.status?.toLowerCase() === 'à valider').length ||
    0;
  const enCours =
    campaigns?.filter((c) => c.status?.toLowerCase() === 'en production')
      .length || 0;
  const terminees =
    campaigns?.filter(
      (c) =>
        c.status?.toLowerCase() === 'terminée' ||
        c.status?.toLowerCase() === 'terminées',
    ).length || 0;
  const totalProspects =
    campaigns?.reduce((sum, c) => sum + (c.prospects_generated || 0), 0) || 0;
  const lastCampaigns = [...(campaigns || [])]
    .sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Interface Administrateur
      </h1>
      {/* Cards de stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <div className="rounded-xl p-6 shadow-lg bg-white flex flex-col items-center border border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-2xl bg-blue-50">
            📊
          </div>
          <div className="text-2xl font-extrabold text-blue-800">{total}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
            Total campagnes
          </div>
        </div>
        <div className="rounded-xl p-6 shadow-lg bg-white flex flex-col items-center border border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-2xl bg-yellow-50">
            🟡
          </div>
          <div className="text-2xl font-extrabold text-yellow-800">
            {aValider}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
            À valider
          </div>
        </div>
        <div className="rounded-xl p-6 shadow-lg bg-white flex flex-col items-center border border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-2xl bg-purple-50">
            🟣
          </div>
          <div className="text-2xl font-extrabold text-purple-800">
            {enCours}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
            En production
          </div>
        </div>
        <div className="rounded-xl p-6 shadow-lg bg-white flex flex-col items-center border border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-2xl bg-green-50">
            🟢
          </div>
          <div className="text-2xl font-extrabold text-green-800">
            {terminees}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
            Terminées
          </div>
        </div>
        <div className="rounded-xl p-6 shadow-lg bg-white flex flex-col items-center border border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-2xl bg-orange-50">
            👥
          </div>
          <div className="text-2xl font-extrabold text-orange-800">
            {totalProspects}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
            Prospects livrés
          </div>
        </div>
      </div>
      {/* Activité récente */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">Dernières campagnes créées</h2>
        <ul className="divide-y divide-gray-200 bg-white rounded-xl shadow p-4">
          {lastCampaigns.map((c) => (
            <li
              key={c.id}
              className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-gray-800">{c.name}</span>
              <span className="text-xs text-gray-500">
                {c.created_date?.slice(0, 10) || '-'}
              </span>
              <span className="text-xs ml-2">{c.status}</span>
            </li>
          ))}
          {lastCampaigns.length === 0 && <li>Aucune campagne récente.</li>}
        </ul>
      </div>
      <div className="space-y-6">
        <table className="min-w-full text-sm font-medium bg-white rounded-xl shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email client</th>
              <th className="px-4 py-3 text-left">Date création</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((campaign: CampaignWithUser) => (
              <tr
                key={campaign.id}
                className="border-b hover:bg-blue-50/40 transition-colors group"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {campaign.name}
                </td>
                <td className="px-4 py-3">{campaign.user_id || '-'}</td>
                <td className="px-4 py-3">
                  {campaign.created_date?.slice(0, 10) || '-'}
                </td>
                <td className="px-4 py-3">{campaign.status}</td>
                <td className="px-4 py-3">
                  {campaign.status === 'Terminée'
                    ? `${campaign.target_volume} / ${campaign.target_volume}`
                    : `${campaign.target_volume}${
                        campaign.prospects_generated
                          ? ` / ${campaign.prospects_generated}`
                          : ''
                      }`}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="btn bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700"
                    onClick={() =>
                      (window.location.href = `/admin/campaigns/${campaign.id}`)
                    }
                  >
                    Détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
