import { NextRequest } from 'next/server'
import { GET as healthHandler } from '../health/route'

// Mock Prisma
const mockPrisma = {
  $queryRaw: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when database is connected', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '1': 1 }])

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await healthHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.database).toBe('connected')
    expect(data.version).toBe('1.0.0')
    expect(data.timestamp).toBeDefined()
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith('SELECT 1')
  })

  it('should return unhealthy status when database is disconnected', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await healthHandler(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.status).toBe('unhealthy')
    expect(data.database).toBe('disconnected')
    expect(data.error).toBe('Database connection failed')
    expect(data.timestamp).toBeDefined()
  })

  it('should handle unknown errors gracefully', async () => {
    mockPrisma.$queryRaw.mockRejectedValue('Unknown error')

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await healthHandler(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.status).toBe('unhealthy')
    expect(data.database).toBe('disconnected')
    expect(data.error).toBe('Unknown error')
    expect(data.timestamp).toBeDefined()
  })
})
