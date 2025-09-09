import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stockSites = [
  { name: 'shutterstock', displayName: 'Shutterstock', cost: 10, category: 'photos' },
  { name: 'vshutter', displayName: 'Shutterstock Video HD', cost: 10, category: 'videos' },
  { name: 'mshutter', displayName: 'Shutterstock Music', cost: 10, category: 'music' },
  { name: 'adobestock', displayName: 'Adobe Stock', cost: 10, category: 'photos' },
  { name: 'adobe', displayName: 'Adobe Stock', cost: 10, category: 'photos' },
  { name: 'depositphotos', displayName: 'Depositphotos', cost: 10, category: 'photos' },
  { name: 'depositphotos_video', displayName: 'Depositphotos Video', cost: 10, category: 'videos' },
  { name: 'istockphoto', displayName: 'iStock', cost: 10, category: 'photos' },
  { name: 'istock', displayName: 'iStock', cost: 10, category: 'photos' },
  { name: 'gettyimages', displayName: 'Getty Images', cost: 10, category: 'photos' },
  { name: 'freepik', displayName: 'Freepik', cost: 10, category: 'photos' },
  { name: 'vfreepik', displayName: 'Freepik Video', cost: 10, category: 'videos' },
  { name: 'flaticon', displayName: 'Flaticon', cost: 10, category: 'icons' },
  { name: 'flaticonpack', displayName: 'Flaticon Pack', cost: 10, category: 'icons' },
  { name: '123rf', displayName: '123RF', cost: 10, category: 'photos' },
  { name: 'dreamstime', displayName: 'Dreamstime', cost: 10, category: 'photos' },
  { name: 'vectorstock', displayName: 'VectorStock', cost: 10, category: 'vectors' },
  { name: 'alamy', displayName: 'Alamy', cost: 10, category: 'photos' },
  { name: 'storyblocks', displayName: 'Storyblocks', cost: 10, category: 'videos' },
  { name: 'vecteezy', displayName: 'Vecteezy', cost: 10, category: 'vectors' },
  { name: 'creativefabrica', displayName: 'Creative Fabrica', cost: 10, category: 'design' },
  { name: 'rawpixel', displayName: 'Rawpixel', cost: 10, category: 'photos' },
  { name: 'motionarray', displayName: 'Motion Array', cost: 10, category: 'videos' },
  { name: 'envato', displayName: 'Envato Elements', cost: 10, category: 'design' },
  { name: 'pixelsquid', displayName: 'Pixelsquid', cost: 10, category: '3d' },
  { name: 'ui8', displayName: 'UI8', cost: 10, category: 'design' },
  { name: 'iconscout', displayName: 'IconScout', cost: 10, category: 'icons' },
  { name: 'lovepik', displayName: 'Lovepik', cost: 10, category: 'photos' },
  { name: 'pngtree', displayName: 'Pngtree', cost: 10, category: 'photos' },
  { name: 'deeezy', displayName: 'Deeezy', cost: 10, category: 'design' },
  { name: 'footagecrate', displayName: 'Footage Crate', cost: 10, category: 'videos' },
  { name: 'artgrid_hd', displayName: 'Artgrid HD', cost: 10, category: 'videos' },
  { name: 'yellowimages', displayName: 'Yellow Images', cost: 10, category: 'photos' },
  { name: 'epidemicsound', displayName: 'Epidemic Sound', cost: 10, category: 'music' },
  { name: 'pixeden', displayName: 'Pixeden', cost: 10, category: 'design' },
  { name: 'pixelbuddha', displayName: 'Pixel Buddha', cost: 10, category: 'design' },
  { name: 'mockupcloud', displayName: 'Mockup Cloud', cost: 10, category: 'mockups' },
  { name: 'designi', displayName: 'Designi', cost: 10, category: 'design' },
  { name: 'craftwork', displayName: 'Craftwork', cost: 10, category: 'design' },
  { name: 'soundstripe', displayName: 'Soundstripe', cost: 10, category: 'music' },
  { name: 'artlist_footage', displayName: 'Artlist Video/Template', cost: 10, category: 'videos' },
  { name: 'artlist_sound', displayName: 'Artlist Music/SFX', cost: 10, category: 'music' },
  { name: 'motionelements', displayName: 'Motion Elements', cost: 10, category: 'videos' }
]

async function seedStockSites() {
  try {
    console.log('🌱 Seeding stock sites with 10-point pricing...')
    
    for (const site of stockSites) {
      await prisma.stockSite.upsert({
        where: { name: site.name },
        update: { 
          displayName: site.displayName,
          cost: site.cost,
          category: site.category,
          isActive: true
        },
        create: site
      })
      console.log(`✅ ${site.displayName} (${site.name}): ${site.cost} points`)
    }
    
    console.log('🎉 Stock sites seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding stock sites:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedStockSites()
