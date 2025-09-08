import { setup, cleanup, prisma } from '../../lib/__tests__/test-setup'
import { PointsManager } from '../../lib/points'
import { OrderManager } from '../../lib/nehtw-api'

// Mock the nehtw.com API
jest.mock('../../lib/nehtw-api', () => ({
  NehtwAPI: jest.fn().mockImplementation(() => ({
    placeOrder: jest.fn().mockResolvedValue({
      success: true,
      task_id: 'test-task-123',
    }),
    checkOrderStatus: jest.fn().mockResolvedValue({
      success: true,
      status: 'ready',
      downloadLink: 'https://example.com/download/test-file.jpg',
      fileName: 'test-file.jpg',
    }),
    generateDownloadLink: jest.fn().mockResolvedValue({
      success: true,
      downloadLink: 'https://example.com/download/test-file.jpg',
      fileName: 'test-file.jpg',
    }),
  })),
  OrderManager: {
    createOrder: jest.fn(),
    processOrder: jest.fn(),
    checkOrderStatus: jest.fn(),
  },
}))

describe('Order Flow Integration', () => {
  let testUser: any
  let testStockSite: any
  let testPlan: any

  beforeAll(async () => {
    await setup()
    
    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
      },
    })

    // Create test subscription
    testPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: 'test-plan-2' },
    })

    await prisma.subscription.create({
      data: {
        id: 'test-sub-123',
        userId: testUser.id,
        planId: testPlan!.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    // Create points balance
    await prisma.pointsBalance.create({
      data: {
        id: 'test-balance-123',
        userId: testUser.id,
        currentPoints: 200,
        totalPurchased: 200,
        totalUsed: 0,
      },
    })

    testStockSite = await prisma.stockSite.findUnique({
      where: { id: 'test-site-1' },
    })
  })

  afterAll(async () => {
    await cleanup()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Reset points balance before each test
    await prisma.pointsBalance.update({
      where: { userId: testUser.id },
      data: {
        currentPoints: 200,
        totalPurchased: 200,
        totalUsed: 0,
      },
    })
  })

  it('should complete full order flow successfully', async () => {
    const orderData = {
      userId: testUser.id,
      stockSiteId: testStockSite!.id,
      stockItemId: 'test-item-123',
      stockItemUrl: 'https://example.com/item/123',
      title: 'Test Stock Image',
      cost: 0.15,
    }

    // Step 1: Create order
    const order = await OrderManager.createOrder(
      orderData.userId,
      orderData.stockSiteId,
      orderData.stockItemId,
      orderData.stockItemUrl,
      orderData.title,
      orderData.cost
    )

    expect(order).toBeDefined()
    expect(order.status).toBe('PENDING')

    // Step 2: Process order (deduct points and place with nehtw.com)
    const processedOrder = await OrderManager.processOrder(
      order.id,
      'test-api-key',
      testStockSite!.name,
      orderData.stockItemId,
      orderData.stockItemUrl
    )

    expect(processedOrder).toBeDefined()
    expect(processedOrder.status).toBe('PROCESSING')
    expect(processedOrder.taskId).toBe('test-task-123')

    // Step 3: Check order status and get download link
    const finalOrder = await OrderManager.checkOrderStatus(
      order.id,
      'test-api-key'
    )

    expect(finalOrder).toBeDefined()
    expect(finalOrder!.status).toBe('READY')
    expect(finalOrder!.downloadUrl).toBe('https://example.com/download/test-file.jpg')
    expect(finalOrder!.fileName).toBe('test-file.jpg')

    // Step 4: Verify points were deducted
    const balance = await PointsManager.getBalance(testUser.id)
    expect(balance!.currentPoints).toBe(199.85) // 200 - 0.15
    expect(balance!.totalUsed).toBe(0.15)

    // Step 5: Verify points history was created
    const history = await PointsManager.getHistory(testUser.id, 10, 0)
    const downloadEntry = history.find(h => h.type === 'DOWNLOAD')
    expect(downloadEntry).toBeDefined()
    expect(downloadEntry!.amount).toBe(-0.15)
    expect(downloadEntry!.description).toBe('Download cost')
  })

  it('should handle insufficient points error', async () => {
    // Set user balance to insufficient amount
    await prisma.pointsBalance.update({
      where: { userId: testUser.id },
      data: {
        currentPoints: 0.10, // Less than required 0.15
      },
    })

    const orderData = {
      userId: testUser.id,
      stockSiteId: testStockSite!.id,
      stockItemId: 'test-item-456',
      stockItemUrl: 'https://example.com/item/456',
      title: 'Test Stock Image 2',
      cost: 0.15,
    }

    // Try to create order
    const order = await OrderManager.createOrder(
      orderData.userId,
      orderData.stockSiteId,
      orderData.stockItemId,
      orderData.stockItemUrl,
      orderData.title,
      orderData.cost
    )

    // Try to process order (should fail due to insufficient points)
    await expect(
      OrderManager.processOrder(
        order.id,
        'test-api-key',
        testStockSite!.name,
        orderData.stockItemId,
        orderData.stockItemUrl
      )
    ).rejects.toThrow('Insufficient points')
  })

  it('should handle order processing failure', async () => {
    // Mock API failure
    const { NehtwAPI } = require('../../lib/nehtw-api')
    const mockAPI = new NehtwAPI('test-api-key')
    mockAPI.placeOrder.mockResolvedValueOnce({
      success: false,
      error: true,
      message: 'API error',
    })

    const orderData = {
      userId: testUser.id,
      stockSiteId: testStockSite!.id,
      stockItemId: 'test-item-789',
      stockItemUrl: 'https://example.com/item/789',
      title: 'Test Stock Image 3',
      cost: 0.15,
    }

    const order = await OrderManager.createOrder(
      orderData.userId,
      orderData.stockSiteId,
      orderData.stockItemId,
      orderData.stockItemUrl,
      orderData.title,
      orderData.cost
    )

    // Try to process order (should fail)
    await expect(
      OrderManager.processOrder(
        order.id,
        'test-api-key',
        testStockSite!.name,
        orderData.stockItemId,
        orderData.stockItemUrl
      )
    ).rejects.toThrow('API error')

    // Verify order status was updated to FAILED
    const failedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    })
    expect(failedOrder!.status).toBe('FAILED')
  })

  it('should handle subscription renewal with rollover', async () => {
    // Set up user with remaining points
    await prisma.pointsBalance.update({
      where: { userId: testUser.id },
      data: {
        currentPoints: 50, // 50 points remaining from 200
        totalPurchased: 200,
        totalUsed: 150,
      },
    })

    // Process subscription renewal
    await PointsManager.processSubscriptionRenewal(
      testUser.id,
      testPlan!.id,
      testPlan!.points
    )

    // Verify points were rolled over and new points added
    const balance = await PointsManager.getBalance(testUser.id)
    expect(balance!.currentPoints).toBe(250) // 50 rolled over + 200 new
    expect(balance!.totalPurchased).toBe(400) // 200 + 200

    // Verify rollover history was created
    const history = await PointsManager.getHistory(testUser.id, 10, 0)
    const rolloverEntry = history.find(h => h.type === 'ROLLOVER')
    expect(rolloverEntry).toBeDefined()
    expect(rolloverEntry!.amount).toBe(50)
    expect(rolloverEntry!.description).toContain('Points rolled over')
  })
})
