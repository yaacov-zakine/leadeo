'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/src/integrations/client';
import { useAuth } from '@/app/src/hooks/useAuth';
import { Tables } from '@/app/src/integrations/types';
import CampaignFiles from '@/app/src/components/CampaignFiles';

type Campaign = Tables<'campaigns'>;
type File = { url: string; name: string };
type Comment = {
  id: number;
  content: string;
  author: string;
  created_at: string;
};

export default function AdminCampaignDetailPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [status, setStatus] = useState('');
  const [prospectsDelivered, setProspectsDelivered] = useState<number | null>(
    null,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Campagne introuvable.');
      } else {
        setCampaign(data);
        setStatus(data.status);
        setProspectsDelivered(data.prospects_generated);
      }
      setLoading(false);
    };
    const fetchComments = async () => {
      // @ts-expect-error
      const { data } = await (supabase.from('comments') as any)
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: true });
      setComments((data as Comment[]) || []);
    };
    const fetchFiles = async () => {
      // @ts-expect-error
      const { data } = await (supabase.from('files') as any)
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });
      setFiles((data as File[]) || []);
    };
    fetchCampaign();
    fetchComments();
    fetchFiles();
  }, [id]);

  const handleStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Si le statut passe à "Terminée", on met automatiquement prospects_generated = target_volume
    const updates: any = { status: newStatus };
    if (newStatus === 'Terminée' && campaign) {
      updates.prospects_generated = campaign.target_volume;
      setProspectsDelivered(campaign.target_volume);
    }

    await supabase.from('campaigns').update(updates).eq('id', id);
  };

  const handleProspectsDelivered = async () => {
    if (prospectsDelivered !== null) {
      await supabase
        .from('campaigns')
        .update({ prospects_generated: prospectsDelivered })
        .eq('id', id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const filePath = `campaigns/${id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('campaign-files')
      .upload(filePath, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage
        .from('campaign-files')
        .getPublicUrl(filePath);
      // @ts-expect-error
      await (supabase.from('files') as any).insert({
        campaign_id: id,
        url: data.publicUrl,
        name: file.name,
      });
      setFiles((prev) => [{ url: data.publicUrl, name: file.name }, ...prev]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    // @ts-expect-error
    await (supabase.from('comments') as any).insert({
      campaign_id: id,
      content: newComment,
      author: 'admin',
    });
    setNewComment('');
    // @ts-expect-error
    const { data } = await (supabase.from('comments') as any)
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600 font-bold p-8">{error}</div>;
  if (!campaign) return null;

  return (
    <div>
      <button onClick={() => router.push('/admin')} className="mb-6 btn">
        ← Retour
      </button>
      <h1 className="text-2xl font-bold mb-4">Détail de la campagne</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-2">
          <b>Nom :</b> {campaign.name}
        </div>
        <div className="mb-2 flex items-center gap-2">
          <b>Statut :</b>
          <select
            value={status || ''}
            onChange={handleStatusChange}
            className="ml-2 border rounded p-1"
          >
            <option>À valider</option>
            <option>En production</option>
            <option>Terminée</option>
          </select>
        </div>
        <div className="mb-2">
          <b>Volume cible :</b> {campaign.target_volume}
        </div>
        <div className="mb-2">
          <b>Zone :</b> {campaign.zone}
        </div>
        <div className="mb-2">
          <b>Secteur :</b> {campaign.sector}
        </div>
        <div className="mb-2">
          <b>Date de livraison :</b> {campaign.delivery_date}
        </div>
        <div className="mb-2">
          <b>Montant :</b> {campaign.amount} €
        </div>
      </div>
      {status !== 'Terminée' && (
        <div className="mb-2 flex items-center gap-2">
          <b>Prospects livrés :</b>
          <input
            type="number"
            value={
              prospectsDelivered !== null && prospectsDelivered !== undefined
                ? String(prospectsDelivered)
                : ''
            }
            onChange={(e) => setProspectsDelivered(Number(e.target.value))}
            className="border rounded p-1 w-24"
          />
        </div>
      )}
      {status === 'Terminée' && (
        <div className="mb-2 flex items-center gap-2">
          <b>Prospects livrés :</b>{' '}
          {campaign.prospects_generated ?? campaign.target_volume}
        </div>
      )}
      <button
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold px-4 py-2 rounded-full mt-2 shadow transition"
        onClick={async () => {
          // Enregistre le statut
          const updates: any = { status };
          if (status === 'Terminée' && campaign) {
            updates.prospects_generated = campaign.target_volume;
            setProspectsDelivered(campaign.target_volume);
          } else if (
            prospectsDelivered !== null &&
            prospectsDelivered !== undefined
          ) {
            updates.prospects_generated = prospectsDelivered;
          }
          await supabase.from('campaigns').update(updates).eq('id', id);
          router.push('/admin');
        }}
      >
        Enregistrer
      </button>
      <CampaignFiles campaignId={id || ''} />
      <div className="mt-8 bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-2">Fil de discussion</h2>
        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="border rounded p-2">
              <b>{c.author} :</b> {c.content}
              <div className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 border rounded p-2"
          />
          <button onClick={handleAddComment} className="btn">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
