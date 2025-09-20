import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email is required',
        available: false 
      }, { status: 400 })
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address',
        available: false 
      }, { status: 400 })
    }

    // Check if email exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { 
        id: true, 
        email: true,
        accounts: {
          select: { provider: true }
        }
      }
    })

    if (existingUser) {
      // Email is already taken
      const hasOAuthAccounts = existingUser.accounts.length > 0
      const providers = existingUser.accounts.map(acc => acc.provider).join(', ')
      
      return NextResponse.json({
        available: false,
        message: hasOAuthAccounts 
          ? `An account with this email already exists. Please sign in using ${providers} or reset your password if you forgot it.`
          : 'An account with this email already exists. Please sign in or reset your password if you forgot it.',
        hasOAuthAccounts,
        providers: existingUser.accounts.map(acc => acc.provider)
      })
    }

    // Email is available
    return NextResponse.json({
      available: true,
      message: 'Email is available'
    })

  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ 
      error: 'Unable to check email availability',
      available: false 
    }, { status: 500 })
  }
}
