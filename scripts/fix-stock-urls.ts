import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix existing orders to use proper stock site URLs instead of preview image URLs
 */
async function fixStockUrls() {
  console.log('🔧 Starting stock URL fix migration...')
  
  try {
    // Get all orders that have preview image URLs
    const orders = await prisma.order.findMany({
      where: {
        stockItemUrl: {
          contains: 'image.shutterstock.com'
        }
      },
      include: {
        stockSite: true
      }
    })
    
    console.log(`📊 Found ${orders.length} orders with preview image URLs`)
    
    for (const order of orders) {
      console.log(`\n🔍 Processing order ${order.id}:`)
      console.log(`   Current URL: ${order.stockItemUrl}`)
      console.log(`   Stock Site: ${order.stockSite.displayName}`)
      console.log(`   Stock Item ID: ${order.stockItemId}`)
      
      // Generate proper stock site URL based on the site and ID
      const properUrl = generateStockSiteUrl(order.stockSite.name, order.stockItemId)
      
      if (properUrl) {
        console.log(`   New URL: ${properUrl}`)
        
        // Update the order with the proper URL
        await prisma.order.update({
          where: { id: order.id },
          data: { stockItemUrl: properUrl }
        })
        
        console.log(`   ✅ Updated successfully`)
      } else {
        console.log(`   ⚠️  Could not generate proper URL for this site`)
      }
    }
    
    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Generate proper stock site URL based on site name and item ID
 */
function generateStockSiteUrl(siteName: string, itemId: string): string | null {
  const site = siteName.toLowerCase()
  
  switch (site) {
    case 'shutterstock':
      // Shutterstock URLs follow pattern: https://www.shutterstock.com/image-photo/description-{id}
      // For now, we'll use a generic format that should work
      return `https://www.shutterstock.com/image-photo/stock-photo-${itemId}`
    
    case 'getty':
    case 'gettyimages':
      return `https://www.gettyimages.com/detail/photo/${itemId}`
    
    case 'adobe':
    case 'adobestock':
      return `https://stock.adobe.com/images/${itemId}`
    
    case 'istock':
    case 'istockphoto':
      return `https://www.istockphoto.com/photo/${itemId}`
    
    case 'depositphotos':
      return `https://depositphotos.com/stock-photos/${itemId}.html`
    
    case 'freepik':
      return `https://www.freepik.com/free-photo/${itemId}`
    
    case 'vecteezy':
      return `https://www.vecteezy.com/photo/${itemId}`
    
    case 'rawpixel':
      return `https://www.rawpixel.com/image/${itemId}`
    
    case '123rf':
      return `https://www.123rf.com/photo_${itemId}.html`
    
    default:
      console.log(`   ⚠️  Unknown site: ${site}`)
      return null
  }
}

// Run the migration
fixStockUrls()
