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
  status?: 'processing' | 'ready'
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
   */
  async getStockInfo(site: string, id: string, url?: string): Promise<NehtwStockInfo> {
    const params = new URLSearchParams({
      site,
      id,
      ...(url && { url: encodeURIComponent(url) }),
    })

    const response = await fetch(`${this.baseUrl}/stockinfo/${site}/${id}?${params}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    return await response.json()
  }

  /**
   * Place an order
   */
  async placeOrder(site: string, id: string, url?: string): Promise<NehtwOrderResponse> {
    // Try without URL parameter first, as some sites might not need it
    const params = new URLSearchParams()
    
    // Only add URL parameter for specific sites that need it
    if (url && (site === 'unsplash' || site === 'pexels' || site === 'pixabay')) {
      params.append('url', encodeURIComponent(url))
    }

    const requestUrl = `${this.baseUrl}/stockorder/${site}/${id}?${params}`
    console.log('Nehtw placeOrder request:', {
      site,
      id,
      url,
      requestUrl,
      apiKey: this.apiKey ? 'present' : 'missing',
      params: params.toString()
    })

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    const responseData = await response.json()
    console.log('Nehtw placeOrder response:', {
      status: response.status,
      data: responseData
    })

    return responseData
  }

  /**
   * Check order status
   */
  async checkOrderStatus(taskId: string, responseType: 'any' | 'gdrive' = 'any'): Promise<NehtwOrderStatus> {
    const response = await fetch(`${this.baseUrl}/order/${taskId}/status?responsetype=${responseType}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.apiKey,
      },
    })

    return await response.json()
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
    cost: number
  ) {
    return await prisma.order.create({
      data: {
        userId,
        stockSiteId,
        stockItemId,
        stockItemUrl,
        title,
        cost,
        status: 'PENDING',
      },
    })
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
        throw new Error(orderResponse.message || 'Failed to place order')
      }

      console.log('Updating order with task ID:', orderResponse.task_id)
      // Update order with task ID
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          taskId: orderResponse.task_id,
          status: 'PROCESSING',
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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stockSite: true },
    })

    if (!order || !order.taskId) {
      throw new Error('Order not found or no task ID')
    }

    const api = new NehtwAPI(apiKey)
    const statusResponse = await api.checkOrderStatus(order.taskId)

    if (statusResponse.success && statusResponse.status === 'ready') {
      // Generate download link
      const downloadResponse = await api.generateDownloadLink(order.taskId)
      
      if (downloadResponse.success && downloadResponse.downloadLink) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'READY',
            downloadUrl: downloadResponse.downloadLink,
            fileName: downloadResponse.fileName,
          },
        })
      }
    } else if (statusResponse.error) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED',
        },
      })
    }

    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { stockSite: true },
    })
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
          status: 'CANCELED',
        },
      })
    }

    return cancelResponse
  }
}
