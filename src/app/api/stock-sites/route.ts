import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const stockSites = await prisma.stockSite.findMany({
      where: { isActive: true },
      orderBy: { cost: 'asc' },
    })

    // Override all costs to 10 points as requested
    const sitesWithFixedCost = stockSites.map(site => ({
      ...site,
      cost: 10 // Fixed cost for all sites
    }))

    return NextResponse.json({ 
      success: true,
      sites: sitesWithFixedCost 
    })
  } catch (error) {
    console.error('Error fetching stock sites:', error)
    return NextResponse.json({ error: 'Failed to fetch stock sites' }, { status: 500 })
  }
}
