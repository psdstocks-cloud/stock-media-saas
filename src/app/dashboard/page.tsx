'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { Card, CardContent, CardHeader, CardTitle, Typography, Button } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PointsOverview from '@/components/dashboard/PointsOverview'
import dynamic from 'next/dynamic'
const OrdersManagement = dynamic(() => import('@/components/dashboard/OrdersManagement'), { ssr: false })
const SubscriptionManager = dynamic(() => import('@/components/dashboard/SubscriptionManager'), { ssr: false })
const StockMediaSearch = dynamic(() => import('@/components/dashboard/StockMediaSearch'), { ssr: false })
import ProfileSettings from '@/components/dashboard/ProfileSettings'
import RecentActivity from '@/components/dashboard/RecentActivity'
import BillingSummary from '@/components/dashboard/BillingSummary'
import { User, LogOut, Shield, Settings, Download, Search, Coins, ShoppingCart, CreditCard, FileSearch, Link } from 'lucide-react'
import useUserStore from '@/stores/userStore'
import EmptyState from '@/components/dashboard/EmptyState'

// interface DashboardUser {
//   id: string
//   email: string
//   name: string
//   role: string
// }

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  
  // Use centralized store for points
  const { points: userPoints } = useUserStore()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  // Onboarding: show gentle empty state if no user points and overview tab
  const showOnboarding = userPoints === 0 && activeTab === 'overview'

  return (
    <AuthGuard requireAuth={true}>
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <Typography variant="h2" className="text-[hsl(var(--foreground))] font-bold text-xl">
                  Stock Media SaaS
                </Typography>
                <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-sm">
                  Welcome back, {user?.name || 'User'}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-[hsl(var(--muted-foreground))]">
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">{user?.role || 'user'}</span>
              </div>
              {user?.role === 'admin' || user?.role === 'SUPER_ADMIN' ? (
                <Button
                  onClick={() => router.push('/admin/dashboard')}
                  variant="outline"
                  size="sm"
                  className="text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  title="Open Admin Panel"
                >
                  <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                  Admin Panel
                </Button>
              ) : null}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                title="Sign out of your account"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); const el = document.getElementById('content'); if (el) el.focus(); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 surface-card sticky top-[72px] z-40" title="Dashboard sections">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <Coins className="h-4 w-4 mr-2" aria-hidden="true" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <FileSearch className="h-4 w-4 mr-2" aria-hidden="true" />
              Search
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-[hsl(var(--accent))] data-[state=active]:text-[hsl(var(--accent-foreground))]">
              <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
              Billing
            </TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="mt-6">
          {showOnboarding && (
            <div className="mb-6">
              <EmptyState
                title="Welcome! Let's get you started"
                description="Add your first URLs on the Order page or explore supported platforms."
                primaryCta={{ label: 'Order media', href: '/dashboard/order' }}
                secondaryCta={{ label: 'See supported sites', href: '/dashboard/order#supported-platforms' }}
              />
            </div>
          )}
            {/* Points Hub - Prominent display */}
              <Card className="surface-card shadow-2xl mb-8">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="bg-[hsl(var(--muted))] w-16 h-16 rounded-full flex items-center justify-center">
                      <Coins className="h-8 w-8" />
                    </div>
                    <div>
                      <Typography variant="h1" className="text-4xl font-bold">
                        {userPoints === null ? '...' : userPoints?.toLocaleString() || '0'} Points
                      </Typography>
                      <Typography variant="body" className="text-lg text-[hsl(var(--muted-foreground))]">
                        Available for downloads
                      </Typography>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => router.push('/dashboard/order')}
                      variant="outline"
                      className="px-8 py-3 text-lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Order media
                    </Button>
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                    >
                      <Coins className="h-5 w-5 mr-2" />
                      Buy More Points
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PointsOverview />
              <BillingSummary />
              <RecentActivity />
              <Card className="surface-card shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-[hsl(var(--card-foreground))] flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => router.push('/dashboard/order')}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Order from URL
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    onClick={() => setActiveTab('search')}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Stock Media
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('orders')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Downloads
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('subscription')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <StockMediaSearch />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="text-center py-12">
              <Typography variant="h3" className="text-[hsl(var(--foreground))] mb-4">
                Billing & Transaction History
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-6">
                View your complete transaction history and billing details
              </Typography>
              <Button
                onClick={() => router.push('/dashboard/billing')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Full Billing History
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}