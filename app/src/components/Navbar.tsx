// src/components/Navbar.tsx
'use client';

import { useAuth } from '@/app/src/hooks/useAuth';
import { Button } from '@/app/src/components/ui/button';
import { Badge } from '@/app/src/components/ui/badge';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut, isAdmin, userRole } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Prospeo
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              {userRole && (
                <Badge variant={isAdmin ? 'destructive' : 'secondary'}>
                  {userRole}
                </Badge>
              )}
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
