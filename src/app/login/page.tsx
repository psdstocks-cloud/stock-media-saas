import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Login • Stock Media SaaS',
  description: 'Secure login with email verification and account protection.',
  openGraph: {
    title: 'Login • Stock Media SaaS',
    description: 'Sign in to access your dashboard and downloads.'
  }
}

export default function LoginPage() {
  return <LoginClient />
}
