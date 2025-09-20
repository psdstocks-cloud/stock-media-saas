import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('Test login API called')
    const { email, password } = await request.json()
    
    console.log('Test login attempt:', { email })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    })

    if (!user) {
      console.log('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.password) {
      console.log('No password set')
      return NextResponse.json({ error: 'No password set' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValid)

    if (!isValid) {
      console.log('Invalid password')
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    console.log('Login successful:', { userId: user.id, role: user.role })

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
    console.error('Test login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
