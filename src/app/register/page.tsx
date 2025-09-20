import { redirect } from 'next/navigation'
import { safeAuth } from '@/auth'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  try {
    const session = await safeAuth()

    // Only redirect if we have a valid session with a user
    if (session && session.user && session.user.id) {
      redirect('/dashboard')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RegisterClient />
      </div>
    )
  } catch (error) {
    console.error('Register page auth error:', error)
    // If there's an auth error, still show the register page
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RegisterClient />
      </div>
    )
  }
}
