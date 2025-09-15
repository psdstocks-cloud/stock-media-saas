import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Fetching all verification tokens...')
    
    // Get all verification tokens
    const tokens = await prisma.verificationToken.findMany({
      orderBy: { expires: 'desc' },
      take: 10 // Get the 10 most recent
    })

    // Get count of total tokens
    const totalCount = await prisma.verificationToken.count()

    // Get tokens that are not expired
    const activeTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          gt: new Date()
        }
      },
      orderBy: { expires: 'desc' }
    })

    console.log('🔍 Verification tokens found:', {
      total: totalCount,
      active: activeTokens.length,
      recent: tokens.length
    })

    return NextResponse.json({
      success: true,
      data: {
        totalTokens: totalCount,
        activeTokens: activeTokens.length,
        recentTokens: tokens.map(token => ({
          identifier: token.identifier,
          token: `${token.token.substring(0, 10)}...`,
          expires: token.expires,
          isExpired: new Date() > token.expires,
          timeUntilExpiry: Math.round((token.expires.getTime() - new Date().getTime()) / 1000 / 60)
        }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching verification tokens:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 DEBUG: Clearing all verification tokens...')
    
    // Delete all verification tokens (for testing)
    const result = await prisma.verificationToken.deleteMany({})
    
    console.log('🧹 Cleared verification tokens:', result.count)
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} verification tokens`,
      count: result.count,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error clearing verification tokens:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
