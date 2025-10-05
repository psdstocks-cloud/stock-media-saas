'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setOrders([])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">
          Track your download orders and their status across all stock sites.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Your download orders will appear here once you start downloading assets.
          </p>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Start Browsing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

