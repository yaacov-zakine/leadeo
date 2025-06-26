'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/src/integrations/client';
import Link from 'next/link';
import { useAuth } from '@/app/src/hooks/useAuth';

type CampaignStatus =
  | 'À valider'
  | 'En production'
  | 'Terminée'
  | 'En attente'
  | 'Livré'
  | 'En cours'
  | string;

interface Campaign {
  id: string;
  name: string;
  target_volume: number;
  sector: string | null;
  zone: string | null;
  delivery_date: string;
  status: CampaignStatus;
  amount: number;
  prospects_generated?: number | null;
  created_date: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setErrorMsg('');
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id as any)
          .order('created_date', { ascending: false });
        if (error) throw error;
        if (data) setCampaigns(data as Campaign[]);
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur de chargement');
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-red-600 font-bold">
        Non connecté
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-red-50 text-red-700 rounded-lg p-6 mt-6 text-center font-bold">
        {errorMsg}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-lg shadow-lg p-10 mt-10 text-center flex flex-col items-center justify-center gap-6">
        <div className="text-7xl text-[var(--color-subtle)] mb-2">📉</div>
        <div className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Aucune campagne créée
        </div>
        <div className="text-[var(--color-subtle)] mb-4 max-w-md">
          Commencez à générer des prospects en créant votre première campagne
          personnalisée.
        </div>
        <Link href="/campaigns/new">
          <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-8 rounded-full shadow transition-all text-lg">
            + Créer une campagne
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-surface)]">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg p-8 mt-8 border border-[var(--color-border)]">
        <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2 text-[var(--color-text)]">
          <span role="img" aria-label="chart" className="text-3xl">
            📊
          </span>{' '}
          Vos campagnes{' '}
          <span className="text-base font-normal text-[var(--color-subtle)]">
            ({campaigns.length})
          </span>
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm font-medium">
            <thead className="sticky top-0 z-10 bg-[var(--color-muted)] shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Volume</th>
                <th className="px-4 py-3 text-left">Livrés</th>
                <th className="px-4 py-3 text-left">Secteur</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Montant (€)</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary)]/5 transition-colors group"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3">{c.target_volume}</td>
                  <td className="px-4 py-3">
                    {c.status === 'Terminée'
                      ? `${c.target_volume} / ${c.target_volume}`
                      : `${c.prospects_generated ?? 0} / ${c.target_volume}`}
                  </td>
                  <td className="px-4 py-3">{c.sector || '-'}</td>
                  <td className="px-4 py-3">{c.zone || '-'}</td>
                  <td className="px-4 py-3">{c.delivery_date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(c.status)}`}
                    >
                      {c.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                    {c.amount}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="text-[var(--color-primary)] hover:underline font-semibold"
                    >
                      Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: CampaignStatus) {
  switch (status) {
    case 'À valider':
      return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
    case 'En production':
      return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
    case 'Terminée':
      return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
    case 'En attente':
      return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
    case 'Livré':
      return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
    case 'En cours':
      return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
    default:
      return 'bg-[var(--color-subtle)]/10 text-[var(--color-subtle)]';
  }
}
