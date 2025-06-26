import { Providers } from '@/app/src/components/Providers';
import AdminShell from '@/app/src/components/AdminShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
