import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await auth()

  // Redirect if not authenticated or not admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <UserManagementClient />
    </div>
  )
}
