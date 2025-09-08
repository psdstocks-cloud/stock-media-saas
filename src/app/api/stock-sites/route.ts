import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const stockSites = await prisma.stockSite.findMany({
      where: { isActive: true },
      orderBy: { cost: 'asc' },
    })

    return NextResponse.json({ stockSites })
  } catch (error) {
    console.error('Error fetching stock sites:', error)
    return NextResponse.json({ error: 'Failed to fetch stock sites' }, { status: 500 })
  }
}
