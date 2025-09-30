import { NehtwAPI } from '../nehtw-api'

// Mock fetch globally
global.fetch = jest.fn()

describe('NehtwAPI', () => {
  const mockApiKey = 'test-api-key'
  let api: NehtwAPI

  beforeEach(() => {
    api = new NehtwAPI(mockApiKey)
    jest.clearAllMocks()
  })

  describe('getStockInfo', () => {
    it('should fetch stock information successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          image: 'https://example.com/image.jpg',
          title: 'Test Image',
          id: '123',
          source: 'shutterstock',
          cost: 0.15,
          ext: 'jpg',
          name: 'test-image.jpg',
          author: 'Test Author',
          sizeInBytes: 1024000,
        },
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.getStockInfo('shutterstock', '123')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/stockinfo/shutterstock/123?',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors in stock info request', async () => {
      const mockResponse = {
        success: false,
        error: true,
        message: 'Item not found',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.getStockInfo('shutterstock', 'invalid-id')

      expect(result).toEqual(mockResponse)
    })

    it('should include URL parameter when provided', async () => {
      const mockResponse = { success: true, data: {} }
      const url = 'https://example.com/image'

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      await api.getStockInfo('shutterstock', '123', url)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('url=' + encodeURIComponent(url)),
        expect.any(Object)
      )
    })
  })

  describe('placeOrder', () => {
    it('should place order successfully', async () => {
      const mockResponse = {
        success: true,
        task_id: 'task123',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.placeOrder('shutterstock', '123')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/stockorder/shutterstock/123?',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle order placement errors', async () => {
      const mockResponse = {
        success: false,
        error: true,
        message: 'Insufficient credits',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.placeOrder('shutterstock', '123')

      expect(result).toEqual(mockResponse)
    })
  })

  describe('checkOrderStatus', () => {
    it('should check order status successfully', async () => {
      const mockResponse = {
        success: true,
        status: 'ready',
        downloadLink: 'https://example.com/download',
        fileName: 'test-image.jpg',
        linkType: 'direct',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.checkOrderStatus('task123')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/order/task123/status?responsetype=any',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should use custom response type', async () => {
      const mockResponse = { success: true, status: 'processing' }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      await api.checkOrderStatus('task123', 'gdrive')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/order/task123/status?responsetype=gdrive',
        expect.any(Object)
      )
    })
  })

  describe('generateDownloadLink', () => {
    it('should generate download link successfully', async () => {
      const mockResponse = {
        success: true,
        downloadLink: 'https://example.com/download',
        fileName: 'test-image.jpg',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.generateDownloadLink('task123')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/v2/order/task123/download?responsetype=any',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Order cancelled',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.cancelOrder('task123')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/order/task123/cancel',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getUserFiles', () => {
    it('should get user files successfully', async () => {
      const mockResponse = {
        success: true,
        files: [
          {
            id: 'file1',
            name: 'image1.jpg',
            source: 'shutterstock',
            downloadUrl: 'https://example.com/file1',
          },
        ],
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.getUserFiles()

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/myfiles',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should include optional parameters', async () => {
      const mockResponse = { success: true, files: [] }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      await api.getUserFiles('next-token', 'shutterstock', 'nature')

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/myfiles',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            next_token: 'next-token',
            source: 'shutterstock',
            tag: 'nature',
          }),
        }
      )
    })
  })

  describe('getStockSitesStatus', () => {
    it('should get stock sites status successfully', async () => {
      const mockResponse = {
        success: true,
        sites: [
          {
            name: 'shutterstock',
            status: 'active',
            cost: 0.15,
          },
        ],
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.getStockSitesStatus()

      expect(fetch).toHaveBeenCalledWith(
        'https://nehtw.com/api/stocksites',
        {
          method: 'GET',
          headers: {
            'X-Api-Key': mockApiKey,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })
  })
})

describe('OrderManager', () => {
  // Mock Prisma
  const mockPrisma = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createOrder', () => {
    it('should create order in database', async () => {
      const orderData = {
        userId: 'user123',
        stockSiteId: 'site123',
        stockItemId: 'item123',
        stockItemUrl: 'https://example.com/item',
        title: 'Test Item',
        cost: 0.15,
      }

      const mockOrder = {
        id: 'order123',
        ...orderData,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.order.create.mockResolvedValue(mockOrder)

      // Mock the prisma import
      jest.doMock('../prisma', () => ({
        prisma: mockPrisma,
      }))

      const { OrderManager } = await import('../nehtw-api')
      const result = await OrderManager.createOrder(
        orderData.userId,
        orderData.stockSiteId,
        orderData.stockItemId,
        orderData.stockItemUrl,
        orderData.title,
        orderData.cost
      )

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          ...orderData,
          status: 'PENDING',
        },
      })
      expect(result).toEqual(mockOrder)
    })
  })
})
