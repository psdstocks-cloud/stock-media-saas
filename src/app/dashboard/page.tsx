import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserFromRequest } from '@/lib/jwt-auth'
import DashboardClient from './DashboardClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    // Get user from JWT token
    const headersList = await headers()
    const request = new Request('http://localhost', { headers: headersList })
    const user = getUserFromRequest(request)
    
    // Check if user exists
    if (!user || !user.id) {
      console.log('No valid user found, redirecting to login')
      redirect('/login')
    }

    console.log('Dashboard page - valid user found:', { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    })

    // Convert JWT user to session-like object
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
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
        <DashboardClient user={sessionUser} />
      </Suspense>
    )
  } catch (error) {
    console.error('Dashboard page error:', error)
    redirect('/login')
  }
}
