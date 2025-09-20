import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return <ProfileClient user={session.user} />
}
