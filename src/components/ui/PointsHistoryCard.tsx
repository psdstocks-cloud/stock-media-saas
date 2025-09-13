'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  CreditCard, 
  Gift, 
  RotateCcw, 
  Shield, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface PointsHistoryEntry {
  id: string
  type: 'SUBSCRIPTION' | 'PURCHASE' | 'ROLLOVER' | 'DOWNLOAD' | 'REFUND' | 'BONUS' | 'ADMIN_ADJUSTMENT'
  amount: number
  description: string | null
  createdAt: string
  createdAtISO: string
  order: {
    id: string
    title: string | null
    stockItemId: string
    stockItemUrl: string | null
    status: string
    stockSite: {
      displayName: string
      name: string
    }
  } | null
}

interface PointsHistoryData {
  history: PointsHistoryEntry[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  summary: {
    totalTransactions: number
    netAmount: number
    typeBreakdown: Array<{
      type: string
      count: number
      totalAmount: number
    }>
  }
  timezone: string
  generatedAt: string
}

interface PointsHistoryCardProps {
  userId: string
  timezone?: string
}

export function PointsHistoryCard({ userId, timezone = 'UTC' }: PointsHistoryCardProps) {
  const [data, setData] = useState<PointsHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchHistory = async (newFilters = filters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: newFilters.page.toString(),
        limit: newFilters.limit.toString(),
        timezone
      })

      if (newFilters.type) params.append('type', newFilters.type)
      if (newFilters.startDate) params.append('startDate', newFilters.startDate)
      if (newFilters.endDate) params.append('endDate', newFilters.endDate)

      const response = await fetch(`/api/points/history?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch points history')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching points history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION': return <CreditCard size={16} />
      case 'PURCHASE': return <CreditCard size={16} />
      case 'ROLLOVER': return <RotateCcw size={16} />
      case 'DOWNLOAD': return <Download size={16} />
      case 'REFUND': return <RotateCcw size={16} />
      case 'BONUS': return <Gift size={16} />
      case 'ADMIN_ADJUSTMENT': return <Shield size={16} />
      default: return <Zap size={16} />
    }
  }

  const getTypeColor = (type: string, amount: number) => {
    const isPositive = amount > 0
    switch (type) {
      case 'SUBSCRIPTION':
      case 'PURCHASE':
      case 'BONUS':
        return isPositive ? { color: '#16a34a', background: '#f0fdf4' } : { color: '#dc2626', background: '#fef2f2' }
      case 'DOWNLOAD':
        return { color: '#2563eb', background: '#eff6ff' }
      case 'REFUND':
        return { color: '#7c3aed', background: '#faf5ff' }
      case 'ROLLOVER':
        return { color: '#d97706', background: '#fffbeb' }
      case 'ADMIN_ADJUSTMENT':
        return { color: '#6b7280', background: '#f9fafb' }
      default:
        return isPositive ? { color: '#16a34a', background: '#f0fdf4' } : { color: '#dc2626', background: '#fef2f2' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={14} style={{ color: '#10b981' }} />
      case 'PROCESSING': return <Loader2 size={14} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      case 'FAILED': return <XCircle size={14} style={{ color: '#ef4444' }} />
      case 'PENDING': return <Clock size={14} style={{ color: '#f59e0b' }} />
      default: return <AlertCircle size={14} style={{ color: '#6b7280' }} />
    }
  }

  const formatAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : ''
    return `${sign}${amount.toLocaleString()} pts`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleFilterChange = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    fetchHistory(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchHistory(newFilters)
  }

  const filteredHistory = data?.history.filter(entry => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      entry.description?.toLowerCase().includes(searchLower) ||
      entry.order?.title?.toLowerCase().includes(searchLower) ||
      entry.order?.stockSite?.displayName.toLowerCase().includes(searchLower) ||
      entry.type.toLowerCase().includes(searchLower)
    )
  }) || []

  if (loading && !data) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        padding: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '256px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Loading points history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        padding: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '256px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button
              onClick={() => fetchHistory()}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3b82f6'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        padding: '24px 32px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Zap size={28} style={{ color: '#3b82f6' }} />
              Points Usage History
            </h3>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '16px'
            }}>
              Track your points transactions and download history
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white'
              }}
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Search transactions, orders, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">All Types</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="PURCHASE">Purchase</option>
              <option value="DOWNLOAD">Download</option>
              <option value="REFUND">Refund</option>
              <option value="BONUS">Bonus</option>
              <option value="ROLLOVER">Rollover</option>
              <option value="ADMIN_ADJUSTMENT">Admin Adjustment</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />

            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div style={{
          padding: '24px 32px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '4px'
              }}>
                {data.summary.totalTransactions.toLocaleString()}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Total Transactions
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: data.summary.netAmount >= 0 ? '#16a34a' : '#dc2626',
                marginBottom: '4px'
              }}>
                {formatAmount(data.summary.netAmount)}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Net Points
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#3b82f6',
                marginBottom: '4px'
              }}>
                {timezone}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Timezone
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div style={{ borderTop: '1px solid #e2e8f0' }}>
        {filteredHistory.length === 0 ? (
          <div style={{
            padding: '48px 32px',
            textAlign: 'center'
          }}>
            <Calendar size={48} style={{ color: '#d1d5db', margin: '0 auto 16px auto' }} />
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              No transactions found
            </h4>
            <p style={{
              color: '#64748b',
              margin: 0
            }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No points transactions yet'}
            </p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const typeColors = getTypeColor(entry.type, entry.amount)
            return (
              <div key={entry.id} style={{
                padding: '24px 32px',
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      color: typeColors.color,
                      background: typeColors.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getTypeIcon(entry.type)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: 0,
                          textTransform: 'capitalize'
                        }}>
                          {entry.type.replace('_', ' ').toLowerCase()}
                        </h4>
                        {entry.order && getStatusIcon(entry.order.status)}
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0 0 8px 0'
                      }}>
                        {entry.description || 'No description available'}
                      </p>

                      {entry.order && (
                        <div style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <p style={{
                                fontWeight: '600',
                                color: '#1e40af',
                                margin: '0 0 4px 0',
                                fontSize: '14px'
                              }}>
                                {entry.order.title || `Order #${entry.order.id.slice(-8)}`}
                              </p>
                              <p style={{
                                fontSize: '12px',
                                color: '#1d4ed8',
                                margin: 0
                              }}>
                                {entry.order.stockSite.displayName} • {entry.order.stockItemId}
                              </p>
                            </div>
                            {entry.order.stockItemUrl && (
                              <a
                                href={entry.order.stockItemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb' }}
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: entry.amount > 0 ? '#16a34a' : '#dc2626',
                      marginBottom: '4px'
                    }}>
                      {formatAmount(entry.amount)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {entry.amount > 0 ? 'Added' : 'Deducted'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div style={{
          padding: '24px 32px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of{' '}
              {data.pagination.totalCount} transactions
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={!data.pagination.hasPrevPage}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: data.pagination.hasPrevPage ? 'white' : '#f9fafb',
                  color: data.pagination.hasPrevPage ? '#374151' : '#9ca3af',
                  cursor: data.pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (data.pagination.hasPrevPage) {
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseOut={(e) => {
                  if (data.pagination.hasPrevPage) {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                Previous
              </button>
              
              <span style={{
                padding: '8px 12px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={!data.pagination.hasNextPage}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: data.pagination.hasNextPage ? 'white' : '#f9fafb',
                  color: data.pagination.hasNextPage ? '#374151' : '#9ca3af',
                  cursor: data.pagination.hasNextPage ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (data.pagination.hasNextPage) {
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseOut={(e) => {
                  if (data.pagination.hasNextPage) {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}