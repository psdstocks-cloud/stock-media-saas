import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Public Website Status API called')
    
    // Get all stock sites with their status (public endpoint)
    const stockSites = await prisma.stockSite.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        status: true,
        maintenanceMessage: true,
        lastStatusChange: true
      },
      orderBy: {
        displayName: 'asc'
      }
    })

    console.log('🌐 Found', stockSites.length, 'stock sites for public')

    return NextResponse.json({
      success: true,
      data: stockSites
    })
  } catch (error) {
    console.error('❌ Public Website Status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch website status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
