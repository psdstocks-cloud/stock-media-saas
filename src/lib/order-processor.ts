import { prisma } from './prisma'
import { OrderManager } from './nehtw-api'

export class OrderProcessor {
  /**
   * Process pending orders
   */
  static async processPendingOrders() {
    try {
      // Get all pending orders
      const pendingOrders = await prisma.order.findMany({
        where: { status: 'PENDING' },
        include: { stockSite: true, user: true },
        take: 10, // Process 10 orders at a time
      })

      for (const order of pendingOrders) {
        try {
          // Get user's API key
          const apiKey = await prisma.apiKey.findFirst({
            where: { 
              userId: order.userId,
              isActive: true 
            },
            orderBy: { createdAt: 'desc' },
          })

          if (!apiKey) {
            console.error(`No API key found for user ${order.userId}`)
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'FAILED' },
            })
            continue
          }

          // Process the order
          await OrderManager.processOrder(
            order.id,
            apiKey.key,
            order.stockSite.name,
            order.stockItemId,
            order.stockItemUrl || undefined
          )

          console.log(`Order ${order.id} processed successfully`)
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error)
          
          // Mark order as failed and refund points
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' },
          })
        }
      }
    } catch (error) {
      console.error('Error processing pending orders:', error)
    }
  }

  /**
   * Check status of processing orders
   */
  static async checkProcessingOrders() {
    try {
      const processingOrders = await prisma.order.findMany({
        where: { status: 'PROCESSING' },
        include: { stockSite: true, user: true },
        take: 20, // Check 20 orders at a time
      })

      for (const order of processingOrders) {
        try {
          if (!order.taskId) continue

          // Get user's API key
          const apiKey = await prisma.apiKey.findFirst({
            where: { 
              userId: order.userId,
              isActive: true 
            },
            orderBy: { createdAt: 'desc' },
          })

          if (!apiKey) {
            console.error(`No API key found for user ${order.userId}`)
            continue
          }

          // Check order status
          await OrderManager.checkOrderStatus(order.id, apiKey.key)
        } catch (error) {
          console.error(`Error checking order ${order.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error checking processing orders:', error)
    }
  }

  /**
   * Clean up old completed orders (older than 30 days)
   */
  static async cleanupOldOrders() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const result = await prisma.order.deleteMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: thirtyDaysAgo,
          },
        },
      })

      console.log(`Cleaned up ${result.count} old orders`)
    } catch (error) {
      console.error('Error cleaning up old orders:', error)
    }
  }
}
