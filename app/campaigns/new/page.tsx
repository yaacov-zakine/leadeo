'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/src/integrations/client';
import { Button } from '@/app/src/components/ui/button';
import { Input } from '@/app/src/components/ui/input';
import { Label } from '@/app/src/components/ui/label';

interface Question {
  label: string;
  required: boolean;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  // Step 1: Infos campagne
  const [name, setName] = useState('');
  const [targetVolume, setTargetVolume] = useState('');
  const [sector, setSector] = useState('');
  const [zone, setZone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [amount, setAmount] = useState('');
  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newRequired, setNewRequired] = useState(false);
  // Wizard
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions([...questions, { label: newQuestion, required: newRequired }]);
    setNewQuestion('');
    setNewRequired(false);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.from('campaigns').insert([
      {
        name,
        target_volume: Number(targetVolume),
        sector,
        zone,
        delivery_date: deliveryDate,
        amount: Number(amount),
        status: 'En attente',
        status_color: 'bg-yellow-100 text-yellow-800',
        form_questions: questions,
      },
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Créer une campagne</h1>
      <div className="mb-6 flex gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 1 ? 'bg-blue-600' : 'bg-gray-400'}`}
        >
          1
        </div>
        <div className="h-1 w-8 bg-gray-300 mt-3" />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 2 ? 'bg-blue-600' : 'bg-gray-400'}`}
        >
          2
        </div>
      </div>
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="space-y-4 bg-white p-6 rounded-lg shadow"
        >
          <div>
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="targetVolume">Volume cible</Label>
            <Input
              id="targetVolume"
              type="number"
              value={targetVolume}
              onChange={(e) => setTargetVolume(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sector">Secteur</Label>
            <Input
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="zone">Zone</Label>
            <Input
              id="zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="deliveryDate">Date de livraison</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Suivant
          </Button>
        </form>
      )}
      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow"
        >
          <div>
            <Label>Questions du formulaire</Label>
            <div className="space-y-2 mt-2">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>
                    {q.label}{' '}
                    {q.required && <span className="text-red-500">*</span>}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveQuestion(idx)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Nouvelle question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                />{' '}
                Obligatoire
              </label>
              <Button type="button" onClick={handleAddQuestion}>
                Ajouter
              </Button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Précédent
            </Button>
            <Button type="submit" className="" disabled={loading}>
              {loading ? 'Création...' : 'Créer la campagne'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
