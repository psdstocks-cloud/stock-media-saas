import { NextRequest } from 'next/server'
import { POST as checkoutHandler } from '../stripe/checkout/route'
import { POST as portalHandler } from '../stripe/portal/route'

// Mock Stripe
const mockStripe = {
  customers: {
    create: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
}

jest.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  STRIPE_CONFIG: {
    currency: 'usd',
    payment_method_types: ['card'],
    mode: 'subscription',
  },
}))

// Mock Prisma
const mockPrisma = {
  subscriptionPlan: {
    findUnique: jest.fn(),
  },
  subscription: {
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

const { getServerSession } = require('next-auth')

describe('/api/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create checkout session successfully', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockPlan = {
      id: 'plan123',
      name: 'Professional',
      description: 'Professional plan',
      price: 29.99,
      points: 200,
      rolloverLimit: 50,
    }

    const mockCustomer = {
      id: 'cus123',
      email: 'test@example.com',
      name: 'Test User',
    }

    const mockCheckoutSession = {
      id: 'cs_test123',
      url: 'https://checkout.stripe.com/c/pay/cs_test123',
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
    mockPrisma.subscription.findFirst.mockResolvedValue(null) // No existing subscription
    mockStripe.customers.create.mockResolvedValue(mockCustomer)
    mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

    const requestBody = { planId: 'plan123' }
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe(mockCheckoutSession.url)
    expect(data.sessionId).toBe(mockCheckoutSession.id)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
      customer: mockCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Professional Plan',
              description: 'Professional plan',
            },
            unit_amount: 2999, // $29.99 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/dashboard?success=true',
      cancel_url: 'http://localhost:3000/register?canceled=true',
      metadata: {
        userId: 'user123',
        planId: 'plan123',
      },
    })
  })

  it('should use existing customer if subscription exists', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockPlan = {
      id: 'plan123',
      name: 'Professional',
      description: 'Professional plan',
      price: 29.99,
      points: 200,
      rolloverLimit: 50,
    }

    const mockExistingSubscription = {
      stripeCustomerId: 'cus_existing123',
    }

    const mockCheckoutSession = {
      id: 'cs_test123',
      url: 'https://checkout.stripe.com/c/pay/cs_test123',
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
    mockPrisma.subscription.findFirst.mockResolvedValue(mockExistingSubscription)
    mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

    const requestBody = { planId: 'plan123' }
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe(mockCheckoutSession.url)
    expect(mockStripe.customers.create).not.toHaveBeenCalled()
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing123',
      })
    )
  })

  it('should return error if user not authenticated', async () => {
    getServerSession.mockResolvedValue(null)

    const requestBody = { planId: 'plan123' }
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return error if plan not found', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null)

    const requestBody = { planId: 'invalid-plan' }
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Plan not found')
  })

  it('should return error if planId is missing', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    getServerSession.mockResolvedValue(mockSession)

    const requestBody = {}
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Plan ID required')
  })

  it('should handle Stripe errors gracefully', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockPlan = {
      id: 'plan123',
      name: 'Professional',
      description: 'Professional plan',
      price: 29.99,
      points: 200,
      rolloverLimit: 50,
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
    mockPrisma.subscription.findFirst.mockResolvedValue(null)
    mockStripe.customers.create.mockRejectedValue(new Error('Stripe API error'))

    const requestBody = { planId: 'plan123' }
    const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await checkoutHandler(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create checkout session')
  })
})

describe('/api/stripe/portal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create portal session successfully', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockSubscription = {
      stripeCustomerId: 'cus123',
    }

    const mockPortalSession = {
      url: 'https://billing.stripe.com/session/ps_test123',
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscription.findFirst.mockResolvedValue(mockSubscription)
    mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession)

    const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await portalHandler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe(mockPortalSession.url)
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus123',
      return_url: 'http://localhost:3000/dashboard/profile',
    })
  })

  it('should return error if user not authenticated', async () => {
    getServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await portalHandler(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return error if no active subscription found', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscription.findFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await portalHandler(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('No active subscription found')
  })

  it('should handle Stripe errors gracefully', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockSubscription = {
      stripeCustomerId: 'cus123',
    }

    getServerSession.mockResolvedValue(mockSession)
    mockPrisma.subscription.findFirst.mockResolvedValue(mockSubscription)
    mockStripe.billingPortal.sessions.create.mockRejectedValue(new Error('Stripe API error'))

    const request = new NextRequest('http://localhost:3000/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await portalHandler(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create portal session')
  })
})
