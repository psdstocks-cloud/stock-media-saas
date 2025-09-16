import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PointPack } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pointPacks = await prisma.pointPack.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc', // Order by price ascending (cheapest first)
      },
    });

    return NextResponse.json(pointPacks as PointPack[]);
  } catch (error) {
    console.error('[POINT_PACKS_ERROR]', error);
    return NextResponse.json(
      { message: 'Failed to fetch point packs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, points, stripePriceId } = body;

    // Validate required fields
    if (!name || !price || !points || !stripePriceId) {
      return NextResponse.json(
        { message: 'Missing required fields: name, price, points, stripePriceId' },
        { status: 400 }
      );
    }

    // Validate price and points are positive
    if (price <= 0 || points <= 0) {
      return NextResponse.json(
        { message: 'Price and points must be positive numbers' },
        { status: 400 }
      );
    }

    const pointPack = await prisma.pointPack.create({
      data: {
        name,
        description: description || null,
        price,
        points,
        stripePriceId,
        isActive: true,
      },
    });

    return NextResponse.json(pointPack as PointPack, { status: 201 });
  } catch (error) {
    console.error('[POINT_PACKS_CREATE_ERROR]', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'A point pack with this name or Stripe price ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create point pack' },
      { status: 500 }
    );
  }
}
