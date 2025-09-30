// src/app/api/admin/auth/route.ts
// Enhanced admin authentication API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const _ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Rate limiting check (simplified)
    // TODO: Implement proper rate limiting

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        lastLoginAt: true,
        loginAttempts: true,
        lockedUntil: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed attempts' },
        { status: 423 }
      )
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Verify password using bcrypt
    const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false

    if (!isValidPassword) {
      // Increment failed login attempts
      const newAttempts = (user.loginAttempts || 0) + 1
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: lockUntil
        }
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    // Log successful admin login
    console.log(`Admin login successful: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'users.view')
    if (guard) return guard

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    })

  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
