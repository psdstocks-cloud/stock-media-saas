import { prisma } from './prisma'
import { NehtwAPI } from './nehtw-api'

export interface OrderStatusUpdate {
  orderId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
  fileName?: string
  progress?: number
  message?: string
}

export class OrderProcessor {
  private static processingOrders = new Map<string, NodeJS.Timeout>()
  private static statusCallbacks = new Map<string, (update: OrderStatusUpdate) => void>()

  /**
   * Start processing an order with real-time status updates
   */
  static async startProcessing(
    orderId: string, 
    apiKey: string, 
    site: string, 
    id: string, 
    url?: string
  ): Promise<void> {
    console.log('Starting order processing:', { orderId, site, id })
    
    // Update order status to PROCESSING
    await this.updateOrderStatus(orderId, 'PROCESSING', 'Starting download process...')
    
    // Start the processing loop (don't await to avoid blocking)
    this.processOrderWithStatus(orderId, apiKey, site, id, url).catch(error => {
      console.error('Order processing failed:', error)
    })
  }

  /**
   * Process order with real-time status updates
   */
  private static async processOrderWithStatus(
    orderId: string,
    apiKey: string,
    site: string,
    id: string,
    url?: string
  ): Promise<void> {
    try {
      const api = new NehtwAPI(apiKey)
      
      // Step 1: Place order
      await this.updateOrderStatus(orderId, 'PROCESSING', 'Placing order with download service...')
      const orderResponse = await api.placeOrder(site, id, url)
      
      if (!orderResponse.success || !orderResponse.task_id) {
        throw new Error(orderResponse.message || 'Failed to place order')
      }

      // Step 2: Monitor order status
      await this.updateOrderStatus(orderId, 'PROCESSING', 'Order placed, monitoring progress...')
      await this.monitorOrderStatus(orderId, api, orderResponse.task_id)
      
    } catch (error) {
      console.error('Order processing failed:', error)
      await this.updateOrderStatus(
        orderId, 
        'FAILED', 
        `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Monitor order status with periodic checks
   */
  private static async monitorOrderStatus(
    orderId: string,
    api: NehtwAPI,
    taskId: string
  ): Promise<void> {
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max (30 * 10 seconds)
    
    const checkStatus = async (): Promise<void> => {
      try {
        attempts++
        console.log(`Checking order status, attempt ${attempts}/${maxAttempts}`)
        
        const statusResponse = await api.checkOrderStatus(taskId)
        
        if (statusResponse.success && statusResponse.status === 'ready' && statusResponse.downloadLink) {
          // Order completed successfully
          await this.updateOrderStatus(
            orderId,
            'COMPLETED',
            'Download ready!',
            statusResponse.downloadLink,
            statusResponse.fileName
          )
          return
        }
        
        if (statusResponse.error) {
          throw new Error(statusResponse.message || 'Order processing failed')
        }
        
        // Still processing
        const progress = Math.min((attempts / maxAttempts) * 100, 95)
        await this.updateOrderStatus(
          orderId,
          'PROCESSING',
          `Processing... ${Math.round(progress)}% complete`,
          undefined,
          undefined,
          Math.round(progress)
        )
        
        // Schedule next check
        if (attempts < maxAttempts) {
          const timeout = setTimeout(checkStatus, 10000) // Check every 10 seconds
          this.processingOrders.set(orderId, timeout)
        } else {
          throw new Error('Order processing timeout')
        }
        
      } catch (error) {
        console.error('Status check failed:', error)
        await this.updateOrderStatus(
          orderId,
          'FAILED',
          `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
    
    // Start monitoring
    checkStatus()
  }

  /**
   * Update order status in database and notify callbacks
   */
  private static async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    message?: string,
    downloadUrl?: string,
    fileName?: string,
    progress?: number
  ): Promise<void> {
    try {
      // Update database
      const updateData: any = { status }
      if (downloadUrl) updateData.downloadUrl = downloadUrl
      if (fileName) updateData.fileName = fileName
      
      await prisma.order.update({
        where: { id: orderId },
        data: updateData
      })
      
      // Notify callbacks
      const callback = this.statusCallbacks.get(orderId)
      if (callback) {
        callback({
          orderId,
          status,
          downloadUrl,
          fileName,
          progress,
          message
        })
      }
      
      console.log('Order status updated:', { orderId, status, message })
      
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  /**
   * Subscribe to order status updates
   */
  static subscribeToOrderStatus(
    orderId: string, 
    callback: (update: OrderStatusUpdate) => void
  ): void {
    this.statusCallbacks.set(orderId, callback)
  }

  /**
   * Unsubscribe from order status updates
   */
  static unsubscribeFromOrderStatus(orderId: string): void {
    this.statusCallbacks.delete(orderId)
    
    // Clear any active processing
    const timeout = this.processingOrders.get(orderId)
    if (timeout) {
      clearTimeout(timeout)
      this.processingOrders.delete(orderId)
    }
  }

  /**
   * Get current order status
   */
  static async getOrderStatus(orderId: string): Promise<OrderStatusUpdate | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          downloadUrl: true,
          fileName: true
        }
      })
      
      if (!order) return null
      
      return {
        orderId: order.id,
        status: order.status as any,
        downloadUrl: order.downloadUrl || undefined,
        fileName: order.fileName || undefined
      }
    } catch (error) {
      console.error('Failed to get order status:', error)
      return null
    }
  }

  /**
   * Process pending orders (for cron job)
   */
  static async processPendingOrders(): Promise<void> {
    try {
      const pendingOrders = await prisma.order.findMany({
        where: { status: 'PENDING' },
        take: 10 // Process max 10 orders at a time
      })

      for (const order of pendingOrders) {
        // Skip if already being processed
        if (this.processingOrders.has(order.id)) continue

        const apiKey = process.env.NEHTW_API_KEY
        if (!apiKey) continue

        // Start processing in background
        this.startProcessing(order.id, apiKey, 'unknown', 'unknown').catch(error => {
          console.error('Failed to process pending order:', order.id, error)
        })
      }
    } catch (error) {
      console.error('Error processing pending orders:', error)
    }
  }

  /**
   * Check processing orders (for cron job)
   */
  static async checkProcessingOrders(): Promise<void> {
    try {
      const processingOrders = await prisma.order.findMany({
        where: { status: 'PROCESSING' },
        take: 20
      })

      for (const order of processingOrders) {
        // Check if order has been processing too long (10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        if (order.updatedAt < tenMinutesAgo) {
          await this.updateOrderStatus(order.id, 'FAILED', 'Processing timeout')
        }
      }
    } catch (error) {
      console.error('Error checking processing orders:', error)
    }
  }

  /**
   * Clean up old orders (for cron job)
   */
  static async cleanupOldOrders(): Promise<void> {
    try {
      // Delete orders older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const deletedOrders = await prisma.order.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          status: {
            in: ['COMPLETED', 'FAILED']
          }
        }
      })

      console.log(`Cleaned up ${deletedOrders.count} old orders`)
    } catch (error) {
      console.error('Error cleaning up old orders:', error)
    }
  }
}