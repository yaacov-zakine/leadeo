'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/src/hooks/useAuth';
import { Button } from '@/app/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/src/components/ui/card';
import { Input } from '@/app/src/components/ui/input';
import { Label } from '@/app/src/components/ui/label';

export default function AuthPage() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [showModal, setShowModal] = useState<null | 'client' | 'admin'>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAdminError('');

    if (showModal === 'admin') {
      if (adminCode !== 'admin123') {
        setAdminError('Code administrateur incorrect.');
        setLoading(false);
        return;
      }
      localStorage.setItem('isAdmin', 'true');
      window.location.href = '/admin';
      return;
    }

    // Si on arrive ici, c'est forcément le modal client
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[var(--color-bg)] to-[var(--color-accent)]/10">
      <div className="flex flex-col items-center gap-8 mt-24">
        <h1 className="text-3xl font-extrabold mb-2 text-[var(--color-text)]">
          Plateforme B2B
        </h1>
        <p className="text-lg text-[var(--color-subtle)] mb-8">
          Gestion de campagnes de génération de prospects
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            className="w-full btn flex items-center justify-center gap-2 text-lg"
            onClick={() => setShowModal('client')}
          >
            <span role="img" aria-label="user">
              👤
            </span>{' '}
            Se connecter (Client)
          </button>
          <button
            className="w-full btn bg-[var(--color-surface)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 flex items-center justify-center gap-2 text-lg"
            onClick={() => setShowModal('admin')}
          >
            <span role="img" aria-label="admin">
              🛡️
            </span>{' '}
            Espace Administrateur
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-all">
          <div className="bg-[var(--color-surface)] rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-[var(--color-subtle)] hover:text-[var(--color-text)] text-2xl"
              onClick={() => setShowModal(null)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-center mb-4 text-[var(--color-text)]">
              {showModal === 'admin'
                ? 'Connexion administrateur'
                : 'Connexion client'}
            </h2>
            {showModal === 'admin' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Code administrateur</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    placeholder="Code admin"
                  />
                </div>
                {adminError && (
                  <div className="text-[var(--color-danger)] text-center mb-2">
                    {adminError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full btn mt-2"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : "Accéder à l'espace admin"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mot de passe"
                  />
                </div>
                {error && (
                  <div className="text-[var(--color-danger)] text-center mb-2">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full btn mt-2"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Se connecter'}
                </button>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Pas de compte ? S'inscrire"
                    : 'Déjà un compte ? Se connecter'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
