import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    // 1. Total Revenue (calculated from point pack purchases and subscription payments)
    // We'll estimate revenue based on point pack purchases and subscription plans
    const pointPackPurchases = await prisma.pointsHistory.findMany({
      where: {
        type: 'PURCHASE_PACK',
        amount: { gt: 0 }, // Only positive amounts (purchases)
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Calculate total revenue from point pack purchases
    // We need to map points to estimated revenue (this is an approximation)
    // For now, we'll use a rough estimate: 1 point = $0.10 USD
    const estimatedRevenuePerPoint = 0.10;
    const totalPointPackRevenue = pointPackPurchases.reduce((sum, purchase) => {
      return sum + (purchase.amount * estimatedRevenuePerPoint);
    }, 0);

    // 2. Monthly Recurring Revenue (MRR) - from active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        plan: {
          select: {
            price: true,
          },
        },
      },
    });

    const mrr = activeSubscriptions.reduce((sum, subscription) => {
      return sum + (subscription.plan.price || 0);
    }, 0);

    // 3. New Users in the last 30 days
    const newUsersCount = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // 4. Active Subscriptions
    const activeSubscriptionsCount = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });
    
    // 5. Total Users
    const totalUsersCount = await prisma.user.count();

    // 6. Additional KPIs for better insights
    const totalPointsInCirculation = await prisma.pointsBalance.aggregate({
      _sum: { currentPoints: true },
    });

    const totalPointsPurchased = await prisma.pointsBalance.aggregate({
      _sum: { totalPurchased: true },
    });

    const totalOrdersCount = await prisma.order.count();

    const completedOrdersCount = await prisma.order.count({
      where: { status: { in: ['READY', 'COMPLETED'] } },
    });

    return NextResponse.json({
      totalRevenue: Math.round(totalPointPackRevenue * 100) / 100, // Round to 2 decimal places
      mrr: Math.round(mrr * 100) / 100,
      newUsersCount,
      activeSubscriptionsCount,
      totalUsersCount,
      totalPointsInCirculation: totalPointsInCirculation._sum.currentPoints || 0,
      totalPointsPurchased: totalPointsPurchased._sum.totalPurchased || 0,
      totalOrdersCount,
      completedOrdersCount,
      conversionRate: totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalUsersCount) * 100) / 100 : 0,
    });
  } catch (error) {
    console.error('[ADMIN_KPIS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
