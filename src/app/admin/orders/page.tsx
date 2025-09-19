import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import OrderManagementClient from './OrderManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const session = await auth()

  // Redirect if not authenticated or not admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <OrderManagementClient />
    </div>
  )
}
