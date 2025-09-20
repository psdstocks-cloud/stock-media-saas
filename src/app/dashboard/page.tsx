import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import DashboardClient from './DashboardClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      redirect('/login')
    }

    return (
      <Suspense fallback={
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <DashboardClient user={session.user} />
      </Suspense>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/login')
  }
}
