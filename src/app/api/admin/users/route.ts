import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) {
      where.role = role
    }
    if (status) {
      if (status === 'active') {
        where.lastLoginAt = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      } else if (status === 'inactive') {
        where.OR = [
          { lastLoginAt: null },
          { lastLoginAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      } else if (status === 'locked') {
        where.lockedUntil = {
          gt: new Date()
        }
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else if (sortBy === 'role') {
      orderBy.role = sortOrder
    } else if (sortBy === 'lastLoginAt') {
      orderBy.lastLoginAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          pointsBalance: true,
          subscriptions: {
            include: { plan: true },
          },
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, role, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updateData: any = {}
    if (role) updateData.role = role
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        pointsBalance: true,
        subscriptions: {
          include: { plan: true },
        },
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
