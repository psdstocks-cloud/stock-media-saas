import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPlatformSchema = z.object({
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
  website: z.string().url(),
  category: z.enum(['photos', 'videos', 'audio', 'graphics', 'icons', 'templates', '3d', 'mixed']),
  cost: z.number().min(1).max(1000),
  description: z.string().min(1).max(500),
  logo: z.string().optional(),
  logoSize: z.enum(['small', 'medium', 'large']).default('medium'),
  isActive: z.boolean().default(true),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DISABLED']).default('AVAILABLE')
})

const updatePlatformSchema = createPlatformSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    // Get platforms with pagination
    const [platforms, total] = await Promise.all([
      prisma.stockSite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { displayName: 'asc' }
      }),
      prisma.stockSite.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: platforms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching platforms:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPlatformSchema.parse(body)

    // Check if platform name already exists
    const existingPlatform = await prisma.stockSite.findUnique({
      where: { name: validatedData.name }
    })

    if (existingPlatform) {
      return NextResponse.json(
        { success: false, error: 'Platform with this name already exists' },
        { status: 400 }
      )
    }

    // Create platform
    const platform = await prisma.stockSite.create({
      data: {
        ...validatedData,
        lastStatusChange: new Date(),
        statusChangedBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: platform,
      message: 'Platform created successfully'
    })

  } catch (error) {
    console.error('Error creating platform:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create platform' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Platform ID is required' },
        { status: 400 }
      )
    }

    const validatedData = updatePlatformSchema.parse(updateData)

    // Check if platform exists
    const existingPlatform = await prisma.stockSite.findUnique({
      where: { id }
    })

    if (!existingPlatform) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      )
    }

    // Check if name is being changed and if new name already exists
    if (validatedData.name && validatedData.name !== existingPlatform.name) {
      const nameExists = await prisma.stockSite.findUnique({
        where: { name: validatedData.name }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Platform with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Update platform
    const updatedPlatform = await prisma.stockSite.update({
      where: { id },
      data: {
        ...validatedData,
        lastStatusChange: new Date(),
        statusChangedBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPlatform,
      message: 'Platform updated successfully'
    })

  } catch (error) {
    console.error('Error updating platform:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update platform' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Platform ID is required' },
        { status: 400 }
      )
    }

    // Check if platform exists
    const existingPlatform = await prisma.stockSite.findUnique({
      where: { id }
    })

    if (!existingPlatform) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      )
    }

    // Delete platform
    await prisma.stockSite.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Platform deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting platform:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete platform' },
      { status: 500 }
    )
  }
}
