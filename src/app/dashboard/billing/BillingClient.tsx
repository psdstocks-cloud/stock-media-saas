'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft,
  Download,
  Upload,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'

interface Transaction {
  id: string
  type: 'PURCHASE' | 'USAGE' | 'ROLLOVER' | 'BONUS'
  amount: number
  description: string
  createdAt: string
  balanceAfter?: number
}

interface BillingSummary {
  totalPurchased: number
  totalUsed: number
  currentBalance: number
  transactionCount: number
  monthlySpend: number
}

export default function BillingClient() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/points/history')
      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      setError('Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Download className="h-4 w-4 text-green-500" />
      case 'USAGE':
        return <Upload className="h-4 w-4 text-red-500" />
      case 'ROLLOVER':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'BONUS':
        return <CreditCard className="h-4 w-4 text-purple-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Badge variant="success" className="bg-green-100 text-green-800">Purchase</Badge>
      case 'USAGE':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Usage</Badge>
      case 'ROLLOVER':
        return <Badge variant="info" className="bg-blue-100 text-blue-800">Rollover</Badge>
      case 'BONUS':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Bonus</Badge>
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(row.getValue('type'))}
          {getTransactionBadge(row.getValue('type'))}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Typography variant="body" className="text-gray-900">
          {row.getValue('description')}
        </Typography>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        const type = row.original.type
        return (
          <Typography 
            variant="body" 
            className={`font-semibold ${
              type === 'PURCHASE' || type === 'ROLLOVER' || type === 'BONUS'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {type === 'PURCHASE' || type === 'ROLLOVER' || type === 'BONUS' ? '+' : '-'}
            {Math.abs(amount).toLocaleString()} points
          </Typography>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <Typography variant="body" className="text-gray-600">
          {formatDate(row.getValue('createdAt'))}
        </Typography>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <Typography variant="h1" className="text-white text-3xl font-bold">
            Billing & Transaction History
          </Typography>
          <Typography variant="body" className="text-white/70">
            Track your point purchases, usage, and account activity
          </Typography>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <Typography variant="body" className="text-red-200">
                {error}
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Typography variant="caption" className="text-white/60">
                    Total Purchased
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {summary.totalPurchased.toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <Typography variant="caption" className="text-white/60">
                    Total Used
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {summary.totalUsed.toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Typography variant="caption" className="text-white/60">
                    Current Balance
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {summary.currentBalance.toLocaleString()}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <Typography variant="caption" className="text-white/60">
                    Transactions
                  </Typography>
                  <Typography variant="h4" className="text-white font-bold">
                    {summary.transactionCount}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <Button
              onClick={fetchBillingData}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <Typography variant="h5" className="text-white mb-2">
                No transactions yet
              </Typography>
              <Typography variant="body" className="text-white/60">
                Your transaction history will appear here once you start using the platform.
              </Typography>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              isLoading={isLoading}
              searchKey="description"
              filterOptions={[]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
