'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Flag, Check, X, Clock } from 'lucide-react'

interface ApprovalRequest {
  id: string
  type: string
  description: string
  requestedBy: string
  requestedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

export default function ApprovalsManagement() {
  const [approvals] = useState<ApprovalRequest[]>([
    {
      id: '1',
      type: 'User Registration',
      description: 'New user registration for john.doe@example.com',
      requestedBy: 'System',
      requestedAt: '2024-01-15T10:30:00Z',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      id: '2',
      type: 'Order Refund',
      description: 'Refund request for order #12345 - $25.00',
      requestedBy: 'Customer Service',
      requestedAt: '2024-01-15T09:15:00Z',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: '3',
      type: 'Feature Request',
      description: 'Add support for new file format: SVG',
      requestedBy: 'Development Team',
      requestedAt: '2024-01-14T16:45:00Z',
      status: 'APPROVED',
      priority: 'LOW'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = (id: string) => {
    console.log('Approving request:', id)
    // Implement approval logic
  }

  const handleReject = (id: string) => {
    console.log('Rejecting request:', id)
    // Implement rejection logic
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-2xl font-bold">
            Approvals Management
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Review and approve pending requests
          </Typography>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <Typography variant="h3" className="text-2xl font-bold">
                  {approvals.filter(a => a.status === 'PENDING').length}
                </Typography>
                <Typography variant="body" color="muted">
                  Pending Requests
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <Typography variant="h3" className="text-2xl font-bold">
                  {approvals.filter(a => a.status === 'APPROVED').length}
                </Typography>
                <Typography variant="body" color="muted">
                  Approved Today
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <Typography variant="h3" className="text-2xl font-bold">
                  {approvals.filter(a => a.status === 'REJECTED').length}
                </Typography>
                <Typography variant="body" color="muted">
                  Rejected Today
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Pending Approvals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Typography variant="h4" className="text-lg font-semibold">
                        {approval.type}
                      </Typography>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(approval.status)}`}>
                        {approval.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                        {approval.priority}
                      </span>
                    </div>
                    <Typography variant="body" color="muted" className="mb-2">
                      {approval.description}
                    </Typography>
                    <div className="text-sm text-gray-500">
                      Requested by: {approval.requestedBy} • {new Date(approval.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  {approval.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(approval.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
