import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/jwt-auth'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    redirect('/admin/login')
  }

  let user = null
  try {
    user = verifyJWT(token)
  } catch (error) {
    redirect('/admin/login')
  }

  // Redirect if not authenticated or not admin
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient />
    </div>
  )
}
