'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const data = [
  { name: 'Sep 1', revenue: 0 },
  { name: 'Sep 7', revenue: 0 },
  { name: 'Sep 14', revenue: 0 },
  { name: 'Sep 21', revenue: 0 },
  { name: 'Sep 28', revenue: 0 },
]

export function DashboardStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Revenue Analytics
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-orange-50 text-orange-600 border-orange-200">
              Line
            </Button>
            <Button variant="outline" size="sm">
              Bar
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Revenue trends over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Revenue (30 days)</p>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className="text-2xl font-bold text-green-600">+0.0%</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart will be implemented with recharts</p>
        </div>
      </CardContent>
    </Card>
  )
}
