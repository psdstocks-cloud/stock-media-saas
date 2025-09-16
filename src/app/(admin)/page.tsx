'use client';

import { useQuery } from '@tanstack/react-query';
import { KpiCard } from '@/components/admin/analytics/KpiCard';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, Users, CreditCard, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const { data: kpis, isLoading: isLoadingKpis, isError: isErrorKpis } = useQuery({
    queryKey: ['adminKpis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/kpis');
      if (!response.ok) throw new Error('Failed to fetch KPIs.');
      return response.json();
    },
  });

  const { data: chartData, isLoading: isLoadingChart, isError: isErrorChart } = useQuery({
    queryKey: ['adminRevenueChart'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/revenue-chart');
      if (!response.ok) throw new Error('Failed to fetch revenue data.');
      return response.json();
    },
  });
  
  if (isLoadingKpis || isLoadingChart) {
      return (
          <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <LoadingSkeleton className="h-32"/>
                  <LoadingSkeleton className="h-32"/>
                  <LoadingSkeleton className="h-32"/>
                  <LoadingSkeleton className="h-32"/>
              </div>
              <LoadingSkeleton className="h-96"/>
          </div>
      )
  }

  if (isErrorKpis || isErrorChart) {
      return <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load analytics data. Please try again later.</AlertDescription>
      </Alert>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`$${kpis?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
        />
        <KpiCard
          title="Active Subscriptions"
          value={`${kpis?.activeSubscriptionsCount || 0}`}
          icon={CreditCard}
        />
        <KpiCard
          title="New Users (30 Days)"
          value={`${kpis?.newUsersCount || 0}`}
          icon={UserPlus}
        />
        <KpiCard
            title="Total Users"
            value={`${kpis?.totalUsersCount || 0}`}
            icon={Users}
        />
      </div>
      <div className="grid gap-4">
          <RevenueChart data={chartData || []} />
      </div>
    </div>
  );
}
