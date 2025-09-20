import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <SettingsClient />
    </div>
  )
}
