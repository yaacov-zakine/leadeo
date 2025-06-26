'use client';
import Link from 'next/link';
import { useAuth } from '@/app/src/hooks/useAuth';
import { useState } from 'react';
import classNames from 'classnames';

const NAV = [
  { href: '/admin', icon: '🏠', label: 'Dashboard' },
  { href: '/admin/campaigns', icon: '📋', label: 'Campagnes' },
  { href: '/admin/users', icon: '👤', label: 'Utilisateurs' },
];

function AdminNavbar({ onMenu }: { onMenu: () => void }) {
  const { user, signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };
  return (
    <nav className="bg-[var(--color-header)]/80 border-b border-[var(--color-border)] shadow-sm flex items-center px-2 sm:px-4 md:px-8 py-3 md:py-4 sticky top-0 z-30 backdrop-blur-lg">
      {/* Menu burger mobile */}
      <button
        className="md:hidden mr-2 p-2 rounded-lg hover:bg-[var(--color-primary)]/10 transition"
        onClick={onMenu}
        aria-label="Ouvrir le menu"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <rect
            y="5"
            width="24"
            height="2"
            rx="1"
            fill="var(--color-primary)"
          />
          <rect
            y="11"
            width="24"
            height="2"
            rx="1"
            fill="var(--color-primary)"
          />
          <rect
            y="17"
            width="24"
            height="2"
            rx="1"
            fill="var(--color-primary)"
          />
        </svg>
      </button>
      <div className="flex-1 text-center md:text-left text-xl font-extrabold text-[var(--color-primary)]">
        Espace Admin
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-[var(--color-text)] font-medium hidden sm:inline">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-3 md:px-5 py-2 rounded-full shadow font-bold transition text-sm md:text-base"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay mobile */}
      <div
        className={classNames(
          'fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 md:hidden',
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <aside
        className={classNames(
          'fixed top-0 left-0 h-screen flex flex-col justify-between bg-[var(--color-sidebar)] text-[var(--color-text)] border-r border-[var(--color-border)] shadow-2xl z-50 transition-transform duration-200 w-auto min-w-[8rem] max-w-xs rounded-r-3xl md:rounded-none backdrop-blur-lg',
          open ? 'flex translate-x-0' : 'hidden -translate-x-full',
          'md:flex md:translate-x-0',
        )}
      >
        <div className="flex flex-col justify-between h-full overflow-y-auto">
          <div className="flex flex-col gap-2 p-2 pt-6 sm:p-4 md:p-6 md:pt-8">
            <div className="font-extrabold text-lg md:text-2xl mb-8 tracking-wide flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-[var(--color-primary)]/20 rounded-full p-1 md:p-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="var(--color-primary)"
                    fillOpacity=".2"
                  />
                  <path
                    d="M7 17V7m5 10V7m5 10V7"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="hidden md:inline text-[var(--color-primary)]">
                Admin <span className="font-light">Leado</span>
              </span>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 justify-center md:justify-start hover:bg-[var(--color-primary)]/10 rounded-lg px-2 py-3 md:px-4 md:py-2 font-medium transition relative"
              >
                <span className="text-xl md:text-base">{item.icon}</span>
                <span className="hidden sm:inline md:inline">{item.label}</span>
                {/* Tooltip sur mini sidebar */}
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[var(--color-primary)] text-white text-xs rounded px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition md:hidden sm:block">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-auto p-2 sm:p-4 md:p-6 border-t border-[var(--color-border)] text-xs text-[var(--color-subtle)] text-center">
            © 2024 Leado
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* Sidebar indépendante, toujours fixe */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Contenu principal avec padding-left pour ne jamais passer sous la sidebar */}
      <div className="min-h-screen bg-[var(--color-bg)] w-full max-w-none md:pl-64 transition-all">
        <AdminNavbar onMenu={() => setSidebarOpen(true)} />
        <main className="p-2 sm:p-4 md:p-8 flex-1">{children}</main>
      </div>
    </>
  );
}
