import { PrismaClient } from '@prisma/client'
import { SUPPORTED_SITES } from '../src/lib/supported-sites'

// Use local development database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function seedStockSites() {
  console.log('🌱 Seeding stock sites with status management...')

  try {
    // Clear existing stock sites
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
    console.log(`   Maintenance sites: ${await prisma.stockSite.count({ where: { status: 'MAINTENANCE' } })}`)
    console.log(`   Disabled sites: ${await prisma.stockSite.count({ where: { status: 'DISABLED' } })}`)

    console.log('🎉 Stock sites seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding stock sites:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedStockSites()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
