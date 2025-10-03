import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import TicketsManagementClient from './TicketsManagementClient'

export default async function AdminTicketsPage() {
  const session = await auth()

  if (!session || !(session as any).user || ((session as any).user.role !== 'ADMIN' && (session as any).user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketsManagementClient />
    </div>
  )
}