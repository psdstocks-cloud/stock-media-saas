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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LoadingSkeleton className="h-32"/>
          <LoadingSkeleton className="h-32"/>
          <LoadingSkeleton className="h-32"/>
          <LoadingSkeleton className="h-32"/>
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <LoadingSkeleton className="lg:col-span-4 h-96"/>
            <LoadingSkeleton className="lg:col-span-3 h-96"/>
        </div>
      </div>
  )
  }
    
  if (isErrorKpis || isErrorChart) {
    return (
      <div className="p-8 pt-6">
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load analytics data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <motion.div 
      className="flex-1 space-y-4 p-8 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={`$${kpis?.totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <KpiCard title="MRR" value={`$${kpis?.mrr.toFixed(2)}`} icon={CreditCard} />
        <KpiCard title="New Users (30d)" value={`+${kpis?.newUsersCount}`} icon={UserPlus} />
        <KpiCard title="Active Subs" value={`${kpis?.activeSubscriptionsCount}`} icon={Users} />
      </motion.div>
      <motion.div variants={itemVariants} className="grid auto-rows-fr gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-3">
             <RevenueChart data={chartData || []} />
        </div>
        <div className="space-y-4 xl:col-span-2">
            <KpiCard title="Total Orders" value={kpis?.totalOrdersCount} icon={Package} />
            <KpiCard title="Completed Orders" value={kpis?.completedOrdersCount} icon={PackageCheck} />
        </div>
      </motion.div>
    </motion.div>
    );
  }
