import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-user"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        pointsBalance: {
          select: {
            currentPoints: true,
            totalPurchased: true,
            totalUsed: true,
            lastRollover: true
          }
        },
        subscriptions: {
          include: {
            plan: {
              select: {
                name: true,
                price: true,
                points: true
              }
            }
          },
          where: {
            status: 'ACTIVE'
          }
        }
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, currentPassword, newPassword } = await request.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const updateData: any = {
      name,
      email,
      updatedAt: new Date()
    }

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required to change password' }, { status: 400 })
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!user?.password || !await bcrypt.compare(currentPassword, user.password)) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required for account deletion' }, { status: 400 })
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user?.password || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
