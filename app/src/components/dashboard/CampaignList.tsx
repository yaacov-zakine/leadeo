'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/src/integrations/client';

interface Campaign {
  id: number;
  name: string;
  target_volume: number;
  sector: string;
  zone: string;
  delivery_date: string;
  status: string;
  amount: number;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_date', { ascending: false });
      if (!error && data) {
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
        <div className="text-6xl text-gray-300 mb-4">📉</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">
          Aucune campagne créée
        </div>
        <div className="text-gray-500 mb-6">
          Commencez par créer votre première campagne de génération de prospects
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="chart">
          📊
        </span>{' '}
        Vos campagnes ({campaigns.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Volume</th>
              <th className="px-4 py-2 text-left">Secteur</th>
              <th className="px-4 py-2 text-left">Zone</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Montant (€)</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2">{c.target_volume}</td>
                <td className="px-4 py-2">{c.sector}</td>
                <td className="px-4 py-2">{c.zone}</td>
                <td className="px-4 py-2">{c.delivery_date}</td>
                <td className="px-4 py-2">{c.status}</td>
                <td className="px-4 py-2">{c.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
