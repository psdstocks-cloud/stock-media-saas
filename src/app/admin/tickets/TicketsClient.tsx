'use client'

import { useEffect, useState, useCallback } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, MessageSquare, RefreshCw, Clock, User, Mail, Calendar } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  userId: string
  user: {
    email: string
    name: string
  }
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    message: string
    isStaff: boolean
    authorName: string
    createdAt: string
  }>
}

interface TicketStats {
  open: number
  inProgress: number
  resolved: number
  closed: number
}

export default function TicketsClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats>({ open: 0, inProgress: 0, resolved: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newResponse, setNewResponse] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🎫 Loading tickets for status:', selectedTab)
      
      const response = await fetch(`/api/admin/tickets?status=${selectedTab}&page=1&limit=50`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Tickets loaded:', data)
      
      setTickets(data.tickets || [])
      setStats(data.stats || { open: 0, inProgress: 0, resolved: 0, closed: 0 })
      
    } catch (err) {
      console.error('❌ Load tickets error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [selectedTab])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleTicketUpdate = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      console.log('🔄 Updating ticket:', ticketId, updates)
      
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        console.log('✅ Ticket updated successfully')
        loadTickets() // Refresh the list
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, ...updates })
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update ticket')
      }
    } catch (error) {
      console.error('❌ Update ticket error:', error)
      alert(`Failed to update ticket: ${error}`)
    }
  }

  const handleAddResponse = async (ticketId: string) => {
    if (!newResponse.trim()) return
    
    try {
      await handleTicketUpdate(ticketId, { 
        response: newResponse.trim(),
        status: 'IN_PROGRESS'
      })
      setNewResponse('')
    } catch (error) {
      console.error('Failed to add response:', error)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    loadTickets()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-orange-600" />
          <div>
            <Typography variant="h1" className="text-2xl font-bold text-gray-900">
              Support Tickets
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Manage customer support requests and inquiries
            </Typography>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRetry} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh {retryCount > 0 && `(${retryCount})`}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-600">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-gray-600">Awaiting closure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            <p className="text-xs text-gray-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setSelectedTab(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <Typography variant="body" className="text-gray-600">
                Loading support tickets...
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <Typography variant="h3" className="text-red-700 font-semibold">
                    Failed to load tickets
                  </Typography>
                  <Typography variant="body" className="text-red-600 text-sm mt-1">
                    {error}
                  </Typography>
                </div>
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && tickets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
            <Typography variant="h3" className="text-gray-700 font-semibold mb-2">
              No {selectedTab.toLowerCase().replace('_', ' ')} tickets
            </Typography>
            <Typography variant="body" className="text-gray-500 text-center">
              {selectedTab === 'OPEN' 
                ? 'Great! No open tickets need your attention right now.'
                : `No tickets with ${selectedTab.toLowerCase().replace('_', ' ')} status found.`
              }
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      {!loading && !error && tickets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedTicket?.id === ticket.id ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {ticket.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-3 w-3" />
                          <span>{ticket.user.name}</span>
                          <Mail className="h-3 w-3" />
                          <span>{ticket.user.email}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{ticket.responses.length} responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ticket Detail */}
          <div className="lg:sticky lg:top-4">
            {!selectedTicket ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                  <Typography variant="body" className="text-gray-600">
                    Select a ticket to view details and respond
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedTicket.subject}</CardTitle>
                      <CardDescription>
                        Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Select 
                        value={selectedTicket.status}
                        onValueChange={(value) => handleTicketUpdate(selectedTicket.id, { status: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedTicket.user.name}</span>
                      <span className="text-sm text-gray-500">{selectedTicket.user.email}</span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                  </div>

                  {/* Responses */}
                  {selectedTicket.responses.map((response) => (
                    <div 
                      key={response.id} 
                      className={`rounded-lg p-4 ${
                        response.isStaff ? 'bg-orange-50 ml-4' : 'bg-blue-50 mr-4'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{response.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.createdAt).toLocaleString()}
                        </span>
                        {response.isStaff && (
                          <Badge variant="secondary" className="text-xs">Staff</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{response.message}</p>
                    </div>
                  ))}

                  {/* Add Response */}
                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="Type your response..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <Button 
                      onClick={() => handleAddResponse(selectedTicket.id)}
                      disabled={!newResponse.trim()}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Send Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
