import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create more accurate Shutterstock URLs
 * Based on the pattern: https://www.shutterstock.com/image-photo/{description}-{id}
 */
async function createAccurateShutterstockUrls() {
  console.log('🔧 Creating accurate Shutterstock URLs...')
  
  try {
    // Get all Shutterstock orders
    const orders = await prisma.order.findMany({
      where: {
        stockSite: {
          name: 'shutterstock'
        }
      },
      include: {
        stockSite: true
      }
    })
    
    console.log(`📊 Found ${orders.length} Shutterstock orders`)
    
    for (const order of orders) {
      console.log(`\n🔍 Processing order ${order.id}:`)
      console.log(`   Current URL: ${order.stockItemUrl}`)
      console.log(`   Stock Item ID: ${order.stockItemId}`)
      
      // Create a more accurate Shutterstock URL
      // The format is: https://www.shutterstock.com/image-photo/{description}-{id}
      // We'll use a generic description that should work for most cases
      const improvedUrl = `https://www.shutterstock.com/image-photo/stock-photo-${order.stockItemId}`
      
      console.log(`   Improved URL: ${improvedUrl}`)
      
      // Update the order with the improved URL
      await prisma.order.update({
        where: { id: order.id },
        data: { stockItemUrl: improvedUrl }
      })
      
      console.log(`   ✅ Updated successfully`)
    }
    
    console.log('\n🎉 Accurate Shutterstock URL creation completed!')
    
  } catch (error) {
    console.error('❌ Creation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the creation
createAccurateShutterstockUrls()
