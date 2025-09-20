'use client'

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

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface DashboardClientSimpleProps {
  user: User
}

export default function DashboardClientSimple({ user }: DashboardClientSimpleProps) {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1" className="text-3xl font-bold">
              Welcome back, {user.name || user.email}!
            </Typography>
            <Typography variant="body" className="text-muted-foreground mt-2">
              Here's what's happening with your account today.
            </Typography>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Remaining</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">850</div>
              <p className="text-xs text-muted-foreground">
                Available for downloads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Downloads</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Saved collections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <Typography variant="body-sm" className="font-medium">
                      Search Media
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Find photos, videos, and audio
                    </Typography>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <Typography variant="body-sm" className="font-medium">
                      My Downloads
                    </Typography>
                    <Typography variant="caption" color="muted">
                      View your downloaded files
                    </Typography>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div className="text-left">
                    <Typography variant="body-sm" className="font-medium">
                      Collections
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Manage your saved collections
                    </Typography>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <Typography variant="body-sm" className="font-medium">
                      Buy Points
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Purchase more download credits
                    </Typography>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Typography variant="body-sm" className="text-green-800">
                Login successful! You are now authenticated and can access the dashboard.
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
