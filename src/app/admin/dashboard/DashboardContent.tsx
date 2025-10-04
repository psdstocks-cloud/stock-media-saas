'use client'

import { Typography } from '@/components/ui/typography'
import KPICards from '@/components/admin/KPICards'
import RevenueChart from '@/components/admin/RevenueChart'
import RecentOrdersList from '@/components/admin/RecentOrdersList'
import RecentUsersList from '@/components/admin/RecentUsersList'

export default function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <Typography variant="h2" className="text-2xl font-bold">
          Dashboard Overview
        </Typography>
        <Typography variant="body" color="muted" className="mt-2">
          Monitor your platform's key metrics and recent activity.
        </Typography>
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
