import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Final fix for Shutterstock URLs
 * Create URLs that will work and redirect to the correct Shutterstock page
 */
async function finalShutterstockUrlFix() {
  console.log('🔧 Final Shutterstock URL fix...')
  
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
      
      // Create a Shutterstock search URL that will find the image
      // This approach uses the search functionality which is more reliable
      const searchUrl = `https://www.shutterstock.com/search/${order.stockItemId}`
      
      console.log(`   Search URL: ${searchUrl}`)
      
      // Update the order with the search URL
      await prisma.order.update({
        where: { id: order.id },
        data: { stockItemUrl: searchUrl }
      })
      
      console.log(`   ✅ Updated successfully`)
    }
    
    console.log('\n🎉 Final Shutterstock URL fix completed!')
    console.log('📝 Note: URLs now point to Shutterstock search results for the specific image ID')
    console.log('   This ensures users can find and access the original image on Shutterstock')
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
finalShutterstockUrlFix()
