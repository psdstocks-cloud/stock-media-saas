import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    console.log('🌐 Public Website Status API called')
    
    // Get all stock sites with their status (public endpoint)
    const stockSites = await prisma.stockSite.findMany({
      select: {
        name: true,
        displayName: true,
        status: true,
        maintenanceMessage: true,
        lastStatusChange: true,
        category: true
      },
      where: {
        isActive: true // Only show active sites
      },
      orderBy: {
        displayName: 'asc'
      }
    })

    console.log('🌐 Found', stockSites.length, 'active stock sites')

    return NextResponse.json({
      success: true,
      data: stockSites
    })
  } catch (error) {
    console.error('❌ Website Status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch website status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}