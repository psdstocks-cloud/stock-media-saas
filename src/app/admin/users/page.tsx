import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/jwt-auth'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) redirect('/admin/login')
  const user = verifyJWT(token)
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-background">
      <UserManagementClient />
    </div>
  )
}
