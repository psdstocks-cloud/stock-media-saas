import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/jwt-auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pointPackageId } = await request.json()
    
    if (!pointPackageId) {
      return NextResponse.json({ error: 'Point package ID is required' }, { status: 400 })
    }

    // Find the point package
    const pointPackage = await prisma.pointPack.findUnique({
      where: { id: pointPackageId }
    })

    if (!pointPackage) {
      return NextResponse.json({ error: 'Point package not found' }, { status: 404 })
    }

    // Get user's current balance
    const userBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })

    if (!userBalance) {
      return NextResponse.json({ error: 'User balance not found' }, { status: 404 })
    }

    // Add points to user's account
    const newBalance = userBalance.currentPoints + pointPackage.points
    
    await prisma.pointsBalance.update({
      where: { userId: user.id },
      data: {
        currentPoints: newBalance,
        totalPurchased: userBalance.totalPurchased + pointPackage.points
      }
    })

    // Record the transaction in points history
    await prisma.pointsHistory.create({
      data: {
        userId: user.id,
        type: 'PURCHASE',
        amount: pointPackage.points,
        description: `Virtual purchase: ${pointPackage.name}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully added ${pointPackage.points} points to your account`,
      newBalance,
      pointPackage: {
        id: pointPackage.id,
        name: pointPackage.name,
        points: pointPackage.points
      }
    })

  } catch (error) {
    console.error('Virtual purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
