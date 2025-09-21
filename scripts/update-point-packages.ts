import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePointPackages() {
  try {
    console.log('Updating point packages to match frontend expectations...')
    
    // Clear existing packages
    await prisma.pointPack.deleteMany()
    console.log('✅ Cleared existing packages')
    
    // Create packages that match the frontend
    const packages = [
      {
        name: 'Starter Pack',
        points: 50,
        price: 9.99,
        description: 'Perfect for getting started',
        stripePriceId: 'price_starter_virtual',
        isActive: true
      },
      {
        name: 'Professional Pack',
        points: 500,
        price: 0, // Free for testing
        description: 'Most popular choice',
        stripePriceId: 'price_professional_virtual',
        isActive: true
      },
      {
        name: 'Business Pack',
        points: 1000,
        price: 49.99,
        description: 'For business use',
        stripePriceId: 'price_business_virtual',
        isActive: true
      }
    ]
    
    for (const pkg of packages) {
      await prisma.pointPack.create({ data: pkg })
      console.log(`✅ Created: ${pkg.name} (${pkg.points} points, $${pkg.price})`)
    }
    
    console.log('\n📋 Current point packages:')
    const allPackages = await prisma.pointPack.findMany()
    allPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.id}): ${pkg.points} points - $${pkg.price}`)
    })
    
  } catch (error) {
    console.error('Error updating point packages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePointPackages()
