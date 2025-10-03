'use client'

import React, { useState, useEffect } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  department: string
  message: string
  priority: string
  status: string
  userId: string
  userEmail: string
  userName?: string
  orderReference?: string
  assignedTo?: string
  assignedToUser?: {
    id: string
    name: string
    email: string
  }
  response?: string
  internalNotes?: string
  attachments?: any[]
  slaDueDate?: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  responses?: TicketResponse[]
}

interface TicketResponse {
  id: string
  ticketId: string
  userId: string
  userEmail: string
  userName?: string
  message: string
  isInternal: boolean
  attachments?: any[]
  createdAt: string
  updatedAt: string
}

const PRIORITY_COLORS = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

// const STATUS_ICONS = {
//   OPEN: AlertCircle,
//   IN_PROGRESS: Clock,
//   RESOLVED: CheckCircle,
//   CLOSED: XCircle
// }

export default function TicketManagementClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  // const [activeTab, setActiveTab] = useState('all')

  // Fetch tickets
  useEffect(() => {
    fetchTickets()
  }, [])

  // Filter tickets
  useEffect(() => {
    let filtered = tickets

    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.department === departmentFilter)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter, priorityFilter, departmentFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tickets', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  // const assignTicket = async (ticketId: string, assignedTo: string) => {
  //   try {
  //     const response = await fetch(`/api/admin/tickets/${ticketId}`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ assignedTo }),
  //     })

  //     if (response.ok) {
  //       await fetchTickets()
  //       if (selectedTicket?.id === ticketId) {
  //         setSelectedTicket({ ...selectedTicket, assignedTo })
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error assigning ticket:', error)
  //   }
  // }

  const getTicketStats = () => {
    const total = tickets.length
    const open = tickets.filter(t => t.status === 'OPEN').length
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length
    const closed = tickets.filter(t => t.status === 'CLOSED').length

    return { total, open, inProgress, resolved, closed }
  }

  const stats = getTicketStats()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Ticket Management
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Manage and respond to customer support tickets
          </Typography>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Total Tickets
                </Typography>
                <Typography variant="h3" className="font-bold">
                  {stats.total}
                </Typography>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Open
                </Typography>
                <Typography variant="h3" className="font-bold text-blue-600">
                  {stats.open}
                </Typography>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-muted-foreground">
                  In Progress
                </Typography>
                <Typography variant="h3" className="font-bold text-yellow-600">
                  {stats.inProgress}
                </Typography>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Resolved
                </Typography>
                <Typography variant="h3" className="font-bold text-green-600">
                  {stats.resolved}
                </Typography>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Closed
                </Typography>
                <Typography variant="h3" className="font-bold text-gray-600">
                  {stats.closed}
                </Typography>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tickets ({filteredTickets.length})</span>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredTickets.map((ticket) => {
                  // const StatusIcon = STATUS_ICONS[ticket.status as keyof typeof STATUS_ICONS]
                  return (
                    <div
                      key={ticket.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Typography variant="h4" className="font-semibold truncate">
                              {ticket.subject}
                            </Typography>
                            <Badge className={PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.userName || ticket.userEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.responses?.length || 0} responses
                            </span>
                          </div>

                          <Typography variant="body-sm" className="text-muted-foreground line-clamp-2">
                            {ticket.message}
                          </Typography>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedTicket.ticketNumber}</CardTitle>
                  <Badge className={PRIORITY_COLORS[selectedTicket.priority as keyof typeof PRIORITY_COLORS]}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Typography variant="h4" className="font-semibold mb-2">
                    {selectedTicket.subject}
                  </Typography>
                  <Typography variant="body" className="text-muted-foreground">
                    {selectedTicket.message}
                  </Typography>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS]}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Department:</span>
                    <span className="text-sm font-medium">{selectedTicket.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer:</span>
                    <span className="text-sm font-medium">{selectedTicket.userName || selectedTicket.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => updateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                    disabled={selectedTicket.status === 'IN_PROGRESS'}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateTicketStatus(selectedTicket.id, 'RESOLVED')}
                    disabled={selectedTicket.status === 'RESOLVED'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateTicketStatus(selectedTicket.id, 'CLOSED')}
                    disabled={selectedTicket.status === 'CLOSED'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <Typography variant="h4" className="font-semibold mb-2">
                  Select a Ticket
                </Typography>
                <Typography variant="body" className="text-muted-foreground">
                  Choose a ticket from the list to view details and manage it.
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
