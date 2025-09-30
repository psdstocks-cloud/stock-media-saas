import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Get all users from the database
    const users = await prisma.user.findMany({
      include: { pointsBalance: true }
    });
    
    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        hasPointsBalance: !!user.pointsBalance,
        currentPoints: user.pointsBalance?.currentPoints || 0
      }))
    });
  } catch (error) {
    console.error('Test user error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to get users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
