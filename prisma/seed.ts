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

  // Create stock sites with fixed 10 points cost for all sites (business requirement)
  const stockSites = [
    // Major Stock Photo Sites
    { name: 'shutterstock', displayName: 'Shutterstock', cost: 10, category: 'photos', icon: 'shutterstock.png', isActive: true },
    { name: 'adobestock', displayName: 'Adobe Stock', cost: 10, category: 'photos', icon: 'adobestock.png', isActive: true },
    { name: 'gettyimages', displayName: 'Getty Images', cost: 10, category: 'photos', icon: 'gettyimages.png', isActive: true },
    { name: 'istockphoto', displayName: 'iStock Photo', cost: 10, category: 'photos', icon: 'istockphoto.png', isActive: true },
    { name: 'depositphotos', displayName: 'Depositphotos', cost: 10, category: 'photos', icon: 'depositphotos.png', isActive: true },
    { name: 'dreamstime', displayName: 'Dreamstime', cost: 10, category: 'photos', icon: 'dreamstime.png', isActive: true },
    { name: '123rf', displayName: '123RF', cost: 10, category: 'photos', icon: '123rf.png', isActive: true },
    { name: 'alamy', displayName: 'Alamy', cost: 10, category: 'photos', icon: 'alamy.png', isActive: true },
    { name: 'rawpixel', displayName: 'Rawpixel', cost: 10, category: 'photos', icon: 'rawpixel.png', isActive: true },
    
    // Free Stock Sites
    { name: 'unsplash', displayName: 'Unsplash', cost: 10, category: 'photos', icon: 'unsplash.png', isActive: true },
    { name: 'pexels', displayName: 'Pexels', cost: 10, category: 'photos', icon: 'pexels.png', isActive: true },
    { name: 'pixabay', displayName: 'Pixabay', cost: 10, category: 'photos', icon: 'pixabay.png', isActive: true },
    
    // Vector & Icon Sites
    { name: 'freepik', displayName: 'Freepik', cost: 10, category: 'vectors', icon: 'freepik.png', isActive: true },
    { name: 'flaticon', displayName: 'Flaticon', cost: 10, category: 'icons', icon: 'flaticon.png', isActive: true },
    { name: 'vecteezy', displayName: 'Vecteezy', cost: 10, category: 'vectors', icon: 'vecteezy.png', isActive: true },
    { name: 'iconscout', displayName: 'IconScout', cost: 10, category: 'icons', icon: 'iconscout.png', isActive: true },
    
    // Video Sites
    { name: 'storyblocks', displayName: 'Storyblocks', cost: 10, category: 'videos', icon: 'storyblocks.png', isActive: true },
    { name: 'motionarray', displayName: 'Motion Array', cost: 10, category: 'videos', icon: 'motionarray.png', isActive: true },
    { name: 'videoblocks', displayName: 'Videoblocks', cost: 10, category: 'videos', icon: 'videoblocks.png', isActive: true },
    { name: 'pond5', displayName: 'Pond5', cost: 10, category: 'videos', icon: 'pond5.png', isActive: true },
    
    // Music & Audio
    { name: 'epidemicsound', displayName: 'Epidemic Sound', cost: 10, category: 'music', icon: 'epidemicsound.png', isActive: true },
    { name: 'soundstripe', displayName: 'Soundstripe', cost: 10, category: 'music', icon: 'soundstripe.png', isActive: true },
    { name: 'artlist_music', displayName: 'Artlist Music', cost: 10, category: 'music', icon: 'artlist_sound.png', isActive: true },
    
    // Design & Templates
    { name: 'envato', displayName: 'Envato Elements', cost: 10, category: 'templates', icon: 'envato.png', isActive: true },
    { name: 'creativefabrica', displayName: 'Creative Fabrica', cost: 10, category: 'fonts', icon: 'creativefabrica.png', isActive: true },
    { name: 'craftwork', displayName: 'Craftwork', cost: 10, category: 'templates', icon: 'craftwork.png', isActive: true },
    { name: 'ui8', displayName: 'UI8', cost: 10, category: 'templates', icon: 'ui8.png', isActive: true },
    { name: 'pixeden', displayName: 'Pixeden', cost: 10, category: 'templates', icon: 'pixeden.png', isActive: true },
    { name: 'pixelbuddha', displayName: 'Pixel Buddha', cost: 10, category: 'templates', icon: 'pixelbuddha.png', isActive: true },
    
    // 3D & Specialized
    { name: 'pixelsquid', displayName: 'Pixelsquid', cost: 10, category: '3d', icon: 'pixelsquid.png', isActive: true },
    { name: 'footagecrate', displayName: 'Footage Crate', cost: 10, category: 'videos', icon: 'footagecrate.png', isActive: true },
    { name: 'yellowimages', displayName: 'Yellow Images', cost: 10, category: 'photos', icon: 'yellowimages.png', isActive: true },
  ]

  for (const site of stockSites) {
    await prisma.stockSite.upsert({
      where: { name: site.name },
      update: { 
        cost: site.cost,
        displayName: site.displayName,
        category: site.category,
        icon: site.icon,
        isActive: site.isActive !== false
      },
      create: {
        name: site.name,
        displayName: site.displayName,
        cost: site.cost,
        category: site.category,
        icon: site.icon,
        isActive: site.isActive !== false,
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
