import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Stock info API called with URL:', url)

    // Extract site and ID from URL using comprehensive extractor
    const { site, id } = extractSiteAndId(url)

    if (!site || !id) {
      return NextResponse.json({ 
        error: 'Invalid URL format. Please provide a valid stock media URL from supported sites.' 
      }, { status: 400 })
    }

    console.log('Extracted site and ID:', { site, id })

    // Get stock information from nehtw.com API
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const stockInfo = await NehtwAPI.getStockInfo(apiKey, site, id, url)
    
    if (!stockInfo) {
      return NextResponse.json({ 
        error: 'Failed to get stock information. Please check if the URL is from a supported site.' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        site,
        id,
        url,
        title: stockInfo.title,
        cost: stockInfo.cost,
        imageUrl: stockInfo.imageUrl,
        description: stockInfo.description
      }
    })
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 })
  }
}

function extractSiteAndId(url: string): { site: string | null; id: string | null } {
  try {
    console.log("Extract " + url)
    
    const sourceMatch = [
      {
        match: /shutterstock.com(|\/[a-z]*)\/video\/clip-([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'vshutter'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /shutterstock.com(.*)music\/(.*)track-([0-9]*)-/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'mshutter'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image|image-generated|editorial)\/([0-9a-zA-Z-_]*)-([0-9a-z]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'shutterstock'
          const stockId = string[4]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image-generated|editorial)\/([0-9a-z]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'shutterstock'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /stock\.adobe.com\/(..\/||.....\/)(images|templates|3d-assets|stock-photo|video)\/([a-zA-Z0-9-%.,]*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'adobestock'
          const stockId = string[4]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /stock\.adobe.com(.*)asset_id=([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'adobestock'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /stock\.adobe\.com\/(..\/||.....\/)([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'adobestock'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /depositphotos\.com(.*)depositphotos_([0-9]*)(.*)\.jpg/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /depositphotos\.com\/([0-9]*)\/stock-video(.*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos_video'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /depositphotos\.com\/([0-9]*)\/(stock-photo|stock-illustration|free-stock)(.*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /depositphotos.com(.*)qview=([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /depositphotos.com(.*)\/(photo|editorial|vector|illustration)\/([0-9a-z-]*)-([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos'
          const stockId = string[4]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /123rf\.com\/(photo|free-photo)_([0-9]*)_/,
        result: (string: RegExpMatchArray) => {
          const stockSource = '123rf'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /123rf\.com\/(.*)mediapopup=([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = '123rf'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /123rf\.com\/stock-photo\/([0-9]*).html/,
        result: (string: RegExpMatchArray) => {
          const stockSource = '123rf'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /istockphoto\.com\/(.*)gm([0-9A-Z_]*)-/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'istockphoto'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /gettyimages\.com\/(.*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'istockphoto'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /freepik.(.*)\/(.*)-?video-?(.*)\/([0-9a-z-]*)_([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'vfreepik'
          const stockId = string[5]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /freepik\.(.*)(.*)_([0-9]*).htm/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'freepik'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /freepik.com\/(icon|icone)\/(.*)_([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'flaticon'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /flaticon.com\/(.*)\/([0-9a-z-]*)_([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'flaticon'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /flaticon.com\/(.*)(packs|stickers-pack)\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'flaticonpack'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /elements\.envato\.com(.*)\/([0-9a-zA-Z-]*)-([0-9A-Z]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'envato'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /dreamstime(.*)-image([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'dreamstime'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /pngtree\.com(.*)_([0-9]*).html/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'pngtree'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /vectorstock.com\/([0-9a-zA-Z-]*)\/([0-9a-zA-Z-]*)-([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'vectorstock'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /motionarray.com\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)-([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'motionarray'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /(alamy|alamyimages)\.(com|es|de|it|fr)\/(.*)(-|image)([0-9]*).html/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'alamy'
          const stockId = string[5]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /storyblocks\.com\/(video|images|audio)\/stock\/([0-9a-z-]*)-([0-9a-z_]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'storyblocks'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /epidemicsound.com\/(.*)tracks?\/([a-zA-Z0-9-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'epidemicsound'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /yellowimages\.com\/(stock\/|(.*)p=)([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'yellowimages'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /vecteezy.com\/([\/a-zA-Z-]*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'vecteezy'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /creativefabrica.com\/(.*)product\/([a-z0-9-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'creativefabrica'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /lovepik.com\/([a-z]*)-([0-9]*)\//,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'lovepik'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /rawpixel\.com\/image\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'rawpixel'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /deeezy\.com\/product\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'deeezy'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /(productioncrate|footagecrate|graphicscrate)\.com\/([a-z0-9-]*)\/([a-zA-Z0-9-_]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'footagecrate'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /artgrid\.io\/clip\/([0-9]*)\//,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'artgrid_HD'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /pixelsquid.com(.*)-([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'pixelsquid'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /ui8\.net\/(.*)\/(.*)\/([0-9a-zA-Z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'ui8'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /iconscout.com\/((\w{2})\/?$|(\w{2})\/|)([0-9a-z-]*)\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'iconscout'
          const stockId = string[5]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /designi.com.br\/([0-9a-zA-Z]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'designi'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /mockupcloud.com\/(product|scene|graphics\/product)\/([a-z0-9-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'mockupcloud'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /artlist.io\/(stock-footage|video-templates)\/(.*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'artlist_footage'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /artlist.io\/(sfx|royalty-free-music)\/(.*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'artlist_sound'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /pixeden.com\/([0-9a-z-]*)\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'pixeden'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /uplabs.com\/posts\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'uplabs'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /pixelbuddha.net\/(premium|)(.*)\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'pixelbuddha'
          const stockId = string[3]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /uihut.com\/designs\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'uihut'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /craftwork.design\/product\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'craftwork'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /baixardesign.com.br\/arquivo\/([0-9a-z]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'baixardesign'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /soundstripe.com\/(.*)\/([0-9]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'soundstripe'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /mrmockup.com\/product\/([0-9a-z-]*)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'mrmockup'
          const stockId = string[1]
          return { source: stockSource, id: stockId, url: url }
        }
      },
      {
        match: /designbr\.com\.br\/(.*)modal=([^&]+)/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'designbr'
          const stockId = string[2]
          return { source: stockSource, id: stockId, url: url }
        }
      }
    ]

    const item = sourceMatch.find(item => url.match(item.match))
    
    // Is invalid
    if (!item) {
      console.log("No match found for URL:", url)
      return { site: null, id: null }
    }
    
    // Apply match
    const match = url.match(item.match)
    if (!match) {
      console.log("Match failed for URL:", url)
      return { site: null, id: null }
    }
    
    // Get result
    const result = item.result(match)
    console.log("Extracted result:", result)
    return { site: result.source, id: result.id }
  } catch (error) {
    console.error('Error parsing URL:', error)
    return { site: null, id: null }
  }
}
