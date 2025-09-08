import { PointsManager } from '../points'
import { prisma } from '../prisma'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    pointsBalance: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    pointsHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('PointsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addPoints', () => {
    it('should add points to user balance and create history record', async () => {
      const userId = 'user123'
      const amount = 100
      const type = 'SUBSCRIPTION'
      const description = 'Test points'

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })

      mockPrisma.pointsBalance.upsert.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 100,
        totalPurchased: 100,
        totalUsed: 0,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.pointsHistory.create.mockResolvedValue({
        id: 'history123',
        userId,
        type,
        amount,
        description,
        orderId: null,
        createdAt: new Date(),
      })

      await PointsManager.addPoints(userId, amount, type, description)

      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(mockPrisma.pointsBalance.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { currentPoints: { increment: amount } },
        create: {
          userId,
          currentPoints: amount,
          totalPurchased: amount,
        },
      })
      expect(mockPrisma.pointsHistory.create).toHaveBeenCalledWith({
        data: {
          userId,
          type,
          amount,
          description,
          orderId: undefined,
        },
      })
    })

    it('should handle negative amounts for deductions', async () => {
      const userId = 'user123'
      const amount = -50
      const type = 'DOWNLOAD'

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })

      mockPrisma.pointsBalance.upsert.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 50,
        totalPurchased: 100,
        totalUsed: 50,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.pointsHistory.create.mockResolvedValue({
        id: 'history123',
        userId,
        type,
        amount,
        description: undefined,
        orderId: undefined,
        createdAt: new Date(),
      })

      await PointsManager.addPoints(userId, amount, type)

      expect(mockPrisma.pointsBalance.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { 
          currentPoints: { increment: amount },
          totalUsed: { increment: Math.abs(amount) }
        },
        create: {
          userId,
          currentPoints: amount,
          totalPurchased: 0,
        },
      })
    })
  })

  describe('deductPoints', () => {
    it('should deduct points and throw error if insufficient balance', async () => {
      const userId = 'user123'
      const amount = 100

      mockPrisma.pointsBalance.findUnique.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 50, // Insufficient balance
        totalPurchased: 100,
        totalUsed: 0,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(PointsManager.deductPoints(userId, amount, 'DOWNLOAD')).rejects.toThrow('Insufficient points')
    })

    it('should successfully deduct points when balance is sufficient', async () => {
      const userId = 'user123'
      const amount = 50

      mockPrisma.pointsBalance.findUnique.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 100,
        totalPurchased: 100,
        totalUsed: 0,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })

      mockPrisma.pointsBalance.upsert.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 50,
        totalPurchased: 100,
        totalUsed: 50,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.pointsHistory.create.mockResolvedValue({
        id: 'history123',
        userId,
        type: 'DOWNLOAD',
        amount: -amount,
        description: undefined,
        orderId: undefined,
        createdAt: new Date(),
      })

      await PointsManager.deductPoints(userId, amount, 'DOWNLOAD')

      expect(mockPrisma.pointsBalance.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { 
          currentPoints: { decrement: amount },
          totalUsed: { increment: amount }
        },
        create: {
          userId,
          currentPoints: -amount,
          totalPurchased: 0,
        },
      })
    })
  })

  describe('getBalance', () => {
    it('should return user balance', async () => {
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

      mockPrisma.pointsBalance.findUnique.mockResolvedValue(mockBalance)

      const result = await PointsManager.getBalance(userId)

      expect(result).toEqual(mockBalance)
      expect(mockPrisma.pointsBalance.findUnique).toHaveBeenCalledWith({
        where: { userId },
      })
    })

    it('should return null if no balance found', async () => {
      const userId = 'user123'

      mockPrisma.pointsBalance.findUnique.mockResolvedValue(null)

      const result = await PointsManager.getBalance(userId)

      expect(result).toBeNull()
    })
  })

  describe('getHistory', () => {
    it('should return user points history', async () => {
      const userId = 'user123'
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

      mockPrisma.pointsHistory.findMany.mockResolvedValue(mockHistory)

      const result = await PointsManager.getHistory(userId, 10, 0)

      expect(result).toEqual(mockHistory)
      expect(mockPrisma.pointsHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      })
    })
  })

  describe('processSubscriptionRenewal', () => {
    it('should process subscription renewal with rollover', async () => {
      const userId = 'user123'
      const planId = 'plan123'
      const monthlyPoints = 100

      const mockSubscription = {
        id: 'sub123',
        userId,
        planId,
        stripeCustomerId: 'cus123',
        stripeSubscriptionId: 'sub_stripe123',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPlan = {
        id: planId,
        name: 'Professional',
        description: 'Professional plan',
        price: 29.99,
        points: monthlyPoints,
        rolloverLimit: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.subscription.findFirst.mockResolvedValue(mockSubscription)
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      mockPrisma.pointsBalance.findUnique.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 30, // 30 points remaining
        totalPurchased: 100,
        totalUsed: 70,
        lastRollover: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })

      mockPrisma.pointsBalance.upsert.mockResolvedValue({
        id: 'balance123',
        userId,
        currentPoints: 130, // 30 rolled over + 100 new
        totalPurchased: 200,
        totalUsed: 70,
        lastRollover: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.pointsHistory.create.mockResolvedValue({
        id: 'history123',
        userId,
        type: 'ROLLOVER',
        amount: 30,
        description: 'Points rolled over from previous period',
        orderId: null,
        createdAt: new Date(),
      })

      await PointsManager.processSubscriptionRenewal(userId, planId, monthlyPoints)

      expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { userId, planId },
        include: { plan: true },
      })
    })
  })
})
