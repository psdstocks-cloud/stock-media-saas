import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/jwt-auth'
import OrderPageClient from './OrderPageClient'

export const dynamic = 'force-dynamic'

export default async function OrderPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    redirect('/login')
  }

  let user = null
  try {
    user = verifyJWT(token)
  } catch (error) {
    redirect('/login')
  }

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <OrderPageClient />
    </div>
  )
}
