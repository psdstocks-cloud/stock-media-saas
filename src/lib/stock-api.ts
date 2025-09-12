import { prisma } from './prisma'

export interface StockFileInfo {
  id: string
  site: string
  title: string
  previewUrl: string
  downloadUrl?: string
  cost: number
  isAvailable: boolean
  error?: string
}

export interface OrderResult {
  success: boolean
  orderId?: string
  taskId?: string
  downloadUrl?: string
  error?: string
  warning?: string
}

export class StockAPI {
  private static readonly SITE_PATTERNS = {
    shutterstock: {
      pattern: /shutterstock\.com\/image-(?:photo|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Shutterstock'
    },
    dreamstime: {
      pattern: /dreamstime\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Dreamstime'
    },
    adobestock: {
      pattern: /adobe\.com\/stock\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Adobe Stock'
    },
    istockphoto: {
      pattern: /istockphoto\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'iStock'
    },
    freepik: {
      pattern: /freepik\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Freepik'
    },
    depositphotos: {
      pattern: /depositphotos\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Depositphotos'
    },
    vecteezy: {
      pattern: /vecteezy\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Vecteezy'
    },
    rawpixel: {
      pattern: /rawpixel\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: 'Rawpixel'
    },
    '123rf': {
      pattern: /123rf\.com\/(?:photo|image|illustration|vector|video)\/([^\/\?]+)/i,
      idPattern: /^[0-9]+$/,
      name: '123RF'
    }
  }

  /**
   * Extract file ID and site from URL
   */
  static extractFileInfo(url: string): { id: string; site: string; name: string } | null {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      for (const [site, config] of Object.entries(this.SITE_PATTERNS)) {
        if (hostname.includes(site) || hostname.includes(config.name.toLowerCase().replace(' ', ''))) {
          const match = url.match(config.pattern)
          
          if (match && match[1]) {
            const id = match[1].replace(/[^0-9]/g, '') // Extract only numbers
            
            if (config.idPattern.test(id)) {
              return {
                id,
                site: site,
                name: config.name
              }
            }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting file info from URL:', error)
      return null
    }
  }

  /**
   * Get file preview information
   */
  static async getFilePreview(url: string): Promise<StockFileInfo | null> {
    try {
      const fileInfo = this.extractFileInfo(url)
      if (!fileInfo) {
        return {
          id: '',
          site: 'unknown',
          title: 'Unknown File',
          previewUrl: '',
          cost: 0,
          isAvailable: false,
          error: 'Unsupported URL format'
        }
      }

      // Get stock site configuration
      const stockSite = await prisma.stockSite.findFirst({
        where: {
          OR: [
            { name: fileInfo.site },
            { displayName: { contains: fileInfo.name, mode: 'insensitive' } }
          ]
        }
      })

      if (!stockSite) {
        return {
          id: fileInfo.id,
          site: fileInfo.site,
          title: `${fileInfo.name} #${fileInfo.id}`,
          previewUrl: this.generatePreviewUrl(fileInfo.site, fileInfo.id),
          cost: 0,
          isAvailable: false,
          error: 'Site not supported'
        }
      }

      return {
        id: fileInfo.id,
        site: fileInfo.site,
        title: `${fileInfo.name} #${fileInfo.id}`,
        previewUrl: this.generatePreviewUrl(fileInfo.site, fileInfo.id),
        cost: stockSite.cost,
        isAvailable: stockSite.isActive,
        error: stockSite.isActive ? undefined : 'Site currently unavailable'
      }
    } catch (error) {
      console.error('Error getting file preview:', error)
      return {
        id: '',
        site: 'unknown',
        title: 'Error',
        previewUrl: '',
        cost: 0,
        isAvailable: false,
        error: 'Failed to get file information'
      }
    }
  }

  /**
   * Generate preview URL for different sites
   */
  private static generatePreviewUrl(site: string, id: string): string {
    const previewUrls = {
      shutterstock: `https://image.shutterstock.com/image-illustration/placeholder-${id}.jpg`,
      dreamstime: `https://thumbs.dreamstime.com/z/placeholder-${id}.jpg`,
      adobestock: `https://as1.ftcdn.net/v2/jpg/placeholder-${id}.jpg`,
      istockphoto: `https://media.istockphoto.com/id/${id}/photo/placeholder.jpg`,
      freepik: `https://img.freepik.com/free-photo/placeholder-${id}.jpg`,
      depositphotos: `https://st2.depositphotos.com/placeholder-${id}.jpg`,
      vecteezy: `https://static.vecteezy.com/system/resources/thumbnails/placeholder-${id}.jpg`,
      rawpixel: `https://images.rawpixel.com/image_png/placeholder-${id}.png`,
      '123rf': `https://us.123rf.com/placeholder-${id}.jpg`
    }

    return previewUrls[site as keyof typeof previewUrls] || `https://via.placeholder.com/400x300?text=${site}+${id}`
  }

  /**
   * Place order with Nehtw API
   */
  static async placeOrder(
    userId: string,
    fileInfo: StockFileInfo,
    apiKey: string
  ): Promise<OrderResult> {
    try {
      console.log('Placing order with Nehtw API:', {
        userId,
        fileInfo,
        apiKey: apiKey ? 'present' : 'missing'
      })

      if (!apiKey) {
        return {
          success: false,
          error: 'API key not configured'
        }
      }

      if (!fileInfo.isAvailable) {
        return {
          success: false,
          error: fileInfo.error || 'File not available'
        }
      }

      // Create order in database first
      const stockSite = await prisma.stockSite.findFirst({
        where: {
          OR: [
            { name: fileInfo.site },
            { displayName: { contains: fileInfo.site, mode: 'insensitive' } }
          ]
        }
      })

      if (!stockSite) {
        return {
          success: false,
          error: 'Stock site not found'
        }
      }

      const order = await prisma.order.create({
        data: {
          userId,
          stockSiteId: stockSite.id,
          stockItemId: fileInfo.id,
          stockItemUrl: fileInfo.previewUrl,
          title: fileInfo.title,
          cost: fileInfo.cost,
          status: 'PENDING'
        }
      })

      console.log('Order created in database:', order.id)

      // Place order with Nehtw API
      const nehtwResponse = await this.callNehtwAPI(apiKey, fileInfo.site, fileInfo.id)
      
      if (!nehtwResponse.success) {
        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        })

        return {
          success: false,
          error: nehtwResponse.error || 'Failed to place order with Nehtw API'
        }
      }

      // Update order with taskId
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          taskId: nehtwResponse.taskId,
          status: 'PROCESSING'
        }
      })

      console.log('Order updated with taskId:', updatedOrder.taskId)

      return {
        success: true,
        orderId: order.id,
        taskId: nehtwResponse.taskId,
        downloadUrl: nehtwResponse.downloadUrl
      }

    } catch (error) {
      console.error('Error placing order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Call Nehtw API to place order
   */
  private static async callNehtwAPI(apiKey: string, site: string, id: string): Promise<{
    success: boolean
    taskId?: string
    downloadUrl?: string
    error?: string
  }> {
    try {
      const url = `https://nehtw.com/api/stockorder/${site}/${id}`
      console.log('Calling Nehtw API:', url)
      console.log('API Key present:', !!apiKey)
      console.log('Site:', site, 'ID:', id)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('Nehtw API response status:', response.status)
      console.log('Nehtw API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nehtw API error response:', errorText)
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`
        }
      }

      const data = await response.json()
      console.log('Nehtw API response data:', data)

      if (data.success && data.task_id) {
        return {
          success: true,
          taskId: data.task_id,
          downloadUrl: data.download_url || data.downloadLink
        }
      } else {
        return {
          success: false,
          error: data.message || data.error || 'API request failed - no task ID returned'
        }
      }
    } catch (error) {
      console.error('Nehtw API call failed:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'API request timeout - please try again'
          }
        } else if (error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Network connection failed - please check your internet connection'
          }
        } else {
          return {
            success: false,
            error: error.message
          }
        }
      }
      
      return {
        success: false,
        error: 'Unknown API call error'
      }
    }
  }

  /**
   * Check order status
   */
  static async checkOrderStatus(taskId: string, apiKey: string): Promise<{
    success: boolean
    status?: string
    downloadUrl?: string
    fileName?: string
    error?: string
  }> {
    try {
      const url = `https://nehtw.com/api/order/${taskId}/status`
      console.log('Checking order status:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('Order status response:', data)

      if (response.ok && data.success) {
        return {
          success: true,
          status: data.status,
          downloadUrl: data.download_url || data.downloadLink,
          fileName: data.file_name || data.fileName
        }
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Status check failed'
        }
      }
    } catch (error) {
      console.error('Order status check failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }

  /**
   * Regenerate download link
   */
  static async regenerateDownloadLink(taskId: string, apiKey: string): Promise<{
    success: boolean
    downloadUrl?: string
    fileName?: string
    error?: string
  }> {
    try {
      const url = `https://nehtw.com/api/v2/order/${taskId}/download`
      console.log('Regenerating download link:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('Download link response:', data)

      if (response.ok && data.success) {
        return {
          success: true,
          downloadUrl: data.download_url || data.downloadLink,
          fileName: data.file_name || data.fileName
        }
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Download link generation failed'
        }
      }
    } catch (error) {
      console.error('Download link regeneration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download link regeneration failed'
      }
    }
  }
}
