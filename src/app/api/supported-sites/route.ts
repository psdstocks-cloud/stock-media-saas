import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for supported sites with their costs
    // In a real implementation, this would come from the nehtw.com API
    const supportedSites = [
      {
        name: 'shutterstock',
        displayName: 'Shutterstock',
        url: 'https://www.shutterstock.com',
        cost: 5,
        description: 'Premium stock photos, vectors, and videos',
        category: 'images',
        isActive: true
      },
      {
        name: 'gettyimages',
        displayName: 'Getty Images',
        url: 'https://www.gettyimages.com',
        cost: 8,
        description: 'High-quality editorial and creative content',
        category: 'images',
        isActive: true
      },
      {
        name: 'adobe',
        displayName: 'Adobe Stock',
        url: 'https://stock.adobe.com',
        cost: 6,
        description: 'Creative assets for Adobe Creative Cloud',
        category: 'images',
        isActive: true
      },
      {
        name: 'unsplash',
        displayName: 'Unsplash',
        url: 'https://unsplash.com',
        cost: 2,
        description: 'Free high-resolution photos',
        category: 'images',
        isActive: true
      },
      {
        name: 'pexels',
        displayName: 'Pexels',
        url: 'https://www.pexels.com',
        cost: 2,
        description: 'Free stock photos and videos',
        category: 'images',
        isActive: true
      },
      {
        name: 'depositphotos',
        displayName: 'Depositphotos',
        url: 'https://depositphotos.com',
        cost: 4,
        description: 'Stock photos, vectors, and videos',
        category: 'images',
        isActive: true
      },
      {
        name: '123rf',
        displayName: '123RF',
        url: 'https://www.123rf.com',
        cost: 3,
        description: 'Affordable stock photography',
        category: 'images',
        isActive: true
      },
      {
        name: 'istock',
        displayName: 'iStock',
        url: 'https://www.istockphoto.com',
        cost: 7,
        description: 'Premium stock content from Getty Images',
        category: 'images',
        isActive: true
      },
      {
        name: 'dreamstime',
        displayName: 'Dreamstime',
        url: 'https://www.dreamstime.com',
        cost: 3,
        description: 'Stock photography and illustrations',
        category: 'images',
        isActive: true
      },
      {
        name: 'bigstock',
        displayName: 'Bigstock',
        url: 'https://www.bigstockphoto.com',
        cost: 4,
        description: 'Stock photos and vectors',
        category: 'images',
        isActive: true
      }
    ]

    return NextResponse.json({
      success: true,
      sites: supportedSites
    })
  } catch (error) {
    console.error('Error fetching supported sites:', error)
    return NextResponse.json({ error: 'Failed to fetch supported sites' }, { status: 500 })
  }
}
