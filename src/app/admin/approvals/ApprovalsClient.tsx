'use client'

import { useEffect, useState, useCallback } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckSquare, Clock, RefreshCw, Shield } from 'lucide-react'
import { ThemedIcon } from '@/components/admin/ThemedIcon'

interface Approval {
  id: string
  type: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED'
  requestedBy: string
  data: Record<string, any>
  createdAt: string
  approvedBy?: string | null
  approvedAt?: string | null
}

export default function ApprovalsClient() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED'>('PENDING')
  const [retryCount, setRetryCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent state updates after unmount
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  const loadApprovals = useCallback(async () => {
    if (!isMounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading approvals for status:', selectedTab)
      
      const response = await fetch(`/api/admin/approvals?status=${selectedTab}`, {
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
      console.log('✅ Approvals loaded:', data)
      
      if (isMounted) {
        setApprovals(data.approvals || [])
      }
      
    } catch (err) {
      console.error('❌ Load approvals error:', err)
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Failed to load approvals')
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [selectedTab, isMounted])

  useEffect(() => {
    loadApprovals()
  }, [loadApprovals])

  const handleApprovalAction = async (id: string, action: 'approve' | 'reject') => {
    if (!isMounted) return
    
    try {
      console.log(`🔄 ${action}ing approval:`, id)
      
      const response = await fetch(`/api/admin/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        console.log(`✅ Approval ${action}ed successfully`)
        loadApprovals() // Refresh the list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} approval`)
      }
    } catch (error) {
      console.error(`❌ ${action} error:`, error)
      if (isMounted) {
        alert(`Failed to ${action} approval: ${error}`)
      }
    }
  }

  const handleRetry = () => {
    if (!isMounted) return
    setRetryCount(prev => prev + 1)
    loadApprovals()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      case 'EXECUTED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POINTS_ADJUSTMENT': return '💰'
      case 'ORDER_REFUND': return '↩️'
      case 'USER_SUSPENSION': return '🚫'
      default: return '📋'
    }
  }

  // Don't render anything if component is unmounted
  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ThemedIcon 
            icon={CheckSquare}
            className="h-8 w-8" 
            style={{ color: 'var(--admin-accent)' }}
          />
          <div>
            <Typography 
              variant="h1" 
              className="text-2xl font-bold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Dual-Control Approvals
            </Typography>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Review and approve high-risk administrative actions
            </Typography>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRetry} 
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--admin-text-primary)',
              borderColor: 'var(--admin-border)'
            }}
          >
            <ThemedIcon 
              icon={RefreshCw}
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--admin-text-primary)' }}
            />
            Refresh {retryCount > 0 && `(${retryCount})`}
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div 
        className="flex space-x-1 p-1 rounded-lg w-fit"
        style={{ backgroundColor: 'var(--admin-bg-secondary)' }}
      >
        {(['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setSelectedTab(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedTab === status
                ? 'shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: selectedTab === status ? 'var(--admin-bg-card)' : 'transparent',
              color: selectedTab === status ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)',
              border: selectedTab === status ? '1px solid var(--admin-border)' : '1px solid transparent'
            }}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <Card
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <Typography 
                variant="body"
                style={{ color: 'var(--admin-text-secondary)' }}
              >
                Loading approvals...
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card 
          className="border-red-200 bg-red-50"
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <Typography 
                    variant="h3" 
                    className="text-red-700 font-semibold"
                  >
                    Failed to load approvals
                  </Typography>
                  <Typography 
                    variant="body" 
                    className="text-red-600 text-sm mt-1"
                  >
                    {error}
                  </Typography>
                </div>
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <ThemedIcon 
                  icon={RefreshCw}
                  className="h-4 w-4 mr-2"
                  style={{ color: '#DC2626' }}
                />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && approvals.length === 0 && (
        <Card
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ThemedIcon 
              icon={CheckSquare}
              className="h-16 w-16 mb-4"
              style={{ color: 'var(--admin-text-muted)' }}
            />
            <Typography 
              variant="h3" 
              className="font-semibold mb-2"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              No {selectedTab.toLowerCase()} approvals
            </Typography>
            <Typography 
              variant="body" 
              className="text-center"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              {selectedTab === 'PENDING' 
                ? 'All caught up! No pending approvals require your attention.'
                : `No approvals with ${selectedTab.toLowerCase()} status found.`
              }
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Approvals List */}
      {!loading && !error && approvals.length > 0 && (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card 
              key={approval.id} 
              className="transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--admin-bg-card)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(approval.type)}</div>
                    <div>
                      <CardTitle 
                        className="text-lg font-semibold"
                        style={{ color: 'var(--admin-text-primary)' }}
                      >
                        {approval.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                      <CardDescription style={{ color: 'var(--admin-text-secondary)' }}>
                        Requested by {approval.requestedBy} • {new Date(approval.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`border ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Approval Details */}
                  <div 
                    className="rounded-lg p-3"
                    style={{ backgroundColor: 'var(--admin-bg-secondary)' }}
                  >
                    <Typography 
                      variant="body" 
                      className="text-sm font-medium mb-2"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      Request Details:
                    </Typography>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--admin-text-secondary)' }}
                    >
                      {Object.entries(approval.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {approval.status === 'PENDING' && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        onClick={() => handleApprovalAction(approval.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        onClick={() => handleApprovalAction(approval.id, 'reject')}
                        variant="destructive"
                        size="sm"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  )}

                  {/* Approval Info */}
                  {approval.approvedBy && (
                    <div 
                      className="text-xs pt-2 border-t"
                      style={{ 
                        color: 'var(--admin-text-muted)',
                        borderColor: 'var(--admin-border)'
                      }}
                    >
                      {approval.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {approval.approvedBy} 
                      {approval.approvedAt && ` on ${new Date(approval.approvedAt).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
