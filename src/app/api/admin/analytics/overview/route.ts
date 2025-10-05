import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if database is available
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not set, returning mock data')
    return NextResponse.json({
      summary: generateMockOverviewData(),
      charts: generateMockChartsData(),
      recentActivity: generateMockActivityData()
    })
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);
    const _threeMonthsAgo = subMonths(today, 3);

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

// Mock data generators for build time
function generateMockOverviewData() {
  return {
    totalUsers: 150,
    newUsersLast30Days: 25,
    newUsersLast7Days: 8,
    userGrowthRate: 16.67,
    activeSubscriptions: 45,
    mrr: 1250.00,
    totalRevenue: 8750.00,
    totalOrders: 500,
    completedOrders: 450,
    conversionRate: 75.0,
    averageOrderValue: 19.44,
    totalPointsInCirculation: 25000
  }
}

function generateMockChartsData() {
  return {
    ordersBySite: [
      { name: 'Shutterstock', orders: 150, cost: 5 },
      { name: 'Getty Images', orders: 120, cost: 8 },
      { name: 'Adobe Stock', orders: 100, cost: 6 },
      { name: 'Unsplash', orders: 80, cost: 3 },
      { name: 'Pexels', orders: 50, cost: 2 }
    ],
    planDistribution: [
      { name: 'Basic', price: 9.99, subscribers: 20, revenue: 199.80 },
      { name: 'Pro', price: 19.99, subscribers: 15, revenue: 299.85 },
      { name: 'Enterprise', price: 49.99, subscribers: 10, revenue: 499.90 }
    ]
  }
}

function generateMockActivityData() {
  return {
    recentOrders: [
      {
        id: 'order-1',
        user: 'john@example.com',
        site: 'Shutterstock',
        cost: 5,
        status: 'COMPLETED',
        createdAt: new Date()
      },
      {
        id: 'order-2',
        user: 'jane@example.com',
        site: 'Getty Images',
        cost: 8,
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 3600000)
      }
    ],
    recentPurchases: [
      {
        amount: 100,
        description: 'Point Pack Purchase',
        createdAt: new Date()
      },
      {
        amount: 50,
        description: 'Point Pack Purchase',
        createdAt: new Date(Date.now() - 7200000)
      }
    ]
  }
}
