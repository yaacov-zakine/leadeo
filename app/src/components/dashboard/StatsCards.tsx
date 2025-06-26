'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/src/integrations/client';

export default function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    prospects: 0,
    active: 0,
    amount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('campaigns').select('*');
      if (!error && data) {
        setStats({
          total: data.length,
          prospects: data.reduce(
            (sum, c) => sum + (c.prospects_generated || 0),
            0,
          ),
          active: data.filter((c) => c.status !== 'Livré').length,
          amount: data.reduce((sum, c) => sum + (c.amount || 0), 0),
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Campagnes totales',
      value: loading ? '...' : stats.total,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: '📊',
    },
    {
      label: 'Prospects générés',
      value: loading ? '...' : stats.prospects,
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: '👥',
    },
    {
      label: 'Campagnes actives',
      value: loading ? '...' : stats.active,
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      icon: '📈',
    },
    {
      label: 'Montant total',
      value: loading ? '...' : stats.amount + ' €',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      icon: '📅',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg p-4 shadow-sm ${stat.bg} flex flex-col items-center`}
        >
          <div className={`text-3xl mb-2`}>{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
