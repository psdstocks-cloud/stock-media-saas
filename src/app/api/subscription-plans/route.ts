import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Define default plans
    const defaultPlans = [
      {
        id: 'starter',
        name: 'starter',
        description: 'Perfect for individuals and small projects',
        price: 9.99,
        points: 50,
        rolloverLimit: 25,
        isActive: true
      },
      {
        id: 'professional',
        name: 'professional',
        description: 'Ideal for freelancers and small agencies',
        price: 29.99,
        points: 200,
        rolloverLimit: 100,
        isActive: true
      },
      {
        id: 'business',
        name: 'business',
        description: 'Perfect for agencies and design teams',
        price: 79.99,
        points: 600,
        rolloverLimit: 300,
        isActive: true
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        description: 'For large agencies and enterprises',
        price: 199.99,
        points: 1500,
        rolloverLimit: 750,
        isActive: true
      }
    ]

    // Try to get plans from database
    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        points: true,
        rolloverLimit: true,
      },
      orderBy: { price: 'asc' }
    })

    // If no plans in database, return default plans
    if (plans.length === 0) {
      plans = defaultPlans
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    // Return default plans if database fails
    const defaultPlans = [
      {
        id: 'starter',
        name: 'starter',
        description: 'Perfect for individuals and small projects',
        price: 9.99,
        points: 50,
        rolloverLimit: 25,
        isActive: true
      },
      {
        id: 'professional',
        name: 'professional',
        description: 'Ideal for freelancers and small agencies',
        price: 29.99,
        points: 200,
        rolloverLimit: 100,
        isActive: true
      },
      {
        id: 'business',
        name: 'business',
        description: 'Perfect for agencies and design teams',
        price: 79.99,
        points: 600,
        rolloverLimit: 300,
        isActive: true
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        description: 'For large agencies and enterprises',
        price: 199.99,
        points: 1500,
        rolloverLimit: 750,
        isActive: true
      }
    ]
    return NextResponse.json({ plans: defaultPlans })
  }
}