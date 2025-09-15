import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@stockmedia.com'
      }
    })

    return NextResponse.json({
      exists: !!adminUser,
      user: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      } : null
    })
  } catch (error) {
    console.error('Error checking admin user:', error)
    return NextResponse.json({ error: 'Failed to check admin user' }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create admin user if it doesn't exist
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'admin@stockmedia.com'
      }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'Admin user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminSecure2024!', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@stockmedia.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}
