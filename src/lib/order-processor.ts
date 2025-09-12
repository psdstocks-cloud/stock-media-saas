import { prisma } from './prisma'
import { NehtwAPI } from './nehtw-api'

export interface OrderStatusUpdate {
  orderId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
  fileName?: string
  progress?: number
  message?: string
  taskId?: string
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

      // Step 2: Save taskId and monitor order status
      await this.updateOrderStatus(orderId, 'PROCESSING', 'Order placed, monitoring progress...', undefined, undefined, undefined, orderResponse.task_id)
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
   * Monitor order status with ULTRA-FAST polling for maximum speed
   */
  private static async monitorOrderStatus(
    orderId: string,
    api: NehtwAPI,
    taskId: string
  ): Promise<void> {
    let attempts = 0
    const maxAttempts = 40 // 2 minutes max with ultra-fast polling
    let startTime = Date.now()
    let lastStatus = 'processing'
    let consecutiveProcessingCount = 0
    
    const checkStatus = async (): Promise<void> => {
      try {
        attempts++
        const elapsed = Math.round((Date.now() - startTime) / 1000)
        console.log(`🚀 ULTRA-FAST check ${attempts}/${maxAttempts}, elapsed: ${elapsed}s`)
        
        const statusResponse = await api.checkOrderStatus(taskId)
        
        console.log('Order status check response:', {
          orderId,
          taskId,
          success: statusResponse.success,
          status: statusResponse.status,
          error: statusResponse.error,
          hasDownloadLink: !!statusResponse.downloadLink,
          message: statusResponse.message,
          fullResponse: statusResponse
        })
        
        // Check if order is ready with multiple possible status values
        const isReady = statusResponse.success && (
          statusResponse.status === 'ready' || 
          statusResponse.status === 'completed' ||
          statusResponse.status === 'finished' ||
          !!statusResponse.downloadLink
        )
        
        if (isReady && statusResponse.downloadLink) {
          // Order completed successfully
          console.log('🎉 Order completed successfully:', {
            orderId,
            downloadLink: statusResponse.downloadLink,
            fileName: statusResponse.fileName,
            totalTime: elapsed
          })
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
          console.log('Order failed with error:', {
            orderId,
            error: statusResponse.error,
            message: statusResponse.message
          })
          await this.updateOrderStatus(
            orderId,
            'FAILED',
            `Order failed: ${statusResponse.message || 'Unknown error'}`
          )
          return
        }
        
        // Track status changes for smart polling
        if (statusResponse.status === lastStatus) {
          consecutiveProcessingCount++
        } else {
          consecutiveProcessingCount = 0
          lastStatus = statusResponse.status || 'processing'
        }
        
        // Smart progress calculation based on elapsed time and attempts
        const timeBasedProgress = Math.min(90, (elapsed / 60) * 90) // 90% in 60 seconds
        const attemptBasedProgress = Math.min(80, (attempts / maxAttempts) * 80) // 80% based on attempts
        const progress = Math.min(95, Math.max(timeBasedProgress, attemptBasedProgress))
        
        // ULTRA-FAST completion check - check every time after 5 seconds
        if (elapsed >= 5) {
          const isReady = statusResponse.success && (
            statusResponse.status === 'ready' || 
            statusResponse.status === 'completed' ||
            statusResponse.status === 'finished' ||
            !!statusResponse.downloadLink
          )
          
          if (isReady) {
            // Try to get download link if not provided
            let downloadLink = statusResponse.downloadLink
            let fileName = statusResponse.fileName
            
            if (!downloadLink) {
              console.log('Status shows ready but no download link, trying to generate one...')
              try {
                const downloadResponse = await api.generateDownloadLink(taskId)
                console.log('Download link generation response:', downloadResponse)
                
                if (downloadResponse.success && downloadResponse.downloadLink) {
                  downloadLink = downloadResponse.downloadLink
                  fileName = downloadResponse.fileName || fileName
                }
              } catch (error) {
                console.log('Failed to generate download link:', error)
              }
            }
            
            if (downloadLink) {
              console.log('🎉 Order completed at ultra-fast check:', {
                orderId,
                downloadLink,
                fileName,
                totalTime: elapsed
              })
              await this.updateOrderStatus(
                orderId,
                'COMPLETED',
                'Download ready!',
                downloadLink,
                fileName
              )
              return
            }
          }
        }
        
        // PARALLEL OPTIMIZATION: Try multiple API endpoints for faster detection
        if (elapsed >= 15 && attempts % 3 === 0) {
          console.log('🔄 Parallel optimization: Trying alternative detection methods...')
          
          // Try different response types for faster detection
          try {
            const altResponse = await api.checkOrderStatus(taskId, 'gdrive')
            if (altResponse.success && altResponse.downloadLink) {
              console.log('🎉 Found download link via alternative method!')
              await this.updateOrderStatus(
                orderId,
                'COMPLETED',
                'Download ready!',
                altResponse.downloadLink,
                altResponse.fileName
              )
              return
            }
          } catch (error) {
            console.log('Alternative detection failed:', error)
          }
        }
        
        await this.updateOrderStatus(
          orderId,
          'PROCESSING',
          `Processing... ${Math.round(progress)}% complete`,
          undefined,
          undefined,
          Math.round(progress)
        )
        
        // ULTRA-FAST polling strategy
        if (attempts < maxAttempts) {
          let delay: number
          
          if (elapsed < 10) {
            // First 10 seconds: Check every 1 second for ultra-fast detection
            delay = 1000
          } else if (elapsed < 30) {
            // 10-30 seconds: Check every 2 seconds
            delay = 2000
          } else if (elapsed < 60) {
            // 30-60 seconds: Check every 3 seconds
            delay = 3000
          } else {
            // After 60 seconds: Check every 5 seconds
            delay = 5000
          }
          
          // If status hasn't changed for 3 consecutive checks, slow down slightly
          if (consecutiveProcessingCount >= 3 && delay < 3000) {
            delay = Math.min(delay * 1.5, 5000)
          }
          
          console.log(`⏱️ Next check in ${delay}ms (attempt ${attempts + 1})`)
          const timeout = setTimeout(checkStatus, delay)
          this.processingOrders.set(orderId, timeout)
        } else {
          console.log('Order processing timeout:', {
            orderId,
            attempts,
            maxAttempts,
            elapsed,
            statusResponse
          })
          await this.updateOrderStatus(
            orderId,
            'FAILED',
            'Order processing timeout - file not ready after maximum attempts'
          )
          return
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
    
    // Start monitoring immediately
    checkStatus()
  }

  /**
   * Update order status in database and notify callbacks
   */
  static async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    message?: string,
    downloadUrl?: string,
    fileName?: string,
    progress?: number,
    taskId?: string
  ): Promise<void> {
    try {
      // Update database
      const updateData: any = { status }
      if (downloadUrl) updateData.downloadUrl = downloadUrl
      if (fileName) updateData.fileName = fileName
      if (taskId) updateData.taskId = taskId
      
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
          message,
          taskId
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