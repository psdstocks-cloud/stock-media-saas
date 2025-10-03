import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt-auth';
import { subMonths, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('auth-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please log in again.' 
      }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        success: false,
        error: 'Insufficient permissions to view revenue data.' 
      }, { status: 403 });
    }
    const twelveMonthsAgo = subMonths(new Date(), 12);

    // Get point pack purchases (one-time revenue)
    const pointPackPurchases = await prisma.pointsHistory.findMany({
      where: {
        type: 'PURCHASE_PACK',
        amount: { gt: 0 },
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Get subscription payments (recurring revenue)
    const subscriptionPayments = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: twelveMonthsAgo },
      },
      include: {
        plan: {
          select: {
            price: true,
          },
        },
      },
    });

    // Initialize monthly data structure
    const monthlyData: { [key: string]: { month: string; subscriptions: number; pointPacks: number } } = {};

    // Process point pack purchases
    for (const purchase of pointPackPurchases) {
      const month = format(purchase.createdAt, 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, subscriptions: 0, pointPacks: 0 };
      }
      // Estimate revenue: 1 point = $0.10 USD
      const estimatedRevenue = purchase.amount * 0.10;
      monthlyData[month].pointPacks += estimatedRevenue;
    }

    // Process subscription payments
    for (const subscription of subscriptionPayments) {
      const month = format(subscription.createdAt, 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, subscriptions: 0, pointPacks: 0 };
      }
      monthlyData[month].subscriptions += subscription.plan.price || 0;
    }

    // Ensure all 12 months are present, even if they have 0 revenue
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, subscriptions: 0, pointPacks: 0 };
      }
    }
    
    // Sort the data chronologically (oldest first)
    const sortedData = Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });

    // Round all values to 2 decimal places
    sortedData.forEach(month => {
      month.subscriptions = Math.round(month.subscriptions * 100) / 100;
      month.pointPacks = Math.round(month.pointPacks * 100) / 100;
    });

    return NextResponse.json({
      success: true,
      data: sortedData.map(item => ({
        date: item.month,
        revenue: item.subscriptions + item.pointPacks,
        orders: Math.floor(Math.random() * 20) + 5 // Placeholder order count
      }))
    });
  } catch (error) {
    console.error('[ADMIN_REVENUE_CHART_GET]', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error. Please try again later.' 
    }, { status: 500 });
  }
}
