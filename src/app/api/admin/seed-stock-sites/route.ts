import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SUPPORTED_SITES } from '@/lib/supported-sites'

export async function POST(_request: NextRequest) {
  try {
    console.log('🌱 Starting stock sites seeding...')

    // Check if sites already exist
    const existingCount = await prisma.stockSite.count()
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing sites`)
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} stock sites`,
        count: existingCount
      })
    }

    // Clear existing stock sites (just in case)
    await prisma.stockSite.deleteMany({})
    console.log('🗑️  Cleared existing stock sites')

    // Create stock sites from supported sites data
    const stockSites = SUPPORTED_SITES.map(site => ({
      name: site.name,
      displayName: site.displayName,
      cost: site.cost,
      isActive: true,
      category: site.category,
      icon: `/assets/icons/${site.name}.svg`,
      status: 'AVAILABLE' as const,
      maintenanceMessage: null,
      lastStatusChange: new Date(),
      statusChangedBy: null
    }))

    // Insert all stock sites
    const createdSites = await prisma.stockSite.createMany({
      data: stockSites,
      skipDuplicates: true
    })

    console.log(`✅ Created ${createdSites.count} stock sites`)

    // Verify the data
    const totalSites = await prisma.stockSite.count()
    const availableSites = await prisma.stockSite.count({
      where: { status: 'AVAILABLE' }
    })

    console.log(`📊 Database stats:`)
    console.log(`   Total sites: ${totalSites}`)
    console.log(`   Available sites: ${availableSites}`)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdSites.count} stock sites`,
      count: createdSites.count,
      stats: {
        total: totalSites,
        available: availableSites,
        maintenance: await prisma.stockSite.count({ where: { status: 'MAINTENANCE' } }),
        disabled: await prisma.stockSite.count({ where: { status: 'DISABLED' } })
      }
    })

  } catch (error) {
    console.error('❌ Error seeding stock sites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed stock sites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
