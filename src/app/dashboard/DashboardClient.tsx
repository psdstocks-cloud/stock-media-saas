'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Typography,
  Badge
} from '@/components/ui'
import { 
  Search, 
  Download, 
  Star, 
  CreditCard, 
  TrendingUp,
  Clock,
  Image,
  Video,
  Music
} from 'lucide-react'

interface DashboardStats {
  totalDownloads: number
  pointsRemaining: number
  recentDownloads: number
  favoriteCollections: number
}

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDownloads: 0,
    pointsRemaining: 0,
    recentDownloads: 0,
    favoriteCollections: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - in production, fetch from API
    setTimeout(() => {
      setStats({
        totalDownloads: 42,
        pointsRemaining: 850,
        recentDownloads: 3,
        favoriteCollections: 8
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const quickActions = [
    {
      title: 'Search Media',
      description: 'Find photos, videos, and audio',
      icon: Search,
      href: '/dashboard/search',
      color: 'text-blue-500'
    },
    {
      title: 'My Downloads',
      description: 'View your downloaded files',
      icon: Download,
      href: '/dashboard/downloads',
      color: 'text-green-500'
    },
    {
      title: 'Buy Points',
      description: 'Top up your account',
      icon: CreditCard,
      href: '/dashboard/pricing',
      color: 'text-purple-500'
    },
    {
      title: 'Favorites',
      description: 'Your saved collections',
      icon: Star,
      href: '/dashboard/favorites',
      color: 'text-orange-500'
    }
  ]

  const recentActivity = [
    {
      type: 'download',
      title: 'Business Meeting Photo',
      time: '2 hours ago',
      icon: Image,
      color: 'text-blue-500'
    },
    {
      type: 'download',
      title: 'Corporate Video Background',
      time: '1 day ago',
      icon: Video,
      color: 'text-red-500'
    },
    {
      type: 'download',
      title: 'Upbeat Background Music',
      time: '3 days ago',
      icon: Music,
      color: 'text-green-500'
    }
  ]

  if (isLoading) {
    return (
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
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <Typography variant="h2" className="mb-2">
            Welcome back, {user.name || 'User'}! 👋
          </Typography>
          <Typography variant="body-lg" color="muted">
            Here's what's happening with your account today.
          </Typography>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography variant="h3" className="brand-text-gradient">
                {stats.totalDownloads}
              </Typography>
              <Typography variant="caption" color="muted">
                +{stats.recentDownloads} this week
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Remaining</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography variant="h3" className="brand-text-gradient">
                {stats.pointsRemaining}
              </Typography>
              <Typography variant="caption" color="muted">
                Available for downloads
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography variant="h3" className="brand-text-gradient">
                {stats.favoriteCollections}
              </Typography>
              <Typography variant="caption" color="muted">
                Saved collections
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Typography variant="h3" className="brand-text-gradient">
                12
              </Typography>
              <Typography variant="caption" color="muted">
                Downloads this month
              </Typography>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => window.location.href = action.href}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${action.color}`} />
                          <div className="text-left">
                            <Typography variant="body-sm" className="font-medium">
                              {action.title}
                            </Typography>
                            <Typography variant="caption" color="muted">
                              {action.description}
                            </Typography>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest downloads and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`h-8 w-8 bg-muted rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography variant="body-sm" className="font-medium truncate">
                            {activity.title}
                          </Typography>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Downloaded
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        {stats.totalDownloads === 0 && (
          <Card className="brand-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                New to Stock Media SaaS? Here's how to begin your creative journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <Typography variant="h6">1. Search</Typography>
                  <Typography variant="body-sm" color="muted">
                    Find the perfect media for your project
                  </Typography>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <Typography variant="h6">2. Purchase</Typography>
                  <Typography variant="body-sm" color="muted">
                    Buy points to download high-quality media
                  </Typography>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <Typography variant="h6">3. Download</Typography>
                  <Typography variant="body-sm" color="muted">
                    Get instant access to your files
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
