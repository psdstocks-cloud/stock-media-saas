import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security measure)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting point rollover processing...');

    // Get all active subscriptions that need rollover processing
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lte: new Date(), // Period has ended
        },
      },
      include: {
        user: true,
        plan: true,
      },
    });

    console.log(`📊 Found ${activeSubscriptions.length} subscriptions to process`);

    let processedCount = 0;
    let totalRolloverPoints = 0;

    for (const subscription of activeSubscriptions) {
      try {
        // Get user's current points balance
        const pointsBalance = await prisma.pointsBalance.findUnique({
          where: { userId: subscription.userId },
        });

        const currentPoints = pointsBalance?.currentPoints || 0;
        const monthlyPoints = subscription.plan.points;
        const rolloverLimit = subscription.plan.rolloverLimit; // Percentage (0-100)
        
        // Calculate how many points can rollover
        const maxRolloverPoints = Math.floor((monthlyPoints * rolloverLimit) / 100);
        const pointsToRollover = Math.min(currentPoints, maxRolloverPoints);

        if (pointsToRollover > 0) {
          // Create rollover record
          const expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + 2); // Expires in 2 months

          await prisma.rolloverRecord.create({
            data: {
              userId: subscription.userId,
              amount: pointsToRollover,
              expiresAt: expirationDate,
            },
          });

          // Update points balance (subtract rolled-over points)
          await prisma.pointsBalance.upsert({
            where: { userId: subscription.userId },
            update: {
              currentPoints: currentPoints - pointsToRollover,
              lastRollover: new Date(),
            },
            create: {
              userId: subscription.userId,
              currentPoints: monthlyPoints - pointsToRollover,
              totalPurchased: monthlyPoints,
              lastRollover: new Date(),
            },
          });

          // Add points history record
          await prisma.pointsHistory.create({
            data: {
              userId: subscription.userId,
              type: 'ROLLOVER',
              amount: -pointsToRollover,
              description: `${pointsToRollover} points rolled over (expires ${expirationDate.toLocaleDateString()})`,
            },
          });

          // Add new monthly points
          await prisma.pointsBalance.upsert({
            where: { userId: subscription.userId },
            update: {
              currentPoints: { increment: monthlyPoints },
              totalPurchased: { increment: monthlyPoints },
            },
            create: {
              userId: subscription.userId,
              currentPoints: monthlyPoints,
              totalPurchased: monthlyPoints,
            },
          });

          // Add points history for new monthly points
          await prisma.pointsHistory.create({
            data: {
              userId: subscription.userId,
              type: 'MONTHLY_ALLOCATION',
              amount: monthlyPoints,
              description: `Monthly allocation from ${subscription.plan.name}`,
            },
          });

          // Update subscription period
          const newPeriodStart = new Date();
          const newPeriodEnd = new Date();
          newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              currentPeriodStart: newPeriodStart,
              currentPeriodEnd: newPeriodEnd,
            },
          });

          processedCount++;
          totalRolloverPoints += pointsToRollover;

          console.log(`✅ Processed rollover for user ${subscription.user.email}: ${pointsToRollover} points rolled over`);
        } else {
          // Just add new monthly points without rollover
          await prisma.pointsBalance.upsert({
            where: { userId: subscription.userId },
            update: {
              currentPoints: { increment: monthlyPoints },
              totalPurchased: { increment: monthlyPoints },
            },
            create: {
              userId: subscription.userId,
              currentPoints: monthlyPoints,
              totalPurchased: monthlyPoints,
            },
          });

          // Add points history for new monthly points
          await prisma.pointsHistory.create({
            data: {
              userId: subscription.userId,
              type: 'MONTHLY_ALLOCATION',
              amount: monthlyPoints,
              description: `Monthly allocation from ${subscription.plan.name}`,
            },
          });

          // Update subscription period
          const newPeriodStart = new Date();
          const newPeriodEnd = new Date();
          newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              currentPeriodStart: newPeriodStart,
              currentPeriodEnd: newPeriodEnd,
            },
          });

          processedCount++;

          console.log(`✅ Processed monthly allocation for user ${subscription.user.email}: ${monthlyPoints} points allocated`);
        }
      } catch (error) {
        console.error(`❌ Error processing rollover for user ${subscription.user.email}:`, error);
        // Continue with next subscription
      }
    }

    console.log(`🎉 Rollover processing complete: ${processedCount} subscriptions processed, ${totalRolloverPoints} total points rolled over`);

    return NextResponse.json({
      success: true,
      processedCount,
      totalRolloverPoints,
      message: `Successfully processed ${processedCount} subscriptions`,
    });
  } catch (error) {
    console.error('[ROLLOVER_PROCESSING_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process rollovers' },
      { status: 500 }
    );
  }
}
