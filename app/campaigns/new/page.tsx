'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/src/integrations/client';
import { Button } from '@/app/src/components/ui/button';
import { Input } from '@/app/src/components/ui/input';
import { Label } from '@/app/src/components/ui/label';
import { useAuth } from '@/app/src/hooks/useAuth';
import Link from 'next/link';

type QuestionType = 'text' | 'textarea' | 'checkbox' | 'select' | 'radio';

interface Question {
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
}

const ZONES = [
  'France entière',
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  "Provence-Alpes-Côte d'Azur",
  'Occitanie',
  'Nouvelle-Aquitaine',
  'Grand Est',
  'Hauts-de-France',
  'Normandie',
  'Bretagne',
  'Pays de la Loire',
];

const SECTORS = [
  'Industrie / Manufacturing',
  'Tech / IT',
  'Santé',
  'Finance',
  'Éducation',
  'Commerce',
  'Autre',
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Tous les hooks ici, AVANT tout return conditionnel
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [zone, setZone] = useState('');
  const [targetVolume, setTargetVolume] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [newQ, setNewQ] = useState({
    type: 'text' as QuestionType,
    label: '',
    required: false,
    options: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calcul automatique du montant
  const unitPrice = 25;
  const total = Number(targetVolume) * unitPrice;

  // Gestion des questions dynamiques
  const handleAddOrEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.label.trim()) return;
    if (newQ.type === 'select' || newQ.type === 'radio') {
      newQ.options = newQ.options?.filter((opt) => opt.trim()) ?? [];
      if (!newQ.options.length) return;
    }
    if (editingIdx !== null) {
      setQuestions(
        questions.map((q, i) => (i === editingIdx ? { ...newQ } : q)),
      );
      setEditingIdx(null);
    } else {
      setQuestions([...questions, { ...newQ }]);
    }
    setNewQ({ type: 'text', label: '', required: false, options: [''] });
  };

  const handleEditQuestion = (idx: number) => {
    setEditingIdx(idx);
    setNewQ({
      ...questions[idx],
      options: questions[idx].options ? [...questions[idx].options!] : [''],
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  // Soumission finale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (authLoading) {
      setError("Chargement de l'utilisateur en cours...");
      setLoading(false);
      return;
    }
    if (!user) {
      setError('Utilisateur non authentifié. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    if (!deliveryDate || deliveryDate.trim() === '') {
      setError('La date de livraison est obligatoire.');
      setLoading(false);
      return;
    }
    const campaignToInsert: any = {
      name,
      sector,
      zone,
      target_volume: Number(targetVolume),
      amount: total,
      status: 'En attente',
      status_color: 'bg-yellow-100 text-yellow-800',
      form_questions: questions as any,
      admin_notes: description || null,
      user_id: user.id,
    };
    // Ajoute delivery_date seulement si la valeur est non vide
    if (deliveryDate && deliveryDate.trim() !== '') {
      campaignToInsert.delivery_date = deliveryDate;
    }
    // Ajoute created_date seulement si la valeur est valide
    const now = new Date();
    if (!isNaN(now.getTime())) {
      campaignToInsert.created_date = now.toISOString();
    }
    const { error } = await supabase
      .from('campaigns')
      .insert([campaignToInsert]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  // UI
  return (
    <div className="p-8 w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-[var(--color-text)] font-semibold shadow transition-all border border-[var(--color-border)]"
      >
        <span className="text-lg">←</span> Retour au dashboard
      </Link>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle campagne</h1>
        <div className="mb-6 flex gap-2 items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 1 ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            1
          </div>
          <div className="h-1 w-8 bg-gray-300" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 2 ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            2
          </div>
          <div className="h-1 w-8 bg-gray-300" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 3 ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            3
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-4 bg-white p-6 rounded-lg shadow"
          >
            <div>
              <Label>Nom de la campagne *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Secteur d'activité *</Label>
                <select
                  className="w-full border rounded p-2"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un secteur</option>
                  {SECTORS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <Label>Zone géographique *</Label>
                <select
                  className="w-full border rounded p-2"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  required
                >
                  <option value="">Sélectionner une zone</option>
                  {ZONES.map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Nombre de prospects souhaité *</Label>
              <Input
                type="number"
                value={targetVolume}
                onChange={(e) => setTargetVolume(e.target.value)}
                required
              />
              <div className="text-xs text-gray-500">
                Prix unitaire : 25 € par prospect
              </div>
            </div>
            <div>
              <Label>Date de livraison souhaitée *</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>
            <div className="bg-blue-50 rounded p-3 flex justify-between items-center">
              <span>Total calculé :</span>
              <span className="text-lg font-bold text-blue-700">
                {isNaN(total) ? '0 €' : `${total} €`}
              </span>
            </div>
            <div>
              <Label>Description / Instructions spécifiques</Label>
              <textarea
                className="w-full border rounded p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-between">
              <div />
              <Button type="submit">Suivant</Button>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <Label>Formulaire de qualification (optionnel)</Label>
              <Button variant="outline" onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
            <form onSubmit={handleAddOrEditQuestion} className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="border rounded p-2"
                  value={newQ.type}
                  onChange={(e) =>
                    setNewQ((q) => ({
                      ...q,
                      type: e.target.value as QuestionType,
                      options: [''],
                    }))
                  }
                >
                  <option value="text">Texte</option>
                  <option value="textarea">Texte long</option>
                  <option value="checkbox">Case à cocher</option>
                  <option value="radio">Choix multiple</option>
                  <option value="select">Liste déroulante</option>
                </select>
                <Input
                  placeholder="Intitulé de la question"
                  value={newQ.label}
                  onChange={(e) =>
                    setNewQ((q) => ({ ...q, label: e.target.value }))
                  }
                  required
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={newQ.required}
                    onChange={(e) =>
                      setNewQ((q) => ({ ...q, required: e.target.checked }))
                    }
                  />{' '}
                  Obligatoire
                </label>
                {(newQ.type === 'radio' || newQ.type === 'select') && (
                  <div className="flex flex-col gap-1">
                    {newQ.options?.map((opt, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) =>
                            setNewQ((q) => ({
                              ...q,
                              options: q.options?.map((o, i) =>
                                i === idx ? e.target.value : o,
                              ),
                            }))
                          }
                          required
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setNewQ((q) => ({
                              ...q,
                              options:
                                q.options?.filter((_, i) => i !== idx) || [],
                            }))
                          }
                        >
                          🗑️
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setNewQ((q) => ({
                          ...q,
                          options: [...(q.options || []), ''],
                        }))
                      }
                    >
                      Ajouter une option
                    </Button>
                  </div>
                )}
                <Button type="submit">
                  {editingIdx !== null ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </form>
            <div className="space-y-2 mt-4">
              {questions.length === 0 && (
                <div className="text-gray-400 text-center py-8 border rounded bg-gray-50">
                  Aucune question configurée. Commencez par ajouter des
                  questions pour qualifier vos prospects.
                </div>
              )}
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border rounded p-2"
                >
                  <span className="font-medium">{q.label}</span>
                  <span className="text-xs text-gray-500">({q.type})</span>
                  {q.required && (
                    <span className="text-xs text-red-500">Obligatoire</span>
                  )}
                  {(q.type === 'radio' || q.type === 'select') && (
                    <span className="text-xs text-gray-500">
                      Options: {q.options?.join(', ')}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditQuestion(idx)}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveQuestion(idx)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Précédent
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-lg shadow"
          >
            <h2 className="text-xl font-bold mb-4">
              Récapitulatif et validation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold mb-2">
                  Informations de la campagne
                </h3>
                <div>
                  Nom : <b>{name}</b>
                </div>
                <div>
                  Secteur : <b>{sector}</b>
                </div>
                <div>
                  Zone : <b>{zone}</b>
                </div>
                <div>
                  Volume : <b>{targetVolume}</b>
                </div>
                <div>
                  Montant : <b className="text-green-600">{total} €</b>
                </div>
                <div>
                  Description :{' '}
                  <span className="text-gray-600">{description}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold mb-2">Planning</h3>
                <div>Création : {new Date().toLocaleDateString()}</div>
                <div>Livraison prévue : {deliveryDate || '-'}</div>
                <div>Délai de traitement : 14 jours ouvrés</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">
                Formulaire de qualification ({questions.length} questions)
              </h3>
              {questions.length === 0 && (
                <div className="text-gray-500">Aucune question</div>
              )}
              {questions.map((q, idx) => (
                <div key={idx} className="mb-1">
                  Q{idx + 1}: {q.label}{' '}
                  {q.required && (
                    <span className="text-xs text-red-500">Obligatoire</span>
                  )}
                  {(q.type === 'radio' || q.type === 'select') && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({q.options?.join(', ')})
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Étapes suivantes :</h3>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                <li>Votre campagne sera analysée par notre équipe</li>
                <li>Vous recevrez une confirmation sous 24h</li>
                <li>La génération de prospects débutera après validation</li>
                <li>Vous serez notifié de l'avancement régulièrement</li>
              </ul>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                Précédent
              </Button>
              <Button type="submit" className="" disabled={loading}>
                {loading ? 'Création...' : 'Créer la campagne'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Succès */}
        {step === 4 && (
          <div className="bg-green-50 rounded p-8 text-center text-green-700 font-bold text-xl shadow">
            Votre campagne a bien été créée !<br />
            Redirection vers le dashboard...
          </div>
        )}
      </div>
    </div>
  );
}
