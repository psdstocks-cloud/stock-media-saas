import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Allow seeding for now to fix the signup issue
    console.log('🌱 Starting database seeding...')

    console.log('🌱 Seeding database...')

    // Create subscription plans
    const starterPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'starter' },
      update: {},
      create: {
        name: 'starter',
        description: 'Perfect for individuals and small projects',
        price: 9.99,
        points: 50,
        rolloverLimit: 25,
        isActive: true,
      },
    })

    const professionalPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'professional' },
      update: {},
      create: {
        name: 'professional',
        description: 'Ideal for freelancers and small agencies',
        price: 29.99,
        points: 200,
        rolloverLimit: 100,
        isActive: true,
      },
    })

    const businessPlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'business' },
      update: {},
      create: {
        name: 'business',
        description: 'Perfect for agencies and design teams',
        price: 79.99,
        points: 600,
        rolloverLimit: 300,
        isActive: true,
      },
    })

    const enterprisePlan = await prisma.subscriptionPlan.upsert({
      where: { name: 'enterprise' },
      update: {},
      create: {
        name: 'enterprise',
        description: 'For large agencies and enterprises',
        price: 199.99,
        points: 1500,
        rolloverLimit: 750,
        isActive: true,
      },
    })

    // Create stock sites
    const stockSites = [
      { name: 'shutterstock', displayName: 'Shutterstock', cost: 0.5, category: 'images' },
      { name: 'adobestock', displayName: 'Adobe Stock', cost: 0.4, category: 'images' },
      { name: 'istockphoto', displayName: 'iStock', cost: 0.8, category: 'images' },
      { name: 'depositphotos', displayName: 'Depositphotos', cost: 0.6, category: 'images' },
      { name: 'freepik', displayName: 'Freepik', cost: 0.2, category: 'images' },
      { name: 'unsplash', displayName: 'Unsplash', cost: 0.0, category: 'images' },
      { name: 'pixabay', displayName: 'Pixabay', cost: 0.0, category: 'images' },
      { name: 'pexels', displayName: 'Pexels', cost: 0.0, category: 'images' },
    ]

    for (const site of stockSites) {
      await prisma.stockSite.upsert({
        where: { name: site.name },
        update: {},
        create: {
          ...site,
          isActive: true,
        },
      })
    }

    // Create system settings
    const systemSettings = [
      { key: 'point_cost_usd', value: '0.23', type: 'number' },
      { key: 'default_markup_percentage', value: '50', type: 'number' },
      { key: 'nehtw_api_base_url', value: 'https://nehtw.com/api', type: 'string' },
      { key: 'max_rollover_percentage', value: '50', type: 'number' },
      { key: 'trial_days', value: '7', type: 'number' },
    ]

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    }

    console.log('✅ Database seeded successfully!')

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      plans: [starterPlan.name, professionalPlan.name, businessPlan.name, enterprisePlan.name]
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
