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

  // Create stock sites with fixed 10 points cost for all sites
  const stockSites = [
    { name: 'freepik', displayName: 'Freepik', cost: 10, category: 'photos' },
    { name: 'flaticon', displayName: 'Flaticon', cost: 10, category: 'icons' },
    { name: 'vecteezy', displayName: 'Vecteezy', cost: 10, category: 'vectors' },
    { name: 'rawpixel', displayName: 'Rawpixel', cost: 10, category: 'photos' },
    { name: 'motionarray', displayName: 'Motion Array', cost: 10, category: 'videos' },
    { name: 'iconscout', displayName: 'IconScout', cost: 10, category: 'icons' },
    { name: 'soundstripe', displayName: 'Soundstripe', cost: 10, category: 'music' },
    { name: 'epidemicsound', displayName: 'Epidemic Sound', cost: 10, category: 'music' },
    { name: 'deeezy', displayName: 'Deezzy', cost: 10, category: 'videos' },
    { name: 'adobestock', displayName: 'Adobe Stock', cost: 10, category: 'photos' },
    { name: 'envato', displayName: 'Envato', cost: 10, category: 'mixed' },
    { name: 'shutterstock', displayName: 'Shutterstock', cost: 10, category: 'photos' },
    { name: 'pixeden', displayName: 'Pixeden', cost: 10, category: 'templates' },
    { name: 'creativefabrica', displayName: 'Creative Fabrica', cost: 10, category: 'fonts' },
    { name: 'pixelbuddha', displayName: 'Pixel Buddha', cost: 10, category: 'templates' },
    { name: 'artlist_video', displayName: 'Artlist Video', cost: 10, category: 'videos' },
    { name: 'pixelsquid', displayName: 'Pixelsquid', cost: 10, category: '3d' },
    { name: 'footagecrate', displayName: 'Footage Crate', cost: 10, category: 'videos' },
    { name: 'craftwork', displayName: 'Craftwork', cost: 10, category: 'templates' },
    { name: 'ui8', displayName: 'UI8', cost: 10, category: 'templates' },
    { name: 'ss_video_hd', displayName: 'Shutterstock Video HD', cost: 10, category: 'videos' },
    { name: 'yellowimages', displayName: 'Yellow Images', cost: 10, category: 'photos' },
    { name: 'ss_video_4k', displayName: 'Shutterstock Video 4K', cost: 10, category: 'videos' },
    { name: 'alamy', displayName: 'Alamy', cost: 10, category: 'photos' },
    { name: 'istock_video_hd', displayName: 'iStock Video HD', cost: 10, category: 'videos' },
    { name: 'gettyimages', displayName: 'Getty Images', cost: 10, category: 'photos' },
    { name: 'unsplash', displayName: 'Unsplash', cost: 10, category: 'photos' },
    { name: 'pexels', displayName: 'Pexels', cost: 10, category: 'photos' },
    { name: 'depositphotos', displayName: 'Depositphotos', cost: 10, category: 'photos' },
    { name: '123rf', displayName: '123RF', cost: 10, category: 'photos' },
    { name: 'istock', displayName: 'iStock', cost: 10, category: 'photos' },
    { name: 'dreamstime', displayName: 'Dreamstime', cost: 10, category: 'photos' },
    { name: 'pixabay', displayName: 'Pixabay', cost: 10, category: 'photos' },
    { name: 'canva', displayName: 'Canva', cost: 10, category: 'templates' },
    { name: 'pond5', displayName: 'Pond5', cost: 10, category: 'videos' },
    { name: 'videoblocks', displayName: 'Videoblocks', cost: 10, category: 'videos' },
    { name: 'storyblocks', displayName: 'Storyblocks', cost: 10, category: 'videos' },
    { name: 'istockphoto', displayName: 'iStock Photo', cost: 10, category: 'photos' },
    { name: 'agefotostock', displayName: 'Age Fotostock', cost: 10, category: 'photos' },
    { name: 'westend61', displayName: 'Westend61', cost: 10, category: 'photos' },
    { name: 'mauritius', displayName: 'Mauritius Images', cost: 10, category: 'photos' },
    { name: 'imagebank', displayName: 'Imagebank', cost: 10, category: 'photos' },
    { name: 'photocase', displayName: 'Photocase', cost: 10, category: 'photos' },
    { name: 'plainpicture', displayName: 'Plainpicture', cost: 10, category: 'photos' },
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
    { key: 'point_cost_usd', value: '0.23', type: 'number' as const }, // Cost per point in USD
    { key: 'default_markup_percentage', value: '50', type: 'number' as const }, // Default markup percentage
    { key: 'nehtw_api_base_url', value: 'https://nehtw.com/api', type: 'string' as const },
    { key: 'max_rollover_percentage', value: '50', type: 'number' as const }, // Max rollover percentage
    { key: 'trial_days', value: '7', type: 'number' as const }, // Free trial days
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
