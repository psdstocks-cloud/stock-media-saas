import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StockAPI } from '@/lib/stock-api'
import { ComprehensiveUrlParser } from '@/lib/comprehensive-url-parser'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, parsedData } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Getting file preview for URL:', url)

    let fileInfo

    // If we have parsed data from our advanced parser, use it
    if (parsedData) {
      console.log('Using parsed data from advanced parser:', parsedData)
      
      try {
        // Get stock site configuration
        console.log('Querying database for stock site:', parsedData.source)
        const stockSite = await prisma.stockSite.findFirst({
          where: {
            OR: [
              { name: parsedData.source },
              { displayName: { contains: parsedData.source, mode: 'insensitive' } }
            ]
          }
        })
        console.log('Database query result:', stockSite)

        if (!stockSite) {
          console.log('No stock site found in database, creating fallback')
          fileInfo = {
            id: parsedData.id,
            site: parsedData.source,
            title: `${parsedData.source.charAt(0).toUpperCase() + parsedData.source.slice(1)} - ${parsedData.id}`,
            image: generatePreviewUrl(parsedData.source, parsedData.id),
            previewUrl: generatePreviewUrl(parsedData.source, parsedData.id),
            cost: 10, // Fixed 10 points for all sites
            size: 'Unknown',
            format: 'Unknown',
            author: 'Unknown',
            isAvailable: true, // Changed to true for fallback
            error: undefined // No error for fallback
          }
        } else {
          console.log('Stock site found, creating file info')
          fileInfo = {
            id: parsedData.id,
            site: parsedData.source,
            title: `${stockSite.displayName} - ${parsedData.id}`,
            image: generatePreviewUrl(parsedData.source, parsedData.id),
            previewUrl: generatePreviewUrl(parsedData.source, parsedData.id),
            cost: 10, // Fixed 10 points for all sites
            size: 'Unknown',
            format: 'Unknown',
            author: 'Unknown',
            isAvailable: stockSite.isActive,
            error: stockSite.isActive ? undefined : 'Site currently unavailable'
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Fallback if database query fails
        fileInfo = {
          id: parsedData.id,
          site: parsedData.source,
          title: `${parsedData.source.charAt(0).toUpperCase() + parsedData.source.slice(1)} - ${parsedData.id}`,
          image: generatePreviewUrl(parsedData.source, parsedData.id),
          previewUrl: generatePreviewUrl(parsedData.source, parsedData.id),
          cost: 10,
          size: 'Unknown',
          format: 'Unknown',
          author: 'Unknown',
          isAvailable: true,
          error: undefined
        }
      }
    } else {
      // Fallback to original StockAPI
      console.log('No parsed data, using StockAPI fallback')
      fileInfo = await StockAPI.getFilePreview(url)
    }

    if (!fileInfo) {
      return NextResponse.json({ 
        error: 'Failed to extract file information from URL' 
      }, { status: 400 })
    }

    console.log('File preview result:', fileInfo)

    return NextResponse.json({
      success: true,
      fileInfo
    })

  } catch (error) {
    console.error('Error getting file preview:', error)
    return NextResponse.json({ 
      error: 'Failed to get file preview' 
    }, { status: 500 })
  }
}

// Helper function to generate preview URLs
function generatePreviewUrl(site: string, id: string): string {
  // Use Unsplash for better placeholder images
  const unsplashImages = [
    'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
  ]
  
  // Use a deterministic approach to select image based on ID
  const imageIndex = parseInt(id) % unsplashImages.length
  return unsplashImages[imageIndex]
}
