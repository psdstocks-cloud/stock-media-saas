import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient user={session.user} />
    </div>
  )
}
