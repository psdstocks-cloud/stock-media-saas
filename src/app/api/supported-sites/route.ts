import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get supported sites from database with fixed 10 points cost
    const stockSites = await prisma.stockSite.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' }
    })

    // Map site names to their actual website URLs
    const siteUrls: { [key: string]: string } = {
      'shutterstock': 'https://www.shutterstock.com',
      'gettyimages': 'https://www.gettyimages.com',
      'adobestock': 'https://stock.adobe.com',
      'unsplash': 'https://unsplash.com',
      'pexels': 'https://www.pexels.com',
      'depositphotos': 'https://depositphotos.com',
      '123rf': 'https://www.123rf.com',
      'istock': 'https://www.istockphoto.com',
      'istockphoto': 'https://www.istockphoto.com',
      'dreamstime': 'https://www.dreamstime.com',
      'bigstock': 'https://www.bigstockphoto.com',
      'freepik': 'https://www.freepik.com',
      'flaticon': 'https://www.flaticon.com',
      'vecteezy': 'https://www.vecteezy.com',
      'rawpixel': 'https://www.rawpixel.com',
      'motionarray': 'https://motionarray.com',
      'iconscout': 'https://iconscout.com',
      'soundstripe': 'https://soundstripe.com',
      'epidemicsound': 'https://epidemicsound.com',
      'deeezy': 'https://deeezy.com',
      'pixabay': 'https://pixabay.com',
      'canva': 'https://www.canva.com',
      'envato': 'https://elements.envato.com',
      'pond5': 'https://www.pond5.com',
      'videoblocks': 'https://www.videoblocks.com',
      'storyblocks': 'https://www.storyblocks.com',
      'alamy': 'https://www.alamy.com',
      'agefotostock': 'https://www.agefotostock.com',
      'westend61': 'https://www.westend61.de',
      'mauritius': 'https://www.mauritius-images.com',
      'imagebank': 'https://www.imagebank.se',
      'photocase': 'https://www.photocase.com',
      'plainpicture': 'https://www.plainpicture.com',
      'pixeden': 'https://pixeden.com',
      'creativefabrica': 'https://www.creativefabrica.com',
      'pixelbuddha': 'https://pixelbuddha.net',
      'artlist_video': 'https://artlist.io',
      'pixelsquid': 'https://pixelsquid.com',
      'footagecrate': 'https://footagecrate.com',
      'craftwork': 'https://craftwork.design',
      'ui8': 'https://ui8.net',
      'ss_video_hd': 'https://www.shutterstock.com',
      'ss_video_4k': 'https://www.shutterstock.com',
      'yellowimages': 'https://yellowimages.com',
      'istock_video_hd': 'https://www.istockphoto.com'
    }

    // Transform database sites to API format with fixed 10 points cost
    const supportedSites = stockSites.map(site => ({
      name: site.name,
      displayName: site.displayName,
      url: siteUrls[site.name] || `https://www.${site.name}.com`,
      cost: 10, // Fixed 10 points for all sites
      description: `Stock media from ${site.displayName}`,
      category: site.category || 'mixed',
      isActive: site.isActive
    }))

    return NextResponse.json({
      success: true,
      sites: supportedSites
    })
  } catch (error) {
    console.error('Error fetching supported sites:', error)
    
    // Fallback to basic sites if database fails
    const fallbackSites = [
      {
        name: 'shutterstock',
        displayName: 'Shutterstock',
        url: 'https://www.shutterstock.com',
        cost: 10,
        description: 'Premium stock photos, vectors, and videos',
        category: 'photos',
        isActive: true
      },
      {
        name: 'gettyimages',
        displayName: 'Getty Images',
        url: 'https://www.gettyimages.com',
        cost: 10,
        description: 'High-quality editorial and creative content',
        category: 'photos',
        isActive: true
      },
      {
        name: 'adobestock',
        displayName: 'Adobe Stock',
        url: 'https://stock.adobe.com',
        cost: 10,
        description: 'Creative assets for Adobe Creative Cloud',
        category: 'photos',
        isActive: true
      },
      {
        name: 'unsplash',
        displayName: 'Unsplash',
        url: 'https://unsplash.com',
        cost: 10,
        description: 'Free high-resolution photos',
        category: 'photos',
        isActive: true
      },
      {
        name: 'pexels',
        displayName: 'Pexels',
        url: 'https://www.pexels.com',
        cost: 10,
        description: 'Free stock photos and videos',
        category: 'photos',
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