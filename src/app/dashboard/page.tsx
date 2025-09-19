import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return <DashboardClient user={session.user} />
}
