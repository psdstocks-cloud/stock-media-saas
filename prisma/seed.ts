import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
      rolloverLimit: 25, // 50% of monthly points
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
      rolloverLimit: 100, // 50% of monthly points
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
      rolloverLimit: 300, // 50% of monthly points
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
      rolloverLimit: 750, // 50% of monthly points
      isActive: true,
    },
  })

  // Create stock sites with their point costs
  const stockSites = [
    { name: 'freepik', displayName: 'Freepik', cost: 0.15, category: 'photos' },
    { name: 'flaticon', displayName: 'Flaticon', cost: 0.15, category: 'icons' },
    { name: 'vecteezy', displayName: 'Vecteezy', cost: 0.2, category: 'vectors' },
    { name: 'rawpixel', displayName: 'Rawpixel', cost: 0.2, category: 'photos' },
    { name: 'motionarray', displayName: 'Motion Array', cost: 0.2, category: 'videos' },
    { name: 'iconscout', displayName: 'IconScout', cost: 0.2, category: 'icons' },
    { name: 'soundstripe', displayName: 'Soundstripe', cost: 0.2, category: 'music' },
    { name: 'epidemicsound', displayName: 'Epidemic Sound', cost: 0.2, category: 'music' },
    { name: 'deeezy', displayName: 'Deezzy', cost: 0.2, category: 'videos' },
    { name: 'adobestock', displayName: 'Adobe Stock', cost: 0.25, category: 'photos' },
    { name: 'envato', displayName: 'Envato', cost: 0.35, category: 'mixed' },
    { name: 'shutterstock', displayName: 'Shutterstock', cost: 0.37, category: 'photos' },
    { name: 'pixeden', displayName: 'Pixeden', cost: 0.4, category: 'templates' },
    { name: 'creativefabrica', displayName: 'Creative Fabrica', cost: 0.4, category: 'fonts' },
    { name: 'pixelbuddha', displayName: 'Pixel Buddha', cost: 0.4, category: 'templates' },
    { name: 'artlist_video', displayName: 'Artlist Video', cost: 0.5, category: 'videos' },
    { name: 'pixelsquid', displayName: 'Pixelsquid', cost: 0.65, category: '3d' },
    { name: 'footagecrate', displayName: 'Footage Crate', cost: 0.8, category: 'videos' },
    { name: 'craftwork', displayName: 'Craftwork', cost: 1.0, category: 'templates' },
    { name: 'ui8', displayName: 'UI8', cost: 2.0, category: 'templates' },
    { name: 'ss_video_hd', displayName: 'Shutterstock Video HD', cost: 7.0, category: 'videos' },
    { name: 'yellowimages', displayName: 'Yellow Images', cost: 10.0, category: 'photos' },
    { name: 'ss_video_4k', displayName: 'Shutterstock Video 4K', cost: 16.0, category: 'videos' },
    { name: 'alamy', displayName: 'Alamy', cost: 16.0, category: 'photos' },
    { name: 'istock_video_hd', displayName: 'iStock Video HD', cost: 22.0, category: 'videos' },
  ]

  for (const site of stockSites) {
    await prisma.stockSite.upsert({
      where: { name: site.name },
      update: { cost: site.cost },
      create: {
        name: site.name,
        displayName: site.displayName,
        cost: site.cost,
        category: site.category,
        isActive: true,
      },
    })
  }

  // Create system settings
  const systemSettings = [
    { key: 'point_cost_usd', value: '0.23', type: 'number' }, // Cost per point in USD
    { key: 'default_markup_percentage', value: '50', type: 'number' }, // Default markup percentage
    { key: 'nehtw_api_base_url', value: 'https://nehtw.com/api', type: 'string' },
    { key: 'max_rollover_percentage', value: '50', type: 'number' }, // Max rollover percentage
    { key: 'trial_days', value: '7', type: 'number' }, // Free trial days
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created subscription plans:', [starterPlan.name, professionalPlan.name, businessPlan.name, enterprisePlan.name])
  console.log('🎨 Created stock sites:', stockSites.length)
  console.log('⚙️ Created system settings:', systemSettings.length)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
