import { NextRequest } from 'next/server'
import { GET as getOrdersHandler, POST as createOrderHandler } from '../orders/route'

// Mock Prisma
const mockPrisma = {
  order: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  stockSite: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock PointsManager
jest.mock('@/lib/points', () => ({
  PointsManager: {
    deductPoints: jest.fn(),
  },
}))

// Mock OrderManager
jest.mock('@/lib/nehtw-api', () => ({
  OrderManager: {
    createOrder: jest.fn(),
    processOrder: jest.fn(),
  },
}))

const { PointsManager } = require('@/lib/points')
const { OrderManager } = require('@/lib/nehtw-api')

describe('/api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const userId = 'user123'
      const mockOrders = [
        {
          id: 'order1',
          userId,
          stockSiteId: 'site1',
          stockItemId: 'item1',
          title: 'Test Image 1',
          cost: 0.15,
          status: 'COMPLETED',
          downloadUrl: 'https://example.com/download1',
          fileName: 'image1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          stockSite: {
            id: 'site1',
            name: 'shutterstock',
            displayName: 'Shutterstock',
          },
        },
        {
          id: 'order2',
          userId,
          stockSiteId: 'site1',
          stockItemId: 'item2',
          title: 'Test Image 2',
          cost: 0.15,
          status: 'PROCESSING',
          downloadUrl: null,
          fileName: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          stockSite: {
            id: 'site1',
            name: 'shutterstock',
            displayName: 'Shutterstock',
          },
        },
      ]

      mockPrisma.order.findMany.mockResolvedValue(mockOrders)

      const request = new NextRequest(`http://localhost:3000/api/orders?userId=${userId}`)
      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.orders).toEqual(mockOrders)
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { stockSite: true },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return error if userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders')
      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User ID is required')
    })

    it('should handle errors gracefully', async () => {
      const userId = 'user123'
      mockPrisma.order.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest(`http://localhost:3000/api/orders?userId=${userId}`)
      const response = await getOrdersHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch orders')
    })
  })

  describe('POST /api/orders', () => {
    it('should create order successfully', async () => {
      const requestBody = {
        userId: 'user123',
        stockSiteId: 'site1',
        stockItemId: 'item1',
        stockItemUrl: 'https://example.com/item1',
        title: 'Test Image',
        cost: 0.15,
      }

      const mockStockSite = {
        id: 'site1',
        name: 'shutterstock',
        displayName: 'Shutterstock',
        cost: 0.15,
        isActive: true,
      }

      const mockOrder = {
        id: 'order123',
        ...requestBody,
        status: 'PENDING',
        taskId: null,
        downloadUrl: null,
        fileName: null,
        fileSize: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.stockSite.findUnique.mockResolvedValue(mockStockSite)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' })
      PointsManager.deductPoints.mockResolvedValue(true)
      OrderManager.createOrder.mockResolvedValue(mockOrder)
      OrderManager.processOrder.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        taskId: 'task123',
      })

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })
      mockPrisma.order.create.mockResolvedValue(mockOrder)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.order).toEqual({
        ...mockOrder,
        status: 'PROCESSING',
        taskId: 'task123',
      })
      expect(PointsManager.deductPoints).toHaveBeenCalledWith(
        requestBody.userId,
        requestBody.cost,
        'DOWNLOAD'
      )
      expect(OrderManager.createOrder).toHaveBeenCalledWith(
        requestBody.userId,
        requestBody.stockSiteId,
        requestBody.stockItemId,
        requestBody.stockItemUrl,
        requestBody.title,
        requestBody.cost
      )
    })

    it('should return error if stock site not found', async () => {
      const requestBody = {
        userId: 'user123',
        stockSiteId: 'invalid-site',
        stockItemId: 'item1',
        cost: 0.15,
      }

      mockPrisma.stockSite.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Stock site not found')
    })

    it('should return error if user not found', async () => {
      const requestBody = {
        userId: 'invalid-user',
        stockSiteId: 'site1',
        stockItemId: 'item1',
        cost: 0.15,
      }

      const mockStockSite = {
        id: 'site1',
        name: 'shutterstock',
        displayName: 'Shutterstock',
        cost: 0.15,
        isActive: true,
      }

      mockPrisma.stockSite.findUnique.mockResolvedValue(mockStockSite)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User not found')
    })

    it('should return error for insufficient points', async () => {
      const requestBody = {
        userId: 'user123',
        stockSiteId: 'site1',
        stockItemId: 'item1',
        cost: 0.15,
      }

      const mockStockSite = {
        id: 'site1',
        name: 'shutterstock',
        displayName: 'Shutterstock',
        cost: 0.15,
        isActive: true,
      }

      mockPrisma.stockSite.findUnique.mockResolvedValue(mockStockSite)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' })
      PointsManager.deductPoints.mockRejectedValue(new Error('Insufficient points'))

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Insufficient points')
    })

    it('should return error for missing required fields', async () => {
      const requestBody = {
        userId: 'user123',
        // Missing stockSiteId, stockItemId, cost
      }

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should handle errors gracefully', async () => {
      const requestBody = {
        userId: 'user123',
        stockSiteId: 'site1',
        stockItemId: 'item1',
        cost: 0.15,
      }

      mockPrisma.stockSite.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createOrderHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create order')
    })
  })
})
