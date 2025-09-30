import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Create Account • Stock Media SaaS',
  description: 'Join and start downloading premium stock assets. Create your account in seconds.',
  openGraph: {
    title: 'Create Account • Stock Media SaaS',
    description: 'Sign up to access premium stock media with our point-based system.'
  }
}

export default async function RegisterPage() {
  try {
    const session = await auth()

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
