import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract site and ID from URL
    const { site, id } = extractSiteAndId(url)
    
    if (!site || !id) {
      return NextResponse.json({ 
        error: 'Invalid URL format. Please provide a valid stock media URL from supported sites.' 
      }, { status: 400 })
    }

    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      // Return mock data for testing when API key is not configured
      const mockData = {
        image: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
        title: 'Sample Stock Media - ' + site.charAt(0).toUpperCase() + site.slice(1),
        id: id,
        source: site,
        cost: 5, // Default cost
        ext: 'jpg',
        name: 'sample-media',
        author: 'Sample Author',
        sizeInBytes: 2048000
      }
      
      return NextResponse.json({
        success: true,
        data: mockData
      })
    }

    console.log('Extracted site:', site, 'id:', id, 'from URL:', url)
    
    const api = new NehtwAPI(apiKey)
    const stockInfo = await api.getStockInfo(site, id, url)

    console.log('Stock Info API Response:', stockInfo)

    if (!stockInfo.success || !stockInfo.data) {
      console.error('Stock Info API Error:', stockInfo)
      return NextResponse.json({ 
        error: stockInfo.message || 'Failed to get stock information. Please check if the URL is from a supported site.' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: stockInfo.data
    })
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 })
  }
}

function extractSiteAndId(url: string): { site: string | null; id: string | null } {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Shutterstock
    if (hostname.includes('shutterstock.com')) {
      // Extract ID from the end of the URL (e.g., 2275780825 from letter-m-love-monogram-modern-logo-2275780825)
      const match = url.match(/(\d+)$/)
      if (match) {
        return { site: 'shutterstock', id: match[1] }
      }
    }

    // Getty Images
    if (hostname.includes('gettyimages.com')) {
      const match = url.match(/\/photos\/([^\/\?]+)/)
      if (match) {
        return { site: 'gettyimages', id: match[1] }
      }
    }

    // Adobe Stock
    if (hostname.includes('adobe.com') || hostname.includes('stock.adobe.com')) {
      const match = url.match(/\/stock-photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'adobe', id: match[1] }
      }
    }

    // Unsplash
    if (hostname.includes('unsplash.com')) {
      const match = url.match(/\/photos\/([^\/\?]+)/)
      if (match) {
        return { site: 'unsplash', id: match[1] }
      }
    }

    // Pexels
    if (hostname.includes('pexels.com')) {
      const match = url.match(/\/photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'pexels', id: match[1] }
      }
    }

    // Depositphotos
    if (hostname.includes('depositphotos.com')) {
      const match = url.match(/\/\d+\/stock-photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'depositphotos', id: match[1] }
      }
    }

    // 123RF
    if (hostname.includes('123rf.com')) {
      const match = url.match(/\/stock-photo\/([^\/\?]+)/)
      if (match) {
        return { site: '123rf', id: match[1] }
      }
    }

    // iStock
    if (hostname.includes('istockphoto.com')) {
      const match = url.match(/\/photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'istock', id: match[1] }
      }
    }

    // Dreamstime
    if (hostname.includes('dreamstime.com')) {
      const match = url.match(/\/stock-photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'dreamstime', id: match[1] }
      }
    }

    // Bigstock
    if (hostname.includes('bigstockphoto.com')) {
      const match = url.match(/\/stock-photo\/([^\/\?]+)/)
      if (match) {
        return { site: 'bigstock', id: match[1] }
      }
    }

    return { site: null, id: null }
  } catch (error) {
    return { site: null, id: null }
  }
}
