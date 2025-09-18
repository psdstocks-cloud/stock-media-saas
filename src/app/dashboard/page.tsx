'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PointBalanceCard } from '@/components/dashboard/PointBalanceCard'
import { Download, Search, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

interface DashboardData {
  balance: any
  history: any[]
  orders: any[]
  stockSites: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch recent orders for the dashboard
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders?limit=5')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data.orders || []
    },
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    
    setIsProcessing(true)
    try {
      // Redirect to download page with URL
      router.push(`/dashboard/download?url=${encodeURIComponent(url)}`)
    } catch (error) {
      console.error('Error processing URL:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
            <Sparkles size={24} className="text-primary-foreground" />
              </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {session?.user?.name || 'User'}!
            </h1>
            </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Access millions of premium stock media from top sites. Download high-quality content at a fraction of the cost.
        </p>
          </div>
          
      {/* Primary Action Section - URL Input */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Download Stock Media
          </CardTitle>
          <p className="text-muted-foreground">
            Paste any stock media URL to get instant access to high-quality downloads
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUrlSubmit} className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://www.shutterstock.com/image-vector/example-1234567890"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-base"
                required
              />
                </div>
            <Button
              type="submit"
              size="lg"
              disabled={isProcessing || !url.trim()}
              className="h-12 px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {isProcessing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Get Link
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Point Balance Card */}
        <div className="lg:col-span-1">
          <PointBalanceCard />
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {order.imageUrl ? (
                          <img 
                            src={order.imageUrl} 
                            alt={order.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                            <Download className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{order.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            order.status === 'COMPLETED' || order.status === 'READY' ? 'default' :
                            order.status === 'PROCESSING' ? 'secondary' : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {order.cost} pts
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/dashboard/orders">
                      <Button variant="outline" className="w-full">
                        View All Orders
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </Link>
          </div>
                    </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-muted-foreground" />
                    </div>
                  <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by pasting a stock media URL above to download your first file
                  </p>
                  <Button variant="secondary" onClick={() => (document.querySelector('input[type="url"]') as HTMLInputElement)?.focus()}>
                    <Search className="mr-2 h-4 w-4" />
                    Get Started
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
                  </div>
                </div>
    </div>
  )
}