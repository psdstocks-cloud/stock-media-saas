import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import ApprovalsManagement from './ApprovalsManagement'

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login')
  }

  return (
    <ProtectedRoute>
      <AdminLayout user={session.user}>
        <ApprovalsManagement />
      </AdminLayout>
    </ProtectedRoute>
  )
}