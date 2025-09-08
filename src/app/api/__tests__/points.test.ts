import { NextRequest } from 'next/server'
import { GET as getPointsHandler, POST as addPointsHandler } from '../points/route'

// Mock Prisma
const mockPrisma = {
  pointsBalance: {
    findUnique: jest.fn(),
  },
  pointsHistory: {
    findMany: jest.fn(),
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
    getBalance: jest.fn(),
    getHistory: jest.fn(),
    addPoints: jest.fn(),
  },
}))

const { PointsManager } = require('@/lib/points')

describe('/api/points', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/points', () => {
    it('should return user points balance and history', async () => {
      const userId = 'user123'
      const mockBalance = {
        id: 'balance123',
        userId,
        currentPoints: 100,
        totalPurchased: 200,
        totalUsed: 100,
        lastRollover: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockHistory = [
        {
          id: 'history1',
          userId,
          type: 'SUBSCRIPTION',
          amount: 100,
          description: 'Monthly points',
          orderId: null,
          createdAt: new Date(),
        },
        {
          id: 'history2',
          userId,
          type: 'DOWNLOAD',
          amount: -50,
          description: 'Download cost',
          orderId: 'order123',
          createdAt: new Date(),
        },
      ]

      PointsManager.getBalance.mockResolvedValue(mockBalance)
      PointsManager.getHistory.mockResolvedValue(mockHistory)

      const request = new NextRequest(`http://localhost:3000/api/points?userId=${userId}`)
      const response = await getPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.balance).toEqual(mockBalance)
      expect(data.history).toEqual(mockHistory)
      expect(PointsManager.getBalance).toHaveBeenCalledWith(userId)
      expect(PointsManager.getHistory).toHaveBeenCalledWith(userId, 50, 0)
    })

    it('should return error if userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/points')
      const response = await getPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User ID is required')
    })

    it('should handle errors gracefully', async () => {
      const userId = 'user123'
      PointsManager.getBalance.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest(`http://localhost:3000/api/points?userId=${userId}`)
      const response = await getPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch points data')
    })
  })

  describe('POST /api/points', () => {
    it('should add points successfully', async () => {
      const requestBody = {
        userId: 'user123',
        amount: 100,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Admin adjustment',
      }

      const mockBalance = {
        id: 'balance123',
        userId: 'user123',
        currentPoints: 200,
        totalPurchased: 300,
        totalUsed: 100,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      PointsManager.addPoints.mockResolvedValue(mockBalance)

      const request = new NextRequest('http://localhost:3000/api/points', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await addPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.balance).toEqual(mockBalance)
      expect(PointsManager.addPoints).toHaveBeenCalledWith(
        requestBody.userId,
        requestBody.amount,
        requestBody.type,
        requestBody.description
      )
    })

    it('should return error for missing required fields', async () => {
      const requestBody = {
        userId: 'user123',
        // Missing amount, type
      }

      const request = new NextRequest('http://localhost:3000/api/points', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await addPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should return error for invalid amount', async () => {
      const requestBody = {
        userId: 'user123',
        amount: 0,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Test',
      }

      const request = new NextRequest('http://localhost:3000/api/points', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await addPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Amount must be non-zero')
    })

    it('should handle errors gracefully', async () => {
      const requestBody = {
        userId: 'user123',
        amount: 100,
        type: 'ADMIN_ADJUSTMENT',
        description: 'Test',
      }

      PointsManager.addPoints.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/points', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await addPointsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to add points')
    })
  })
})
