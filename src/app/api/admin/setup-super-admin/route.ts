import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Super admin already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
        onboardingCompleted: true
      }
    })

    console.log('Super admin created:', superAdmin.email)

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role
      }
    })
  } catch (error) {
    console.error('Error creating super admin:', error)
    return NextResponse.json(
      { error: 'Failed to create super admin' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if super admin exists
    const superAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      exists: !!superAdmin,
      admin: superAdmin
    })
  } catch (error) {
    console.error('Error checking super admin:', error)
    return NextResponse.json(
      { error: 'Failed to check super admin status' },
      { status: 500 }
    )
  }
}
