'use client'

import React from 'react'
import { Typography } from '@/components/ui/typography'
import { RefreshCw } from 'lucide-react'
import KPICards from '@/components/admin/KPICards'
import RevenueChart from '@/components/admin/RevenueChart'
import RecentOrdersList from '@/components/admin/RecentOrdersList'
import RecentUsersList from '@/components/admin/RecentUsersList'

export default function AdminDashboardClient() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Comprehensive overview of your Stock Media SaaS platform performance and metrics
          </Typography>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersList />
        <RecentUsersList />
      </div>
    </div>
  )
}
