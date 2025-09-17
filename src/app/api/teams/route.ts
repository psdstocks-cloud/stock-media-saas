import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Get user's teams (owned and member of)
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        pointsBalance: true
      }
    });

    return NextResponse.json(userTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return new NextResponse('Team name must be at least 2 characters', { status: 400 });
    }

    // Create team with owner as first member
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN'
          }
        },
        pointsBalance: {
          create: {
            currentPoints: 0,
            totalPurchased: 0,
            totalUsed: 0
          }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        pointsBalance: true
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
