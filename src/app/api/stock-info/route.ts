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

    const nehtwAPI = new NehtwAPI(apiKey)
    const stockInfo = await nehtwAPI.getStockInfo(site, id, url)
    
    if (!stockInfo) {
      return NextResponse.json({ 
        error: 'Failed to get stock information. Please check if the URL is from a supported site.' 
      }, { status: 400 })
    }

    // Generate fallback preview image if API doesn't provide one
    const generatePreviewImage = (site: string, id: string): string => {
      const siteName = site.toLowerCase()
      
      // Shutterstock: Standard preview format
      if (siteName === 'shutterstock' || siteName === 'vshutter' || siteName === 'mshutter') {
        return `https://image.shutterstock.com/image-photo/${id}-260nw-${id}.jpg`
      }
      
      // Adobe Stock: Multiple preview formats
      if (siteName === 'adobestock' || siteName === 'adobe') {
        if (id.length >= 4) {
          return `https://as1.ftcdn.net/v2/jpg/${id.slice(0, 2)}/${id.slice(2, 4)}/${id}_1.jpg`
        }
        return `https://as1.ftcdn.net/v2/jpg/00/00/${id}_1.jpg`
      }
      
      // iStock/Getty Images: Standard preview format
      if (siteName === 'istockphoto' || siteName === 'istock' || siteName === 'gettyimages') {
        return `https://media.istockphoto.com/id/${id}/photo/stock-photo.jpg`
      }
      
      // Depositphotos: Multiple preview formats
      if (siteName === 'depositphotos' || siteName === 'depositphotos_video') {
        return `https://st2.depositphotos.com/${id}/photo.jpg`
      }
      
      // Freepik: Standard preview format
      if (siteName === 'freepik' || siteName === 'vfreepik') {
        return `https://img.freepik.com/free-photo/${id}.jpg`
      }
      
      // Flaticon: Icon preview format
      if (siteName === 'flaticon' || siteName === 'flaticonpack') {
        return `https://cdn-icons-png.flaticon.com/512/${id}/${id}.png`
      }
      
      // 123RF: Standard preview format
      if (siteName === '123rf') {
        return `https://us.123rf.com/450wm/${id}/${id}.jpg`
      }
      
      // Dreamstime: Standard preview format
      if (siteName === 'dreamstime') {
        return `https://thumbs.dreamstime.com/z/${id}.jpg`
      }
      
      // Vectorstock: Vector preview format
      if (siteName === 'vectorstock') {
        return `https://cdn3.vectorstock.com/i/1000x1000/${id}/vector-stock.jpg`
      }
      
      // Alamy: Standard preview format
      if (siteName === 'alamy') {
        return `https://c8.alamy.com/comp/${id}/stock-photo.jpg`
      }
      
      // Storyblocks: Video/Image preview format
      if (siteName === 'storyblocks') {
        return `https://dm0qx8t0i0gc9.cloudfront.net/thumbnails/video/${id}/stock-video.jpg`
      }
      
      // Vecteezy: Vector preview format
      if (siteName === 'vecteezy') {
        return `https://static.vecteezy.com/system/resources/previews/${id}/vector.jpg`
      }
      
      // Creative Fabrica: Product preview format
      if (siteName === 'creativefabrica') {
        return `https://cf.shopify.com/images/products/${id}/preview.jpg`
      }
      
      // Rawpixel: Image preview format
      if (siteName === 'rawpixel') {
        return `https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcm00MjgtYy0xLmpwZw==.png`
      }
      
      // Motion Array: Video preview format
      if (siteName === 'motionarray') {
        return `https://motionarray.imgix.net/preview-${id}.jpg`
      }
      
      // Envato Elements: Product preview format
      if (siteName === 'envato') {
        return `https://elements-cover-images-0.imgix.net/${id}/preview.jpg`
      }
      
      // Pixelsquid: 3D preview format
      if (siteName === 'pixelsquid') {
        return `https://cdn.pixelsquid.com/stock-photos/${id}/preview.jpg`
      }
      
      // UI8: Design preview format
      if (siteName === 'ui8') {
        return `https://ui8.net/images/${id}/preview.jpg`
      }
      
      // IconScout: Icon preview format
      if (siteName === 'iconscout') {
        return `https://iconscout.com/icon/${id}/preview`
      }
      
      // Lovepik: Image preview format
      if (siteName === 'lovepik') {
        return `https://img.lovepik.com/photo/${id}.jpg`
      }
      
      // Pngtree: Image preview format
      if (siteName === 'pngtree') {
        return `https://png.pngtree.com/png-vector/${id}/preview.png`
      }
      
      // Deezy: Product preview format
      if (siteName === 'deeezy') {
        return `https://deeezy.com/images/products/${id}/preview.jpg`
      }
      
      // Footage Crate: Video preview format
      if (siteName === 'footagecrate') {
        return `https://footagecrate.com/videos/${id}/preview.jpg`
      }
      
      // Art Grid: Video preview format
      if (siteName === 'artgrid_hd') {
        return `https://artgrid.io/clips/${id}/preview.jpg`
      }
      
      // Yellow Images: Product preview format
      if (siteName === 'yellowimages') {
        return `https://yellowimages.com/stock/${id}/preview.jpg`
      }
      
      // Epidemic Sound: Audio preview format (waveform)
      if (siteName === 'epidemicsound') {
        return `https://epic7static.s3.amazonaws.com/audio/${id}/waveform.png`
      }
      
      return ''
    }

    const apiImageUrl = stockInfo.data?.image || ''
    const fallbackImageUrl = generatePreviewImage(site, id)
    const finalImageUrl = apiImageUrl || fallbackImageUrl

    // Get cost from API or use default cost mapping
    const apiCost = stockInfo.data?.cost || 0
    const defaultCost = getDefaultCostForSite(site)
    const finalCost = apiCost > 0 ? apiCost : defaultCost

    return NextResponse.json({
      success: true,
      data: {
        site,
        id,
        url,
        title: stockInfo.data?.title || 'Untitled',
        cost: finalCost,
        imageUrl: finalImageUrl,
        description: stockInfo.data?.name || ''
      }
    })
  } catch (error) {
    console.error('Stock info error:', error)
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 })
  }
}

function getDefaultCostForSite(site: string): number {
  const siteName = site.toLowerCase()
  
  // Default cost mapping for different stock sites
  const costMap: { [key: string]: number } = {
    'shutterstock': 5,
    'vshutter': 8,
    'mshutter': 6,
    'adobestock': 7,
    'adobe': 7,
    'depositphotos': 4,
    'depositphotos_video': 6,
    'istockphoto': 6,
    'istock': 6,
    'gettyimages': 8,
    'freepik': 3,
    'vfreepik': 5,
    'flaticon': 2,
    'flaticonpack': 4,
    '123rf': 4,
    'dreamstime': 3,
    'vectorstock': 3,
    'alamy': 5,
    'storyblocks': 6,
    'vecteezy': 3,
    'creativefabrica': 4,
    'rawpixel': 3,
    'motionarray': 8,
    'envato': 6,
    'pixelsquid': 5,
    'ui8': 4,
    'iconscout': 3,
    'lovepik': 2,
    'pngtree': 2,
    'deeezy': 4,
    'footagecrate': 6,
    'artgrid_hd': 7,
    'yellowimages': 3,
    'epidemicsound': 5
  }
  
  return costMap[siteName] || 5 // Default cost of 5 points
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
        match: /depositphotos\.com\/(editorial|photo|vector|illustration)\/([0-9a-z-]*)-([0-9]*)\.html/,
        result: (string: RegExpMatchArray) => {
          const stockSource = 'depositphotos'
          const stockId = string[3]
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
