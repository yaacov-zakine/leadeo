'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/src/hooks/useAuth';
import { supabase } from '@/app/src/integrations/client';
import CampaignFiles from '@/app/src/components/CampaignFiles';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user, loading } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!id) return;

    console.log('DEBUG - Campaign Detail Page:', { id, userId: user.id, user });

    const fetchCampaign = async () => {
      console.log('DEBUG - Fetching campaign with id:', id, 'type:', typeof id);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      console.log('DEBUG - Campaign query result:', { data, error });

      if (error || !data) {
        console.log('DEBUG - Campaign not found or access denied');
        setError('Campagne introuvable ou accès refusé.');
      } else {
        console.log('DEBUG - Campaign found:', data);
        setCampaign(data);
      }
    };
    const fetchFiles = async () => {
      const { data } = await (supabase as any)
        .from('files')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });
      setFiles(data || []);
    };
    const fetchComments = async () => {
      const { data } = await (supabase as any)
        .from('comments')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: true });
      setComments(data || []);
    };
    fetchCampaign();
    fetchFiles();
    fetchComments();
  }, [id, user, loading, router]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    await (supabase as any)
      .from('comments')
      .insert({ campaign_id: id, content: newComment, author: user.email });
    setNewComment('');
    const { data } = await (supabase as any)
      .from('comments')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600 font-bold p-8">{error}</div>;
  if (!campaign) return null;

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold px-5 py-2 rounded-full shadow flex items-center gap-2 transition-all"
        >
          <span className="text-lg">←</span> Retour
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📋</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex-1">
            {campaign.name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(campaign.status)}`}
          >
            {campaign.status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Volume cible :
            </span>{' '}
            <span className="font-bold">{campaign.target_volume}</span>
          </div>
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Zone :
            </span>{' '}
            <span className="font-bold">{campaign.zone}</span>
          </div>
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Secteur :
            </span>{' '}
            <span className="font-bold">{campaign.sector}</span>
          </div>
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Date de livraison :
            </span>{' '}
            <span className="font-bold">
              {formatDate(campaign.delivery_date)}
            </span>
          </div>
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Montant :
            </span>{' '}
            <span className="font-bold">{campaign.amount} €</span>
          </div>
          <div>
            <span className="text-[var(--color-subtle)] font-semibold">
              Prospects livrés :
            </span>{' '}
            <span className="font-bold">
              {campaign.status === 'Terminée'
                ? `${campaign.target_volume} / ${campaign.target_volume}`
                : `${campaign.prospects_generated ?? 0} / ${campaign.target_volume}`}
            </span>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-6 mt-6">
          <div className="text-[var(--color-subtle)] font-semibold mb-2">
            Notes admin :
          </div>
          <div className="mb-2 text-[var(--color-text)]">
            {campaign.admin_notes || (
              <span className="text-[var(--color-subtle)] italic">
                Aucune note
              </span>
            )}
          </div>
        </div>
      </div>
      <CampaignFiles campaignId={id || ''} />
      <div className="mt-8 bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-2">Commentaires</h2>
        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="border rounded p-2">
              <b>{c.author} :</b> {c.content}
              <div className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div>Aucun commentaire pour le moment.</div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
          >
            Envoyer
          </button>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'À valider':
      return 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]';
    case 'En production':
      return 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]';
    case 'Terminée':
      return 'bg-[var(--color-success)]/20 text-[var(--color-success)]';
    default:
      return 'bg-[var(--color-subtle)]/10 text-[var(--color-subtle)]';
  }
}

function formatDate(date: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
}
