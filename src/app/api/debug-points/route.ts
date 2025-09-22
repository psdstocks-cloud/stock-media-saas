import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'
import { PointsManager } from '@/lib/points'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG POINTS API ===')
    
    // Try JWT authentication first
    const jwtUser = getUserFromRequest(request)
    console.log('JWT User:', jwtUser)
    
    if (!jwtUser?.id) {
      return NextResponse.json({ 
        error: 'No JWT user found',
        debug: {
          jwtUser,
          cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
        }
      }, { status: 401 })
    }

    // Get points balance
    const balance = await PointsManager.getBalance(jwtUser.id)
    console.log('Points Balance:', balance)

    return NextResponse.json({ 
      success: true,
      debug: {
        userId: jwtUser.id,
        userEmail: jwtUser.email,
        balance,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Debug points error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
