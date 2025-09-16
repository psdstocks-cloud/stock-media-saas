import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pointPacks = [
  {
    name: 'Starter Pack',
    description: 'Perfect for small projects and testing',
    price: 9.99,
    points: 50,
    stripePriceId: 'price_starter_50_points', // You'll need to create these in Stripe
    isActive: true,
  },
  {
    name: 'Professional Pack',
    description: 'Great value for regular users',
    price: 24.99,
    points: 150,
    stripePriceId: 'price_professional_150_points',
    isActive: true,
  },
  {
    name: 'Business Pack',
    description: 'Best value for high-volume users',
    price: 69.99,
    points: 500,
    stripePriceId: 'price_business_500_points',
    isActive: true,
  },
  {
    name: 'Enterprise Pack',
    description: 'Maximum value for teams and agencies',
    price: 199.99,
    points: 1500,
    stripePriceId: 'price_enterprise_1500_points',
    isActive: true,
  },
];

async function seedPointPacks() {
  console.log('🌱 Seeding point packs...');

  try {
    for (const pack of pointPacks) {
      const existingPack = await prisma.pointPack.findUnique({
        where: { name: pack.name },
      });

      if (existingPack) {
        console.log(`✅ Point pack "${pack.name}" already exists, skipping...`);
        continue;
      }

      await prisma.pointPack.create({
        data: pack,
      });

      console.log(`✅ Created point pack: ${pack.name} - ${pack.points} points for $${pack.price}`);
    }

    console.log('🎉 Point packs seeded successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Create corresponding products and prices in your Stripe dashboard');
    console.log('2. Update the stripePriceId values in the database with the actual Stripe price IDs');
    console.log('3. Test the purchase flow');

  } catch (error) {
    console.error('❌ Error seeding point packs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPointPacks()
  .catch((error) => {
    console.error('Failed to seed point packs:', error);
    process.exit(1);
  });
