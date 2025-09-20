import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const session = await auth()

  // Redirect if already authenticated
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <RegisterClient />
    </div>
  )
}
