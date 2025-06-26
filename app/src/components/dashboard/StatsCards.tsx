'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/src/integrations/client';
import { useAuth } from '@/app/src/hooks/useAuth';

type Stats = {
  total: number;
  prospects: number;
  active: number;
  amount: number;
};

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    prospects: 0,
    active: 0,
    amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
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
          .eq('user_id', user.id as any);
        if (error) throw error;
        if (data) {
          setStats({
            total: data.length,
            prospects: data.reduce(
              (sum, c) =>
                sum +
                (c.status === 'Terminée'
                  ? c.target_volume
                  : (c.prospects_generated ?? 0)),
              0,
            ),
            active: data.filter((c) => c.status !== 'Livré').length,
            amount: data.reduce((sum, c) => sum + (c.amount ?? 0), 0),
          });
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur de chargement');
      }
      setLoading(false);
    };
    fetchStats();
  }, [user, authLoading]);

  let amountValue: string;
  if (loading) {
    amountValue = '...';
  } else {
    const amount = Number(stats.amount);
    amountValue = (isNaN(amount) ? 0 : amount) + ' €';
  }

  const cards = [
    {
      label: 'Campagnes totales',
      value: loading ? '...' : stats.total,
      bg: 'bg-[var(--color-primary)]/10',
      text: 'text-[var(--color-primary)]',
      icon: '📊',
    },
    {
      label: 'Prospects générés',
      value: loading ? '...' : stats.prospects,
      bg: 'bg-[var(--color-success)]/10',
      text: 'text-[var(--color-success)]',
      icon: '👥',
    },
    {
      label: 'Campagnes actives',
      value: loading ? '...' : stats.active,
      bg: 'bg-[var(--color-info)]/10',
      text: 'text-[var(--color-info)]',
      icon: '📈',
    },
    {
      label: 'Montant total',
      value: amountValue,
      bg: 'bg-[var(--color-accent)]/10',
      text: 'text-[var(--color-accent)]',
      icon: '💶',
    },
  ];

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl p-6 shadow-lg bg-[var(--color-surface)] flex flex-col items-center border border-[var(--color-border)] transition-transform hover:scale-105 duration-150`}
        >
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 text-2xl ${stat.bg}`}
          >
            {stat.icon}
          </div>
          <div className={`text-3xl font-extrabold ${stat.text}`}>
            {String(stat.value)}
          </div>
          <div className="text-xs text-[var(--color-subtle)] mt-1 font-medium uppercase tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
