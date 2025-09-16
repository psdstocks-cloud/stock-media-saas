// src/app/(admin)/layout.tsx
import { auth } from '@/auth'; // <-- Correct import
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    // Redirect non-admins away
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}
      <div className="lg:pl-64">
        {/* <AdminHeader user={session.user} /> */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}