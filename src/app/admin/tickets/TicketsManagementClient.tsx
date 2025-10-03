'use client'

import React, { useState, useEffect } from 'react'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  User,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  department: string
  priority: string
  status: string
  userEmail: string
  userName: string
  orderReference?: string
  assignedTo?: string
  assignedToUser?: {
    id: string
    name: string
    email: string
  }
  slaDueDate: string
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
  _count: {
    responses: number
  }
}

interface TicketsResponse {
  tickets: Ticket[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function TicketsManagementClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    department: '',
    assignedTo: ''
  })

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await fetch(`/api/admin/tickets?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }

      const data: TicketsResponse = await response.json()
      setTickets(data.tickets)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [pagination.page, filters])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><AlertCircle className="h-3 w-3 mr-1" />Open</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case 'RESOLVED':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>
      case 'CLOSED':
        return <Badge variant="outline" className="text-gray-600 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="outline" className="text-red-600 border-red-200">High</Badge>
      case 'MEDIUM':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
      case 'LOW':
        return <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getDepartmentBadge = (department: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      support: 'bg-purple-100 text-purple-800',
      billing: 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {department.charAt(0).toUpperCase() + department.slice(1)}
      </Badge>
    )
  }

  const isSLAOverdue = (slaDueDate: string) => {
    return new Date(slaDueDate) < new Date()
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchTickets} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold flex items-center">
            <MessageSquare className="h-8 w-8 mr-3" />
            Support Tickets
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Manage customer support tickets and responses
          </Typography>
        </div>
        <Button onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assigned To</label>
              <Select value={filters.assignedTo} onValueChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets ({pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h3" className="text-lg font-semibold mb-2">No tickets found</Typography>
              <Typography variant="body" color="muted">No tickets match your current filters.</Typography>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Typography variant="h4" className="font-semibold truncate">
                          {ticket.subject}
                        </Typography>
                        {isSLAOverdue(ticket.slaDueDate) && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {ticket.userEmail}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.orderReference && (
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {ticket.orderReference}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        {getDepartmentBadge(ticket.department)}
                        <Badge variant="outline">
                          {ticket._count.responses} responses
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Typography variant="body-sm" color="muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} tickets
          </Typography>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
