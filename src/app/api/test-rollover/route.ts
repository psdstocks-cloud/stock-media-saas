import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PointsManager } from '@/lib/points';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const userId = session.user.id;

    switch (action) {
      case 'create_rollover':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        // Create a rollover record that expires in 1 hour for testing
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const rolloverRecord = await prisma.rolloverRecord.create({
          data: {
            userId,
            amount,
            expiresAt,
          },
        });

        return NextResponse.json({
          success: true,
          rolloverRecord,
          message: `Created rollover record for ${amount} points expiring in 1 hour`,
        });

      case 'test_deduction':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        try {
          const balance = await PointsManager.deductPoints(
            userId,
            amount,
            'Test deduction with rollover priority'
          );

          return NextResponse.json({
            success: true,
            balance,
            message: `Successfully deducted ${amount} points (using rollover priority)`,
          });
        } catch (error) {
          return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to deduct points',
          }, { status: 400 });
        }

      case 'get_status':
        const [balance, rolloverRecords] = await Promise.all([
          PointsManager.getBalance(userId),
          PointsManager.getRolloverRecords(userId),
        ]);

        const totalRolloverPoints = rolloverRecords.reduce((sum, record) => sum + record.amount, 0);
        const totalAvailablePoints = (balance?.currentPoints || 0) + totalRolloverPoints;

        return NextResponse.json({
          success: true,
          balance,
          rolloverRecords,
          totalRolloverPoints,
          totalAvailablePoints,
          message: 'Current points status retrieved',
        });

      case 'add_points':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        const newBalance = await PointsManager.addPoints(
          userId,
          amount,
          'BONUS',
          'Test points added'
        );

        return NextResponse.json({
          success: true,
          balance: newBalance,
          message: `Added ${amount} points to balance`,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[TEST_ROLLOVER_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process test request' },
      { status: 500 }
    );
  }
}
