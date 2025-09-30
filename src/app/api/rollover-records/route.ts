import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { RolloverRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rolloverRecords = await prisma.rolloverRecord.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        expiresAt: 'asc', // Show earliest expiring first
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(rolloverRecords as RolloverRecord[]);
  } catch (error) {
    console.error('[ROLLOVER_RECORDS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch rollover records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, expiresAt } = await request.json();

    if (!amount || !expiresAt) {
      return NextResponse.json(
        { error: 'Amount and expiresAt are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const rolloverRecord = await prisma.rolloverRecord.create({
      data: {
        userId: session.user.id,
        amount,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json(rolloverRecord as RolloverRecord, { status: 201 });
  } catch (error) {
    console.error('[ROLLOVER_RECORDS_CREATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create rollover record' },
      { status: 500 }
    );
  }
}
