import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Platforms GET API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const platforms = await prisma.stockSite.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('✅ Platforms retrieved:', platforms.length)

    return NextResponse.json({
      success: true,
      data: platforms
    })
  } catch (error) {
    console.error('❌ Platforms GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Platforms POST API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, displayName, category, cost, isActive } = body

    const platform = await prisma.stockSite.create({
      data: {
        name,
        displayName: displayName || name,
        category: category || 'other',
        cost: cost || 1.0,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    console.log('✅ Platform created:', platform.name)

    return NextResponse.json({
      success: true,
      data: platform
    })
  } catch (error) {
    console.error('❌ Platform creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create platform' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Platforms PUT API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, displayName, category, cost, isActive } = body

    const platform = await prisma.stockSite.update({
      where: { id },
      data: {
        name,
        displayName: displayName || name,
        category: category || 'other',
        cost: cost || 1.0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      }
    })

    console.log('✅ Platform updated:', platform.name)

    return NextResponse.json({
      success: true,
      data: platform
    })
  } catch (error) {
    console.error('❌ Platform update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update platform' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Platforms DELETE API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Platform ID required' },
        { status: 400 }
      )
    }

    await prisma.stockSite.delete({
      where: { id }
    })

    console.log('✅ Platform deleted:', id)

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('❌ Platform deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete platform' },
      { status: 500 }
    )
  }
}