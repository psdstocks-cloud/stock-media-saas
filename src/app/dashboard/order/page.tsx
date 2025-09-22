import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/jwt-auth'
import NewOrderClient from './NewOrderClient'
import { SupportedSitesSidebar } from '@/components/dashboard/SupportedSitesSidebar'
import PointsInitializer from '@/components/auth/PointsInitializer'

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
      <PointsInitializer />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Order Stock Media</h1>
          <p className="text-white/70 text-lg">
            Paste URLs from supported stock media sites to download high-quality content
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area (70% width on large screens) */}
          <div className="lg:col-span-2">
            <NewOrderClient />
          </div>

          {/* Sidebar (30% width on large screens) */}
          <div className="space-y-6">
            <SupportedSitesSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
