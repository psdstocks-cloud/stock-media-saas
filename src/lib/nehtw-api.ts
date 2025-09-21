import { prisma } from './prisma'

export interface NehtwStockInfo {
  success: boolean
  data?: {
    image: string
    title: string
    id: string
    source: string
    cost: number
    ext: string
    name: string
    author: string
    sizeInBytes: number
  }
  error?: boolean
  message?: string
}

export interface NehtwOrderResponse {
  success: boolean
  task_id?: string
  error?: boolean
  message?: string
}

export interface NehtwOrderStatus {
  success: boolean
  status?: 'processing' | 'ready' | 'completed' | 'finished'
  downloadLink?: string
  fileName?: string
  linkType?: string
  error?: boolean
  message?: string
}

export class NehtwAPI {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey: string) {
    this.baseUrl = 'https://nehtw.com/api'
    this.apiKey = apiKey
  }

  /**
   * Get stock information
   * Per documentation, the 'url' param is optional but can help with accuracy.
   */
  async getStockInfo(site: string, id: string, url?: string): Promise<NehtwStockInfo> {
    // The API endpoint already contains all the information needed: site and id
    // Removing the url parameter to avoid validation errors
    const requestUrl = `${this.baseUrl}/stockinfo/${site}/${id}`;
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    });

    return await response.json();
  }

  /**
   * Place an order
   * The url parameter in the query string is redundant and may be causing validation errors.
   */
  async placeOrder(site: string, id: string, url?: string): Promise<NehtwOrderResponse> {
    // The API endpoint already contains all the information needed: site and id
    // Removing the url parameter to avoid validation errors
    const requestUrl = `${this.baseUrl}/stockorder/${site}/${id}`;
    console.log('Nehtw placeOrder request:', {
      site,
      id,
      url,
      requestUrl,
      apiKey: this.apiKey ? 'present' : 'missing',
    });

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Nehtw placeOrder HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Nehtw placeOrder response:', {
        status: response.status,
        data: responseData,
      });

      if (responseData.error || !responseData.success) {
        throw new Error(responseData.message || 'Failed to place order with Nehtw API');
      }

      return responseData;
    } catch (error) {
      console.error('Nehtw placeOrder network error:', error);
      throw error;
    }
  }

  /**
   * Check order status
   */
  async checkOrderStatus(taskId: string, responseType: 'any' | 'gdrive' = 'any'): Promise<NehtwOrderStatus> {
    const requestUrl = `${this.baseUrl}/order/${taskId}/status?responsetype=${responseType}`
    console.log('Nehtw checkOrderStatus request:', {
      taskId,
      requestUrl,
      apiKey: this.apiKey ? 'present' : 'missing'
    })

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
        },
      })

      if (!response.ok) {
        console.error('Nehtw checkOrderStatus HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          taskId
        })
        return {
          success: false,
          error: true,
          message: `HTTP ${response.status}: ${response.statusText} - Failed to check order status`
        }
      }

      const responseData = await response.json()
      console.log('Nehtw checkOrderStatus response:', {
        status: response.status,
        data: responseData,
        taskId
      })

      return responseData
    } catch (error) {
      console.error('Nehtw checkOrderStatus network error:', error)
      return {
        success: false,
        error: true,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown network error'}`
      }
    }
  }

  /**
   * Generate download link
   */
  async generateDownloadLink(taskId: string, responseType: 'any' | 'gdrive' | 'mydrivelink' | 'asia' = 'any'): Promise<NehtwOrderStatus> {
    const response = await fetch(`${this.baseUrl}/v2/order/${taskId}/download?responsetype=${responseType}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    return await response.json()
  }

  /**
   * Cancel an order
   */
  async cancelOrder(taskId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/order/${taskId}/cancel`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    return await response.json()
  }

  /**
   * Get user's files
   */
  async getUserFiles(nextToken?: string, source?: string, tag?: string) {
    const body: any = {}
    if (nextToken) body.next_token = nextToken
    if (source) body.source = source
    if (tag) body.tag = tag

    const response = await fetch(`${this.baseUrl}/myfiles`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return await response.json()
  }

  /**
   * Get stock sites status and pricing
   */
  async getStockSitesStatus() {
    const response = await fetch(`${this.baseUrl}/stocksites`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    return await response.json()
  }

  /**
   * Regenerate download link for an existing order
   */
  async regenerateDownloadLink(taskId: string, responseType: 'any' | 'gdrive' | 'mydrivelink' | 'asia' = 'any'): Promise<NehtwOrderStatus> {
    console.log('Regenerating download link for taskId:', taskId)
    console.log('API Key present:', !!this.apiKey)
    console.log('Base URL:', this.baseUrl)
    
    if (!taskId) {
      console.error('No taskId provided to regenerateDownloadLink')
      return {
        success: false,
        message: 'No task ID provided',
        error: true
      }
    }
    
    const url = `${this.baseUrl}/v2/order/${taskId}/download?responsetype=${responseType}`
    console.log('Making request to:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseData = await response.json()
    console.log('Regenerate download link response:', {
      status: response.status,
      data: responseData
    })

    // Handle different response formats
    if (response.status === 200) {
      // Success case - check if we have a download link
      if (responseData.downloadLink || responseData.download_url || responseData.url) {
        return {
          success: true,
          downloadLink: responseData.downloadLink || responseData.download_url || responseData.url,
          fileName: responseData.fileName || responseData.filename || responseData.file_name,
          message: 'Download link regenerated successfully'
        }
      } else {
        console.error('No download link in successful response:', responseData)
        return {
          success: false,
          message: 'No download link found in response'
        }
      }
    } else {
      // Error case
      console.error('API error response:', responseData)
      return {
        success: false,
        message: responseData.message || responseData.error || 'Failed to regenerate download link',
        error: true
      }
    }
  }
}

export class OrderManager {
  /**
   * Create a new order in our database
   */
  static async createOrder(
    userId: string,
    stockSiteId: string,
    stockItemId: string,
    stockItemUrl: string | null,
    title: string | null,
    cost: number,
    imageUrl: string | null = null
  ) {
    console.log('OrderManager.createOrder called with:', {
      userId,
      stockSiteId,
      stockItemId,
      stockItemUrl,
      title,
      cost,
      imageUrl
    })
    
    console.log('🔍 DEBUG: Stock Item ID in OrderManager:', {
      stockItemId,
      stockItemIdType: typeof stockItemId,
      stockItemIdLength: stockItemId?.length,
      stockItemIdValue: JSON.stringify(stockItemId)
    })

    try {
      const order = await prisma.order.create({
        data: {
          userId,
          stockSiteId,
          stockItemId,
          stockItemUrl,
          imageUrl,
          title,
          cost,
          status: 'PENDING' as any,
        },
      })
      console.log('Order created successfully:', { id: order.id, status: order.status })
      console.log('🔍 DEBUG: Created order stockItemId:', {
        orderId: order.id,
        stockItemId: order.stockItemId,
        stockItemIdType: typeof order.stockItemId,
        stockItemIdLength: order.stockItemId?.length
      })
      return order
    } catch (error) {
      console.error('Error in OrderManager.createOrder:', error)
      console.error('OrderManager.createOrder error details:', {
        userId,
        stockSiteId,
        stockItemId,
        stockItemUrl,
        imageUrl,
        title,
        cost,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  /**
   * Process order with nehtw.com API
   */
  static async processOrder(
    orderId: string,
    apiKey: string,
    site: string,
    id: string,
    url?: string
  ) {
    console.log('OrderManager.processOrder called:', {
      orderId,
      site,
      id,
      url,
      apiKey: apiKey ? 'present' : 'missing'
    })

    const api = new NehtwAPI(apiKey)
    
    try {
      // Place order with nehtw.com
      console.log('Calling Nehtw API placeOrder...')
      const orderResponse = await api.placeOrder(site, id, url)
      
      console.log('Nehtw placeOrder result:', orderResponse)
      
      if (!orderResponse.success || !orderResponse.task_id) {
        console.error('Nehtw placeOrder failed:', orderResponse)
        // Update order status to failed
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'FAILED' as any,
          },
        })
        throw new Error(orderResponse.message || 'Failed to place order with Nehtw API')
      }

      console.log('Updating order with task ID:', orderResponse.task_id)
      // Update order with task ID
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          taskId: orderResponse.task_id,
          status: 'PROCESSING' as any,
        },
      })

      console.log('Order updated successfully:', order.id)
      return order
    } catch (error) {
      console.error('Error in processOrder:', error)
      
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED',
        },
      })

      throw error
    }
  }

  /**
   * Check and update order status
   */
  static async checkOrderStatus(orderId: string, apiKey: string) {
    console.log('checkOrderStatus called for order:', orderId)
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stockSite: true },
    })

    if (!order || !order.taskId) {
      console.log('Order not found or no task ID:', { order: !!order, taskId: order?.taskId })
      throw new Error('Order not found or no task ID')
    }

    // Check if order has been processing for too long (30 minutes)
    const processingTime = Date.now() - new Date(order.createdAt).getTime()
    const maxProcessingTime = 30 * 60 * 1000 // 30 minutes in milliseconds
    
    if (processingTime > maxProcessingTime && order.status === 'PROCESSING') {
      console.log('Order has been processing for too long, marking as failed:', {
        processingTime: processingTime / 1000 / 60, // minutes
        maxProcessingTime: maxProcessingTime / 1000 / 60
      })
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED',
        },
      })
      
      const failedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { stockSite: true },
      })
      
      return failedOrder
    }

    console.log('Checking status for taskId:', order.taskId)

    const api = new NehtwAPI(apiKey)
    console.log('Calling Nehtw API checkOrderStatus for taskId:', order.taskId)
    const statusResponse = await api.checkOrderStatus(order.taskId)
    
    console.log('Status response from Nehtw API:', statusResponse)

    console.log('Status response analysis:', {
      success: statusResponse.success,
      status: statusResponse.status,
      error: statusResponse.error,
      hasDownloadLink: !!statusResponse.downloadLink,
      fullResponse: statusResponse
    })

    // Handle different response formats from Nehtw API
    const isReady = statusResponse.success && (
      statusResponse.status === 'ready' || 
      (statusResponse.status as string) === 'completed' ||
      (statusResponse.status as string) === 'finished' ||
      statusResponse.downloadLink
    )

    const hasError = statusResponse.error || 
      (statusResponse.status as string) === 'failed' || 
      (statusResponse.status as string) === 'error' ||
      (statusResponse.success === false && statusResponse.message)

    if (isReady) {
      console.log('Order is ready, generating download link...')
      
      // Try to generate download link if not already provided
      if (!statusResponse.downloadLink) {
        try {
          const downloadResponse = await api.generateDownloadLink(order.taskId)
          console.log('Download link response:', downloadResponse)
          
          if (downloadResponse.success && downloadResponse.downloadLink) {
            console.log('Updating order with download link:', downloadResponse.downloadLink)
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'READY' as any,
                downloadUrl: downloadResponse.downloadLink,
                fileName: downloadResponse.fileName,
              },
            })
          } else {
            console.log('Download link generation failed, marking as ready without link')
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'READY' as any,
              },
            })
          }
        } catch (downloadError) {
          console.log('Download link generation error, marking as ready:', downloadError)
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'READY',
            },
          })
        }
      } else {
        // Download link already provided
        console.log('Download link already provided:', statusResponse.downloadLink)
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'READY',
            downloadUrl: statusResponse.downloadLink,
            fileName: statusResponse.fileName,
          },
        })
      }
    } else if (hasError) {
      console.log('Order failed with error:', statusResponse.error || statusResponse.message)
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED',
        },
      })
    } else {
      console.log('Order still processing, status:', statusResponse.status)
      // Update the order status in database to reflect current status
      if (statusResponse.status) {
        const normalizedStatus = statusResponse.status.toUpperCase()
        // Map common statuses to our enum
        const statusMap: { [key: string]: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'REFUNDED' } = {
          'PROCESSING': 'PROCESSING',
          'PENDING': 'PENDING',
          'IN_PROGRESS': 'PROCESSING',
          'WORKING': 'PROCESSING',
          'QUEUED': 'PENDING',
          'WAITING': 'PENDING',
          'READY': 'READY',
          'COMPLETED': 'COMPLETED',
          'FAILED': 'FAILED',
          'CANCELED': 'CANCELED',
          'CANCELLED': 'CANCELED',
          'REFUNDED': 'REFUNDED'
        }
        
        const mappedStatus = statusMap[normalizedStatus] || 'PROCESSING'
        
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: mappedStatus as any,
          },
        })
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stockSite: true },
    })
    
    console.log('Final order status:', updatedOrder?.status)
    return updatedOrder
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string, apiKey: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order || !order.taskId) {
      throw new Error('Order not found or no task ID')
    }

    const api = new NehtwAPI(apiKey)
    const cancelResponse = await api.cancelOrder(order.taskId)

    if (cancelResponse.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELED' as any,
        },
      })
    }

    return cancelResponse
  }

  /**
   * Regenerate download link for an existing order
   * This is a FREE redownload - no points are deducted from user account
   */
  static async regenerateDownloadLink(orderId: string, apiKey: string) {
    console.log('OrderManager.regenerateDownloadLink called for order:', orderId)
    console.log('🆓 This is a FREE redownload - no points will be deducted')
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stockSite: true },
    })

    if (!order) {
      console.error('Order not found:', orderId)
      throw new Error('Order not found')
    }

    console.log('Order found:', {
      id: order.id,
      taskId: order.taskId,
      status: order.status,
      stockItemId: order.stockItemId,
      hasTaskId: !!order.taskId
    })

    if (!order.taskId) {
      console.error('Order has no taskId:', {
        orderId: order.id,
        status: order.status,
        taskId: order.taskId,
        stockItemId: order.stockItemId
      })
      throw new Error('Order must have a task ID to regenerate download link')
    }

    const api = new NehtwAPI(apiKey)
    
    try {
      console.log('Calling Nehtw API regenerateDownloadLink for taskId:', order.taskId)
      const response = await api.regenerateDownloadLink(order.taskId)
      
      console.log('Regenerate download link response:', response)
      
      if (response.success && response.downloadLink) {
        console.log('Successfully regenerated download link:', response.downloadLink)
        
        // Update order with new download link
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            downloadUrl: response.downloadLink,
            fileName: response.fileName || order.fileName,
            status: 'READY' as any, // Ensure status is READY
            updatedAt: new Date(),
          },
          include: { stockSite: true },
        })
        
        console.log('Order updated with new download link:', updatedOrder.id)
        return updatedOrder
      } else {
        console.error('Failed to regenerate download link:', response)
        throw new Error(response.message || 'Failed to regenerate download link')
      }
    } catch (error) {
      console.error('Error regenerating download link:', error)
      throw error
    }
  }
}
