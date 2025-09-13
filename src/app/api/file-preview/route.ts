import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StockAPI } from '@/lib/stock-api'
import { UrlParser } from '@/lib/url-parser'
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
      
      // Get stock site configuration
      const stockSite = await prisma.stockSite.findFirst({
        where: {
          OR: [
            { name: parsedData.source },
            { displayName: { contains: parsedData.source, mode: 'insensitive' } }
          ]
        }
      })

      if (!stockSite) {
        fileInfo = {
          id: parsedData.id,
          site: parsedData.source,
          title: `${parsedData.source} #${parsedData.id}`,
          previewUrl: generatePreviewUrl(parsedData.source, parsedData.id),
          cost: 0,
          isAvailable: false,
          error: 'Site not supported'
        }
      } else {
        fileInfo = {
          id: parsedData.id,
          site: parsedData.source,
          title: `${stockSite.displayName} #${parsedData.id}`,
          previewUrl: generatePreviewUrl(parsedData.source, parsedData.id),
          cost: stockSite.cost,
          isAvailable: stockSite.isActive,
          error: stockSite.isActive ? undefined : 'Site currently unavailable'
        }
      }
    } else {
      // Fallback to original StockAPI
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
  const previewUrls = {
    shutterstock: `https://image.shutterstock.com/image-illustration/placeholder-${id}.jpg`,
    vshutter: `https://image.shutterstock.com/image-illustration/placeholder-${id}.jpg`,
    mshutter: `https://image.shutterstock.com/image-illustration/placeholder-${id}.jpg`,
    adobestock: `https://as1.ftcdn.net/v2/jpg/placeholder-${id}.jpg`,
    depositphotos: `https://st2.depositphotos.com/placeholder-${id}.jpg`,
    depositphotos_video: `https://st2.depositphotos.com/placeholder-${id}.jpg`,
    '123rf': `https://us.123rf.com/placeholder-${id}.jpg`,
    istockphoto: `https://media.istockphoto.com/id/${id}/photo/placeholder.jpg`,
    freepik: `https://img.freepik.com/free-photo/placeholder-${id}.jpg`,
    vfreepik: `https://img.freepik.com/free-photo/placeholder-${id}.jpg`,
    flaticon: `https://cdn-icons-png.flaticon.com/placeholder-${id}.png`,
    flaticonpack: `https://cdn-icons-png.flaticon.com/placeholder-${id}.png`,
    envato: `https://elements-cover-images-0.imgix.net/placeholder-${id}.jpg`,
    dreamstime: `https://thumbs.dreamstime.com/z/placeholder-${id}.jpg`,
    pngtree: `https://png.pngtree.com/placeholder-${id}.png`,
    vectorstock: `https://www.vectorstock.com/placeholder-${id}.jpg`,
    motionarray: `https://motionarray.imgix.net/placeholder-${id}.jpg`,
    alamy: `https://c8.alamy.com/placeholder-${id}.jpg`,
    motionelements: `https://cdn.motionelements.com/placeholder-${id}.jpg`,
    storyblocks: `https://dm0qx8t0i9gc9.cloudfront.net/placeholder-${id}.jpg`,
    epidemicsound: `https://cdn.epidemicsound.com/placeholder-${id}.jpg`,
    yellowimages: `https://yellowimages.com/placeholder-${id}.jpg`,
    vecteezy: `https://static.vecteezy.com/system/resources/thumbnails/placeholder-${id}.jpg`,
    creativefabrica: `https://www.creativefabrica.com/placeholder-${id}.jpg`,
    lovepik: `https://img.lovepik.com/placeholder-${id}.jpg`,
    rawpixel: `https://images.rawpixel.com/image_png/placeholder-${id}.png`,
    deeezy: `https://cdn.deeezy.com/placeholder-${id}.jpg`,
    footagecrate: `https://footagecrate.com/placeholder-${id}.jpg`,
    artgrid_HD: `https://artgrid.io/placeholder-${id}.jpg`,
    pixelsquid: `https://pixelsquid.com/placeholder-${id}.jpg`,
    ui8: `https://ui8.net/placeholder-${id}.jpg`,
    iconscout: `https://iconscout.com/placeholder-${id}.jpg`,
    designi: `https://designi.com.br/placeholder-${id}.jpg`,
    mockupcloud: `https://mockupcloud.com/placeholder-${id}.jpg`,
    artlist_footage: `https://artlist.io/placeholder-${id}.jpg`,
    artlist_sound: `https://artlist.io/placeholder-${id}.jpg`,
    pixeden: `https://pixeden.com/placeholder-${id}.jpg`,
    uplabs: `https://uplabs.com/placeholder-${id}.jpg`,
    pixelbuddha: `https://pixelbuddha.net/placeholder-${id}.jpg`,
    uihut: `https://uihut.com/placeholder-${id}.jpg`,
    craftwork: `https://craftwork.design/placeholder-${id}.jpg`,
    baixardesign: `https://baixardesign.com.br/placeholder-${id}.jpg`,
    soundstripe: `https://soundstripe.com/placeholder-${id}.jpg`,
    mrmockup: `https://mrmockup.com/placeholder-${id}.jpg`,
    designbr: `https://designbr.com.br/placeholder-${id}.jpg`
  }

  return previewUrls[site as keyof typeof previewUrls] || `https://via.placeholder.com/400x300?text=${site}+${id}`
}
