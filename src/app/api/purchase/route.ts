import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mediaId, mediaType, points, price } = body

    if (!mediaId || !mediaType || points === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: mediaId, mediaType, points' 
      }, { status: 400 })
    }

    // Get user's current points balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        pointsBalance: {
          select: { currentPoints: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentPoints = user.pointsBalance?.currentPoints || 0

    // Check if user has enough points
    if (currentPoints < points) {
      return NextResponse.json({ 
        error: 'Insufficient points',
        details: {
          required: points,
          available: currentPoints,
          shortfall: points - currentPoints
        }
      }, { status: 400 })
    }

    // Create the purchase record
    const purchase = await prisma.$transaction(async (tx) => {
      // Update user's points balance
      await tx.pointsBalance.update({
        where: { userId: session.user.id },
        data: { 
          currentPoints: { decrement: points },
          totalUsed: { increment: points }
        }
      })

      // Get a default stock site (we'll use the first one for now)
      const stockSite = await tx.stockSite.findFirst()
      if (!stockSite) {
        throw new Error('No stock sites available')
      }

      // Create order record
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          stockSiteId: stockSite.id,
          stockItemId: mediaId,
          stockItemUrl: `https://example.com/media/${mediaId}`,
          imageUrl: `https://example.com/thumbnails/${mediaId}.jpg`,
          title: `Media ${mediaId}`,
          cost: points,
          status: 'COMPLETED',
          downloadUrl: `https://example.com/downloads/${mediaId}`,
          fileName: `media-${mediaId}.${mediaType === 'photo' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`,
          fileSize: 2500000 // 2.5MB in bytes
        }
      })

      // Create points history record
      const pointsHistory = await tx.pointsHistory.create({
        data: {
          userId: session.user.id,
          orderId: order.id,
          type: 'PURCHASE',
          amount: -points, // Negative because points are being used
          description: `Purchased ${mediaType} - ${mediaId}`
        }
      })

      return { order, pointsHistory }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Purchase completed successfully',
      data: {
        orderId: purchase.order.id,
        downloadUrl: purchase.order.downloadUrl,
        fileName: purchase.order.fileName,
        remainingPoints: currentPoints - points
      }
    })

  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ 
      error: 'Purchase failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
