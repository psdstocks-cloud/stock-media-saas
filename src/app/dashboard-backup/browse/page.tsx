import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import BrowseClient from './BrowseClient'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return <BrowseClient user={session.user} />
}
