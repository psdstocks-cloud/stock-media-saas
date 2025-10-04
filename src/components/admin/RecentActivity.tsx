'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink } from 'lucide-react'

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'user',
      title: 'New user registered',
      description: 'admin@test.com joined the platform',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'order',
      title: 'System initialized',
      description: 'Admin panel setup completed',
      time: '1 day ago',
      status: 'info'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Latest platform activities and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <Badge variant={activity.status === 'success' ? 'default' : 'secondary'} className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
