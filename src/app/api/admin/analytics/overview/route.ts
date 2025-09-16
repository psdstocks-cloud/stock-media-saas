import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { subDays, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);
    const threeMonthsAgo = subMonths(today, 3);

    // Get all the data in parallel for better performance
    const [
      totalUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      activeSubscriptions,
      totalOrders,
      completedOrders,
      totalPointsInCirculation,
      pointsHistory,
      stockSites,
      recentOrders,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // New users in last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      
      // New users in last 7 days
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      
      // Active subscriptions
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          plan: { select: { name: true, price: true } },
          user: { select: { email: true, name: true } },
        },
      }),
      
      // Total orders
      prisma.order.count(),
      
      // Completed orders
      prisma.order.count({
        where: { status: { in: ['READY', 'COMPLETED'] } },
      }),
      
      // Points in circulation
      prisma.pointsBalance.aggregate({
        _sum: { currentPoints: true },
      }),
      
      // Points history for revenue calculation
      prisma.pointsHistory.findMany({
        where: {
          type: 'PURCHASE_PACK',
          amount: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      
      // Stock sites
      prisma.stockSite.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      
      // Recent orders
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { email: true, name: true } },
          stockSite: { select: { displayName: true } },
        },
      }),
    ]);

    // Calculate MRR from active subscriptions
    const mrr = activeSubscriptions.reduce((sum, sub) => sum + (sub.plan.price || 0), 0);

    // Calculate total revenue from point pack purchases
    const totalRevenue = pointsHistory.reduce((sum, purchase) => {
      return sum + (purchase.amount * 0.10); // $0.10 per point estimate
    }, 0);

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (completedOrders / totalUsers) * 100 : 0;

    // Calculate average order value
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Group orders by stock site
    const ordersBySite = stockSites.map(site => ({
      name: site.displayName,
      orders: site._count.orders,
      cost: site.cost,
    })).sort((a, b) => b.orders - a.orders);

    // Calculate user growth trend
    const userGrowthRate = totalUsers > 0 ? 
      ((newUsersLast30Days / totalUsers) * 100) : 0;

    // Get subscription plan distribution
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    const planDistribution = subscriptionPlans.map(plan => ({
      name: plan.name,
      price: plan.price,
      subscribers: plan._count.subscriptions,
      revenue: plan._count.subscriptions * plan.price,
    }));

    return NextResponse.json({
      summary: {
        totalUsers,
        newUsersLast30Days,
        newUsersLast7Days,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        activeSubscriptions: activeSubscriptions.length,
        mrr: Math.round(mrr * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        completedOrders,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalPointsInCirculation: totalPointsInCirculation._sum.currentPoints || 0,
      },
      charts: {
        ordersBySite: ordersBySite.slice(0, 10), // Top 10 sites
        planDistribution,
      },
      recentActivity: {
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          user: order.user.name || order.user.email,
          site: order.stockSite.displayName,
          cost: order.cost,
          status: order.status,
          createdAt: order.createdAt,
        })),
        recentPurchases: pointsHistory.slice(0, 5).map(purchase => ({
          amount: purchase.amount,
          description: purchase.description,
          createdAt: purchase.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('[ADMIN_ANALYTICS_OVERVIEW_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
