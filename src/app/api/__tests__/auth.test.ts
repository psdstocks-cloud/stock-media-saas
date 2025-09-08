import { NextRequest } from 'next/server'
import { POST as registerHandler } from '../auth/register/route'

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  subscription: {
    create: jest.fn(),
  },
  subscriptionPlan: {
    findUnique: jest.fn(),
  },
  pointsBalance: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

const bcrypt = require('bcryptjs')

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    bcrypt.hash.mockResolvedValue('hashed-password')
  })

  it('should register a new user successfully', async () => {
    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      planId: 'plan123',
    }

    const mockPlan = {
      id: 'plan123',
      name: 'Starter',
      price: 9.99,
      points: 50,
      rolloverLimit: 25,
    }

    const mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockSubscription = {
      id: 'sub123',
      userId: 'user123',
      planId: 'plan123',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockPointsBalance = {
      id: 'balance123',
      userId: 'user123',
      currentPoints: 50,
      totalPurchased: 50,
      totalUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrisma)
    })
    mockPrisma.user.create.mockResolvedValue(mockUser)
    mockPrisma.subscription.create.mockResolvedValue(mockSubscription)
    mockPrisma.pointsBalance.create.mockResolvedValue(mockPointsBalance)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    })
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
  })

  it('should return error if user already exists', async () => {
    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      planId: 'plan123',
    }

    const existingUser = {
      id: 'user123',
      email: 'test@example.com',
    }

    mockPrisma.user.findUnique.mockResolvedValue(existingUser)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('User already exists')
  })

  it('should return error if plan not found', async () => {
    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      planId: 'invalid-plan',
    }

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid subscription plan')
  })

  it('should return error for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: 'invalid-json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
  })

  it('should return error for missing required fields', async () => {
    const requestBody = {
      name: 'Test User',
      // Missing email, password, planId
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await registerHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })
})
