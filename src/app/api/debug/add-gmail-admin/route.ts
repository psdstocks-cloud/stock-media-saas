import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'psdstockspay@gmail.com'
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Update existing user to SUPER_ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { 
          role: 'SUPER_ADMIN',
          name: 'PSD Stocks Admin'
        }
      })

      return NextResponse.json({
        message: 'User updated to SUPER_ADMIN role',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          wasExisting: true
        }
      })
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('AdminSecure2024!', 12)

    const adminUser = await prisma.user.create({
      data: {
        email,
        name: 'PSD Stocks Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    })

    return NextResponse.json({
      message: 'Gmail admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        wasExisting: false
      }
    })
  } catch (error) {
    console.error('Error creating/updating Gmail admin user:', error)
    return NextResponse.json({ 
      error: 'Failed to create/update Gmail admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
