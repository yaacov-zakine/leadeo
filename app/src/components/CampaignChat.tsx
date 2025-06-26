import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/app/src/integrations/client';
import { useAuth } from '@/app/src/hooks/useAuth';

interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function CampaignChat({ campaignId }: { campaignId: string }) {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (!error && data) setMessages(data);
      setLoading(false);
    };
    fetchMessages();
    // Optionnel : abonnement temps réel
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        fetchMessages,
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [campaignId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    await supabase.from('messages').insert({
      campaign_id: campaignId,
      sender: isAdmin ? 'admin' : 'client',
      content: input.trim(),
    });
    setInput('');
    setSending(false);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl shadow p-6 mt-8">
      <h3 className="text-lg font-bold mb-4">Messagerie</h3>
      <div className="max-h-64 overflow-y-auto mb-4 flex flex-col gap-3">
        {loading ? (
          <div>Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="text-[var(--color-subtle)] text-center">
            Aucun message pour cette campagne.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === (isAdmin ? 'admin' : 'client') ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl shadow text-sm max-w-xs ${msg.sender === (isAdmin ? 'admin' : 'client') ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-muted)] text-[var(--color-text)]'}`}
              >
                <div className="mb-1 font-semibold text-xs opacity-70">
                  {msg.sender === 'admin' ? 'Admin' : 'Client'}
                  <span className="ml-2 text-[var(--color-subtle)]">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border border-[var(--color-border)] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="Écrire un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold px-5 py-2 rounded-full shadow transition disabled:opacity-50"
          disabled={sending || !input.trim()}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
