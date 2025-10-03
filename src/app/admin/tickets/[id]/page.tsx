import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/jwt-auth'
import TicketDetailClient from './TicketDetailClient'

export const dynamic = 'force-dynamic'

export default async function TicketDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <TicketDetailClient ticketId={id} />
    </div>
  )
}
