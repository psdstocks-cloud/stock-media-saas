import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      include: {
        stockSite: true
      }
    })
    
    console.log('Sample orders:')
    orders.forEach(order => {
      console.log({
        id: order.id,
        stockItemId: order.stockItemId,
        stockItemUrl: order.stockItemUrl,
        imageUrl: order.imageUrl,
        title: order.title,
        site: order.stockSite.name
      })
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders()
