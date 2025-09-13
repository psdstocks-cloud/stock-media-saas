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
        return isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      case 'DOWNLOAD':
        return 'text-blue-600 bg-blue-50'
      case 'REFUND':
        return 'text-purple-600 bg-purple-50'
      case 'ROLLOVER':
        return 'text-amber-600 bg-amber-50'
      case 'ADMIN_ADJUSTMENT':
        return 'text-gray-600 bg-gray-50'
      default:
        return isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={14} className="text-green-500" />
      case 'PROCESSING': return <Loader2 size={14} className="text-blue-500 animate-spin" />
      case 'FAILED': return <XCircle size={14} className="text-red-500" />
      case 'PENDING': return <Clock size={14} className="text-amber-500" />
      default: return <AlertCircle size={14} className="text-gray-500" />
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-gray-500">Loading points history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchHistory()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="text-blue-500" size={28} />
              Points Usage History
            </h3>
            <p className="text-gray-600 mt-1">
              Track your points transactions and download history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions, orders, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {data.summary.totalTransactions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${data.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(data.summary.netAmount)}
              </div>
              <div className="text-sm text-gray-600">Net Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {timezone}
              </div>
              <div className="text-sm text-gray-600">Timezone</div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="divide-y divide-gray-100">
        {filteredHistory.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h4>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No points transactions yet'}
            </p>
          </div>
        ) : (
          filteredHistory.map((entry) => (
            <div key={entry.id} className="px-8 py-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(entry.type, entry.amount)}`}>
                    {getTypeIcon(entry.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {entry.type.replace('_', ' ').toLowerCase()}
                      </h4>
                      {entry.order && getStatusIcon(entry.order.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {entry.description || 'No description available'}
                    </p>

                    {entry.order && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              {entry.order.title || `Order #${entry.order.id.slice(-8)}`}
                            </p>
                            <p className="text-sm text-blue-700">
                              {entry.order.stockSite.displayName} • {entry.order.stockItemId}
                            </p>
                          </div>
                          {entry.order.stockItemUrl && (
                            <a
                              href={entry.order.stockItemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(entry.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.amount > 0 ? 'Added' : 'Deducted'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of{' '}
              {data.pagination.totalCount} transactions
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={!data.pagination.hasPrevPage}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={!data.pagination.hasNextPage}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
