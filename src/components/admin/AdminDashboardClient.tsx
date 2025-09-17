'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { KpiCard } from '@/components/admin/analytics/KpiCard';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign, Users, CreditCard, UserPlus, Package, PackageCheck } from 'lucide-react';

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
};

export function AdminDashboardClient() {
  // Fetch KPIs data
  const { data: kpisData, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['adminKpis'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/kpis');
      if (!res.ok) throw new Error('Failed to fetch KPIs');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch revenue chart data
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['adminRevenueChart'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/revenue-chart');
      if (!res.ok) throw new Error('Failed to fetch revenue data');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch overview data
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/overview');
      if (!res.ok) throw new Error('Failed to fetch overview data');
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (kpisLoading || revenueLoading || overviewLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (kpisError || revenueError || overviewError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const kpis = kpisData || {};
  const revenue = revenueData || { monthlyRevenue: [], totalRevenue: 0 };
  const overview = overviewData || {};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Comprehensive insights into your StockMedia Pro platform performance
          </p>
        </div>
      </motion.div>

      {/* KPIs Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`$${kpis.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          description="All-time platform revenue"
          trend={kpis.revenueChange ? {
            value: Math.abs(kpis.revenueChange),
            label: "vs last month",
            isPositive: kpis.revenueChange > 0
          } : undefined}
        />
        <KpiCard
          title="Monthly Recurring Revenue"
          value={`$${kpis.mrr?.toLocaleString() || '0'}`}
          icon={CreditCard}
          description="Current monthly subscriptions"
          trend={kpis.mrrChange ? {
            value: Math.abs(kpis.mrrChange),
            label: "vs last month",
            isPositive: kpis.mrrChange > 0
          } : undefined}
        />
        <KpiCard
          title="Total Users"
          value={kpis.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          description="Registered users"
          trend={kpis.usersChange ? {
            value: Math.abs(kpis.usersChange),
            label: "vs last month",
            isPositive: kpis.usersChange > 0
          } : undefined}
        />
        <KpiCard
          title="Active Subscriptions"
          value={kpis.activeSubscriptions?.toLocaleString() || '0'}
          icon={Package}
          description="Currently active plans"
          trend={kpis.subscriptionsChange ? {
            value: Math.abs(kpis.subscriptionsChange),
            label: "vs last month",
            isPositive: kpis.subscriptionsChange > 0
          } : undefined}
        />
      </motion.div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants}>
        <RevenueChart data={revenue.monthlyRevenue} />
      </motion.div>

      {/* Additional Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <KpiCard
          title="New Users This Month"
          value={overview.newUsersThisMonth?.toLocaleString() || '0'}
          icon={UserPlus}
          description="Users who joined this month"
          trend={overview.newUsersChange ? {
            value: Math.abs(overview.newUsersChange),
            label: "vs last month",
            isPositive: overview.newUsersChange > 0
          } : undefined}
        />
        <KpiCard
          title="Total Orders"
          value={overview.totalOrders?.toLocaleString() || '0'}
          icon={PackageCheck}
          description="All-time downloads"
          trend={overview.ordersChange ? {
            value: Math.abs(overview.ordersChange),
            label: "vs last month",
            isPositive: overview.ordersChange > 0
          } : undefined}
        />
        <KpiCard
          title="Conversion Rate"
          value={`${overview.conversionRate?.toFixed(1) || '0'}%`}
          icon={DollarSign}
          description="Trial to paid conversion"
          trend={overview.conversionChange ? {
            value: Math.abs(overview.conversionChange),
            label: "vs last month",
            isPositive: overview.conversionChange > 0
          } : undefined}
        />
      </motion.div>

      {/* Real-time Updates Indicator */}
      <motion.div variants={itemVariants} className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live data • Updates every 30 seconds</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
