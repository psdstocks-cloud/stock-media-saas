'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Search, ShoppingCart } from 'lucide-react'
import { ThemedIcon } from '@/components/admin/ThemedIcon'

interface _AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

interface OrderData {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: {
    email: string
    name: string | null
  }
}

export default function OrderManagementClient() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography 
          variant="h2" 
          className="text-2xl font-bold"
          style={{ color: 'var(--admin-text-primary)' }}
        >
          Orders Management
        </Typography>
        <Typography 
          variant="body" 
          className="mt-1"
          style={{ color: 'var(--admin-text-secondary)' }}
        >
          Monitor and manage customer orders
        </Typography>
      </div>

      {/* Orders Table */}
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center space-x-2"
            style={{ color: 'var(--admin-text-primary)' }}
          >
            <ThemedIcon 
              icon={ShoppingCart}
              className="h-5 w-5" 
              style={{ color: 'var(--admin-accent)' }}
            />
            <span>Order History ({orders.length} orders)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <ThemedIcon 
                icon={Search}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: 'var(--admin-text-muted)' }}
              />
              <Input
                placeholder="Search orders by customer email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--admin-bg-secondary)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)'
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)',
                border: '1px solid var(--admin-border)'
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr 
                  className="border-b text-left"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Order ID
                  </th>
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Customer
                  </th>
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Status
                  </th>
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Amount
                  </th>
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Date
                  </th>
                  <th 
                    className="pb-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td 
                      colSpan={6} 
                      className="text-center py-8"
                      style={{ color: 'var(--admin-text-secondary)' }}
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={6} 
                      className="text-center py-8"
                      style={{ color: 'var(--admin-text-muted)' }}
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b transition-colors hover:opacity-80"
                      style={{ 
                        borderColor: 'var(--admin-border)',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <td 
                        className="py-3 font-mono text-sm"
                        style={{ color: 'var(--admin-text-primary)' }}
                      >
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-3">
                        <div>
                          <div 
                            className="font-medium"
                            style={{ color: 'var(--admin-text-primary)' }}
                          >
                            {order.user.name || 'Unnamed User'}
                          </div>
                          <div 
                            className="text-sm"
                            style={{ color: 'var(--admin-text-secondary)' }}
                          >
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td 
                        className="py-3"
                        style={{ color: 'var(--admin-text-primary)' }}
                      >
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td 
                        className="py-3"
                        style={{ color: 'var(--admin-text-secondary)' }}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--admin-text-primary)',
                            borderColor: 'var(--admin-border)'
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}