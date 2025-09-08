import { NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function GET() {
  try {
    const apiKey = process.env.NEHTW_API_KEY
    
    if (!apiKey) {
      // Return mock data if API key is not configured
      const mockSites = [
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
        }
      ]
      
      return NextResponse.json({
        success: true,
        sites: mockSites
      })
    }

    // Get real supported sites from Nehtw API
    const api = new NehtwAPI(apiKey)
    const response = await api.getStockSitesStatus()
    
    console.log('Nehtw API Response:', response)
    
    // The Nehtw API returns data directly, not wrapped in success/data
    let sitesData = response
    if (response.data) {
      sitesData = response.data
    }

    // Transform Nehtw API response to our format
    const supportedSites = Object.entries(sitesData || {}).map(([siteName, siteData]: [string, any]) => {
      // Map site names to their actual website URLs
      const siteUrls: { [key: string]: string } = {
        'shutterstock': 'https://www.shutterstock.com',
        'gettyimages': 'https://www.gettyimages.com',
        'adobe': 'https://stock.adobe.com',
        'unsplash': 'https://unsplash.com',
        'pexels': 'https://www.pexels.com',
        'depositphotos': 'https://depositphotos.com',
        '123rf': 'https://www.123rf.com',
        'istock': 'https://www.istockphoto.com',
        'dreamstime': 'https://www.dreamstime.com',
        'bigstock': 'https://www.bigstockphoto.com',
        'freepik': 'https://www.freepik.com',
        'pixabay': 'https://pixabay.com',
        'canva': 'https://www.canva.com',
        'envato': 'https://elements.envato.com',
        'pond5': 'https://www.pond5.com',
        'videoblocks': 'https://www.videoblocks.com',
        'storyblocks': 'https://www.storyblocks.com',
        'istockphoto': 'https://www.istockphoto.com',
        'alamy': 'https://www.alamy.com',
        'agefotostock': 'https://www.agefotostock.com',
        'westend61': 'https://www.westend61.de',
        'mauritius': 'https://www.mauritius-images.com',
        'imagebank': 'https://www.imagebank.se',
        'photocase': 'https://www.photocase.com',
        'plainpicture': 'https://www.plainpicture.com'
      }

      return {
        name: siteName,
        displayName: siteName.charAt(0).toUpperCase() + siteName.slice(1).replace(/_/g, ' '),
        url: siteUrls[siteName] || `https://www.${siteName}.com`,
        cost: siteData.price || 5,
        description: `Stock media from ${siteName}`,
        category: 'images',
        isActive: siteData.active === true
      }
    })

    return NextResponse.json({
      success: true,
      sites: supportedSites
    })
  } catch (error) {
    console.error('Error fetching supported sites:', error)
    
    // Fallback to mock data if API fails
    const fallbackSites = [
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
      }
    ]
    
    return NextResponse.json({
      success: true,
      sites: fallbackSites,
      fallback: true
    })
  }
}
