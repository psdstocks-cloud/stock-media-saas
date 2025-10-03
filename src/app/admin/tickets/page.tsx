import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import TicketsManagementClient from './TicketsManagementClient'

export default async function AdminTicketsPage() {
  const session = await auth()

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsManagementClient />
    </div>
  )
}