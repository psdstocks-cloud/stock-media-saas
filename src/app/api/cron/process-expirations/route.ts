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

    console.log('⏰ Starting point expiration processing...');

    // Get all rollover records that have expired
    const expiredRecords = await prisma.rolloverRecord.findMany({
      where: {
        expiresAt: {
          lte: new Date(), // Expired records
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`📊 Found ${expiredRecords.length} expired rollover records`);

    let processedCount = 0;
    let totalExpiredPoints = 0;

    for (const record of expiredRecords) {
      try {
        // Add points history record for expiration
        await prisma.pointsHistory.create({
          data: {
            userId: record.userId,
            type: 'ROLLOVER_EXPIRED',
            amount: -record.amount,
            description: `${record.amount} rolled-over points expired`,
          },
        });

        // Delete the expired record
        await prisma.rolloverRecord.delete({
          where: { id: record.id },
        });

        processedCount++;
        totalExpiredPoints += record.amount;

        console.log(`✅ Processed expiration for user ${record.user.email}: ${record.amount} points expired`);
      } catch (error) {
        console.error(`❌ Error processing expiration for user ${record.user.email}:`, error);
        // Continue with next record
      }
    }

    console.log(`🎉 Expiration processing complete: ${processedCount} records processed, ${totalExpiredPoints} total points expired`);

    return NextResponse.json({
      success: true,
      processedCount,
      totalExpiredPoints,
      message: `Successfully processed ${processedCount} expired records`,
    });
  } catch (error) {
    console.error('[EXPIRATION_PROCESSING_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process expirations' },
      { status: 500 }
    );
  }
}
