import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/src/integrations/client';
import { useAuth } from '@/app/src/hooks/useAuth';

interface FileRow {
  id: string;
  url: string;
  filename: string;
  uploaded_by: string;
  created_at: string;
}

// Ajoute une fonction utilitaire pour slugifier le nom du fichier
function slugifyFilename(filename: string) {
  // Sépare le nom et l'extension
  const parts = filename.split('.');
  const ext = parts.length > 1 ? '.' + parts.pop() : '';
  let name = parts.join('.');
  // Version 100% compatible : enlève accents et caractères spéciaux
  name = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents unicode
    .replace(/[^a-zA-Z0-9_-]/g, '_') // remplace tout sauf lettres, chiffres, _ et -
    .replace(/_+/g, '_') // évite les doubles underscores
    .replace(/^_+|_+$/g, '') // pas d'underscore au début/fin
    .toLowerCase();
  return name + ext.toLowerCase();
}

export default function CampaignFiles({ campaignId }: { campaignId: string }) {
  const { isAdmin, user } = useAuth();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/admin/');
  console.log(
    'DEBUG CampaignFiles isAdmin:',
    isAdmin,
    'isAdminRoute:',
    isAdminRoute,
  );

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (!error && data) setFiles(data);
      setLoading(false);
    };
    fetchFiles();
    // Optionnel : abonnement temps réel
    const channel = supabase
      .channel('files')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `campaign_id=eq.${campaignId}`,
        },
        fetchFiles,
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [campaignId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      // Slugifie le nom du fichier pour éviter les erreurs Supabase
      const safeName = slugifyFilename(selectedFile.name);
      const filePath = `${campaignId}/${Date.now()}_${safeName}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('campaign-files')
        .upload(filePath, selectedFile);
      if (storageError) throw storageError;
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('campaign-files')
        .getPublicUrl(filePath);
      const url = publicUrlData?.publicUrl;
      // Insert in DB
      await supabase.from('files').insert({
        campaign_id: campaignId,
        url,
        filename: selectedFile.name, // On garde le nom original pour l'affichage
        uploaded_by: isAdmin ? 'admin' : 'client',
      });
      setSelectedFile(null);
      // Rafraîchit la liste immédiatement après upload
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (!error && data) setFiles(data);
    } catch (err: any) {
      setError(
        "Erreur lors de l'upload du fichier : " +
          (err?.message || JSON.stringify(err)),
      );
    }
    setUploading(false);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl shadow p-6 mt-8">
      <h3 className="text-lg font-bold mb-4">Fichiers partagés</h3>
      {/* Bloc upload visible pour tous, en premier plan */}
      <div className="mb-6 flex flex-col gap-2 z-20 relative bg-[var(--color-primary)]/10 border border-[var(--color-primary)] shadow-lg rounded-xl p-4">
        <label className="inline-block cursor-pointer bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold px-5 py-2 rounded-full shadow transition w-fit">
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          Choisir un fichier
        </label>
        {selectedFile && (
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[var(--color-text)] font-medium">
              {selectedFile.name}
            </span>
            <button
              onClick={handleUpload}
              className="bg-[var(--color-success)] hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full shadow transition"
              disabled={uploading}
            >
              {uploading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="bg-[var(--color-danger)] hover:bg-red-600 text-white font-bold px-3 py-2 rounded-full shadow transition"
              disabled={uploading}
            >
              Annuler
            </button>
          </div>
        )}
        {error && (
          <div className="text-[var(--color-danger)] mt-2">{error}</div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div>Chargement...</div>
        ) : files.length === 0 ? (
          <div className="text-[var(--color-subtle)] text-center">
            Aucun fichier partagé pour cette campagne.
          </div>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-4 p-2 border-b border-[var(--color-border)]"
            >
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] font-semibold hover:underline flex-1 truncate"
                download
              >
                {f.filename}
              </a>
              <span className="text-xs text-[var(--color-subtle)]">
                {f.uploaded_by === 'admin' ? 'Admin' : 'Client'}
              </span>
              <span className="text-xs text-[var(--color-subtle)]">
                {new Date(f.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
