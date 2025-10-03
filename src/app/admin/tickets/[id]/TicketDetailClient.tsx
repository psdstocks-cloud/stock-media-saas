'use client'

import React, { useState, useEffect } from 'react'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  // MoreHorizontal,
  Send,
  // Edit,
  // Trash2,
  Paperclip,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  department: string
  priority: string
  status: string
  message: string
  userEmail: string
  userName: string
  orderReference?: string
  assignedTo?: string
  assignedToUser?: {
    id: string
    name: string
    email: string
  }
  internalNotes?: string
  attachments?: {
    files: Array<{
      name: string
      size: number
      type: string
    }>
  }
  slaDueDate: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    createdAt: string
    lastLoginAt?: string
  }
  responses: Array<{
    id: string
    content: string
    isInternal: boolean
    attachments?: {
      files: Array<{
        name: string
        size: number
        type: string
      }>
    }
    createdAt: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }>
}

interface TicketDetailClientProps {
  ticketId: string
}

export default function TicketDetailClient({ ticketId }: TicketDetailClientProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ticket')
      }
      const data = await response.json()
      setTicket(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  const handleStatusChange = async (status: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status')
      }
      
      await fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update ticket priority')
      }
      
      await fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority')
    } finally {
      setUpdating(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!response.trim()) return

    try {
      setSubmitting(true)
      const responseData = await fetch(`/api/admin/tickets/${ticketId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: response,
          isInternal
        }),
      })
      
      if (!responseData.ok) {
        throw new Error('Failed to submit response')
      }
      
      setResponse('')
      setIsInternal(false)
      await fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Ticket not found'}</AlertDescription>
        </Alert>
        <Link href="/admin/tickets">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <Typography variant="h1" className="text-2xl font-bold">
              {ticket.ticketNumber}
            </Typography>
            <Typography variant="body" color="muted">
              {ticket.subject}
            </Typography>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isSLAOverdue(ticket.slaDueDate) && (
            <Badge variant="destructive">
              <Clock className="h-3 w-3 mr-1" />
              SLA Overdue
            </Badge>
          )}
          <Button onClick={fetchTicket} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Details</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  {getDepartmentBadge(ticket.department)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Typography variant="h4" className="font-semibold mb-2">Message</Typography>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <Typography variant="body">{ticket.message}</Typography>
                </div>
              </div>

              {ticket.attachments && ticket.attachments.files.length > 0 && (
                <div>
                  <Typography variant="h4" className="font-semibold mb-2">Attachments</Typography>
                  <div className="space-y-2">
                    {ticket.attachments.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticket.internalNotes && (
                <div>
                  <Typography variant="h4" className="font-semibold mb-2">Internal Notes</Typography>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <Typography variant="body">{ticket.internalNotes}</Typography>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Responses ({ticket.responses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <Typography variant="body">No responses yet</Typography>
                </div>
              ) : (
                ticket.responses.map((response) => (
                  <div key={response.id} className={`p-4 rounded-lg ${response.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Typography variant="body-sm" className="font-medium">
                          {response.user.name}
                        </Typography>
                        <Typography variant="body-sm" className="text-gray-500">
                          {response.user.email}
                        </Typography>
                        {response.isInternal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <Typography variant="body-sm" className="text-gray-500">
                        {new Date(response.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                    <Typography variant="body">{response.content}</Typography>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Add Response */}
          <Card>
            <CardHeader>
              <CardTitle>Add Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Type your response here..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  <Typography variant="body-sm">Internal note (not visible to customer)</Typography>
                </label>
              </div>

              <Button 
                onClick={handleSubmitResponse} 
                disabled={!response.trim() || submitting}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Response'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <Typography variant="body-sm" className="font-medium">{ticket.userName}</Typography>
                  <Typography variant="body-sm" className="text-gray-500">{ticket.userEmail}</Typography>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Typography variant="body-sm">
                  Joined: {new Date(ticket.user.createdAt).toLocaleDateString()}
                </Typography>
              </div>

              {ticket.user.lastLoginAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Typography variant="body-sm">
                    Last login: {new Date(ticket.user.lastLoginAt).toLocaleDateString()}
                  </Typography>
                </div>
              )}

              {ticket.orderReference && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Typography variant="body-sm">
                    Order: {ticket.orderReference}
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select 
                  value={ticket.status} 
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select 
                  value={ticket.priority} 
                  onValueChange={handlePriorityChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">SLA Due Date</label>
                <div className={`p-2 rounded ${isSLAOverdue(ticket.slaDueDate) ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                  <Typography variant="body-sm">
                    {new Date(ticket.slaDueDate).toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
