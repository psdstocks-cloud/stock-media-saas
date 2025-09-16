'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  TrendingUp,
  Activity,
  ShoppingCart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { KpiCard } from '@/components/admin/analytics/KpiCard';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

interface KPIData {
  totalRevenue: number;
  mrr: number;
  newUsersCount: number;
  activeSubscriptionsCount: number;
  totalUsersCount: number;
  totalPointsInCirculation: number;
  totalPointsPurchased: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  conversionRate: number;
}

interface RevenueData {
  month: string;
  subscriptions: number;
  pointPacks: number;
}

interface OverviewData {
  summary: {
    totalUsers: number;
    newUsersLast30Days: number;
    newUsersLast7Days: number;
    userGrowthRate: number;
    activeSubscriptions: number;
    mrr: number;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    conversionRate: number;
    averageOrderValue: number;
    totalPointsInCirculation: number;
  };
  charts: {
    ordersBySite: Array<{
      name: string;
      orders: number;
      cost: number;
    }>;
    planDistribution: Array<{
      name: string;
      price: number;
      subscribers: number;
      revenue: number;
    }>;
  };
  recentActivity: {
    recentOrders: Array<{
      id: string;
      user: string;
      site: string;
      cost: number;
      status: string;
      createdAt: string;
    }>;
    recentPurchases: Array<{
      amount: number;
      description: string;
      createdAt: string;
    }>;
  };
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  // Fetch KPIs data
  const { data: kpiData, isLoading: kpiLoading } = useQuery<KPIData>({
    queryKey: ['admin-kpis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/kpis');
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch revenue chart data
  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/revenue-chart');
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery<OverviewData>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/overview');
      if (!response.ok) throw new Error('Failed to fetch overview data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Revenue"
              value={`$${kpiData?.totalRevenue?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              description="All-time revenue"
            />
            <KpiCard
              title="Monthly Recurring Revenue"
              value={`$${kpiData?.mrr?.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
              description="Active subscriptions"
            />
            <KpiCard
              title="Total Users"
              value={kpiData?.totalUsersCount?.toString() || '0'}
              icon={Users}
              description="Registered users"
            />
            <KpiCard
              title="Active Subscriptions"
              value={kpiData?.activeSubscriptionsCount?.toString() || '0'}
              icon={CreditCard}
              description="Currently active"
            />
          </div>

          {/* Additional KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="New Users (30d)"
              value={kpiData?.newUsersCount?.toString() || '0'}
              icon={Users}
              description="Last 30 days"
            />
            <KpiCard
              title="Total Orders"
              value={kpiData?.totalOrdersCount?.toString() || '0'}
              icon={ShoppingCart}
              description="All orders"
            />
            <KpiCard
              title="Conversion Rate"
              value={`${kpiData?.conversionRate?.toFixed(2) || '0.00'}%`}
              icon={BarChart3}
              description="Orders per user"
            />
            <KpiCard
              title="Points in Circulation"
              value={kpiData?.totalPointsInCirculation?.toLocaleString() || '0'}
              icon={Activity}
              description="Available points"
            />
          </div>

          {/* Revenue Chart */}
          <div className="grid gap-4 md:grid-cols-1">
            {revenueLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[350px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <RevenueChart data={revenueData || []} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4">
            <RevenueChart data={revenueData || []} />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Users</span>
                    <span className="text-2xl font-bold">{overviewData?.summary.totalUsers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Users (30d)</span>
                    <span className="text-lg font-semibold">{overviewData?.summary.newUsersLast30Days || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Users (7d)</span>
                    <span className="text-lg font-semibold">{overviewData?.summary.newUsersLast7Days || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className="text-lg font-semibold">{overviewData?.summary.userGrowthRate?.toFixed(2) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.charts.planDistribution?.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{plan.name}</span>
                        <p className="text-xs text-muted-foreground">${plan.price}/month</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold">{plan.subscribers}</span>
                        <p className="text-xs text-muted-foreground">${plan.revenue.toFixed(2)}/month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.recentActivity.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{order.user}</span>
                        <p className="text-xs text-muted-foreground">{order.site}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{order.cost} pts</span>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.recentActivity.recentPurchases?.map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{purchase.amount} points</span>
                        <p className="text-xs text-muted-foreground">{purchase.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
