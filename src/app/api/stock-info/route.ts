import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'
import { prisma } from '@/lib/prisma'

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

    // Get stock site information from database
    const stockSite = await prisma.stockSite.findUnique({
      where: { name: site }
    })

    if (!stockSite) {
      return NextResponse.json({ 
        error: 'Unsupported stock site. Please use a supported site.' 
      }, { status: 400 })
    }

    // Generate preview image based on site and ID with fallbacks
    const generatePreviewImage = async (site: string, id: string, originalUrl: string): Promise<string> => {
      const siteName = site.toLowerCase()
      
      // Helper function to get the best preview URL for a site
      const getPreviewUrl = async (site: string, id: string, originalUrl: string): Promise<string> => {
        const siteName = site.toLowerCase()
        
        // Dreamstime: Try multiple formats
        if (siteName === 'dreamstime') {
          const alternatives = [
            `https://thumbs.dreamstime.com/z/${id}.jpg`,
            `https://thumbs.dreamstime.com/b/${id}.jpg`,
            `https://thumbs.dreamstime.com/t/${id}.jpg`,
            `https://media.dreamstime.com/z/${id}.jpg`,
            `https://media.dreamstime.com/b/${id}.jpg`
          ]
          
          // Test the first URL
          try {
            const testResponse = await fetch(alternatives[0], { method: 'HEAD' })
            if (testResponse.ok) return alternatives[0]
          } catch (error) {
            console.log('Dreamstime primary preview failed, using fallback')
          }
          
          return alternatives[0] // Return first option as fallback
        }
        
        // Shutterstock: Multiple preview formats
        if (siteName === 'shutterstock' || siteName === 'vshutter' || siteName === 'mshutter') {
          const alternatives = [
            `https://image.shutterstock.com/image-photo/${id}-260nw-${id}.jpg`,
            `https://image.shutterstock.com/image-photo/${id}-150nw-${id}.jpg`,
            `https://image.shutterstock.com/image-photo/${id}-400nw-${id}.jpg`,
            `https://image.shutterstock.com/image-photo/${id}-600nw-${id}.jpg`,
            `https://image.shutterstock.com/image-vector/${id}-260nw-${id}.jpg`,
            `https://image.shutterstock.com/image-illustration/${id}-260nw-${id}.jpg`
          ]
          
          // Test the first URL
          try {
            const testResponse = await fetch(alternatives[0], { method: 'HEAD' })
            if (testResponse.ok) return alternatives[0]
          } catch (error) {
            console.log('Shutterstock primary preview failed, using fallback')
          }
          
          return alternatives[0] // Return first option as fallback
        }
        
        // Adobe Stock: Multiple preview formats
        if (siteName === 'adobestock' || siteName === 'adobe') {
          const alternatives = []
          
          if (id.length >= 4) {
            alternatives.push(`https://as1.ftcdn.net/v2/jpg/${id.slice(0, 2)}/${id.slice(2, 4)}/${id}_1.jpg`)
            alternatives.push(`https://as1.ftcdn.net/v2/jpg/${id.slice(0, 2)}/${id.slice(2, 4)}/${id}_2.jpg`)
            alternatives.push(`https://as1.ftcdn.net/v2/jpg/${id.slice(0, 2)}/${id.slice(2, 4)}/${id}_3.jpg`)
          }
          
          alternatives.push(`https://as1.ftcdn.net/v2/jpg/00/00/${id}_1.jpg`)
          alternatives.push(`https://as1.ftcdn.net/v2/jpg/00/00/${id}_2.jpg`)
          alternatives.push(`https://as1.ftcdn.net/v2/jpg/00/00/${id}_3.jpg`)
          
          // Test the first URL
          try {
            const testResponse = await fetch(alternatives[0], { method: 'HEAD' })
            if (testResponse.ok) return alternatives[0]
          } catch (error) {
            console.log('Adobe Stock primary preview failed, using fallback')
          }
          
          return alternatives[0] // Return first option as fallback
        }
        
        // iStock/Getty Images: Fetch actual preview from page
        if (siteName === 'istockphoto' || siteName === 'istock' || siteName === 'gettyimages') {
          try {
            console.log('Fetching iStockphoto page for preview:', originalUrl)
            
            const response = await fetch(originalUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            })
            
            if (!response.ok) {
              console.log('Failed to fetch iStockphoto page:', response.status)
              throw new Error(`HTTP ${response.status}`)
            }
            
            const html = await response.text()
            console.log('iStockphoto page fetched, length:', html.length)
            
            // Try to extract preview image from various sources
            const patterns = [
              // Look for og:image meta tag
              /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
              // Look for twitter:image meta tag
              /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
              // Look for JSON-LD structured data
              /"image":\s*"([^"]+)"/i,
              // Look for img tags with src containing istockphoto
              /<img[^>]*src="([^"]*istockphoto[^"]*)"[^>]*>/i,
              // Look for data attributes
              /data-src="([^"]*istockphoto[^"]*)"/i,
              // Look for background-image in style attributes
              /background-image:\s*url\(['"]?([^'"]*istockphoto[^'"]*)['"]?\)/i,
              // Look for any URL containing istockphoto images
              /https:\/\/[^"'\s]*istockphoto[^"'\s]*\.(jpg|jpeg|png|webp)/gi,
              // Look for media.istockphoto.com URLs specifically
              /https:\/\/media\.istockphoto\.com\/[^"'\s]*\.(jpg|jpeg|png|webp)/gi
            ]
            
            for (const pattern of patterns) {
              const matches = html.match(pattern)
              if (matches) {
                for (const match of matches) {
                  let imageUrl = match
                  
                  // Clean up the URL
                  if (imageUrl.includes('"')) {
                    imageUrl = imageUrl.split('"')[1] || imageUrl.split('"')[0]
                  }
                  
                  // Ensure it's a valid URL
                  if (imageUrl.startsWith('http') && imageUrl.includes('istockphoto')) {
                    console.log('Found potential iStockphoto preview URL:', imageUrl)
                    
                    // Add iStockphoto parameters for better access
                    const baseUrl = imageUrl.split('?')[0] // Remove existing params
                    const enhancedUrl = `${baseUrl}?a=1&b=1&s=612x612&w=0&k=20&c=DgneR7p3NwDMO-4RQ8AMbyaBCG66qEoWMsReZtASThI=`
                    
                    // Test if this enhanced URL works
                    try {
                      const testResponse = await fetch(enhancedUrl, { method: 'HEAD' })
                      if (testResponse.ok) {
                        console.log('iStockphoto preview URL verified:', enhancedUrl)
                        return enhancedUrl
                      }
                    } catch (testError) {
                      console.log('iStockphoto enhanced URL test failed:', enhancedUrl)
                      
                      // Try the original URL as fallback
                      try {
                        const testResponse = await fetch(imageUrl, { method: 'HEAD' })
                        if (testResponse.ok) {
                          console.log('iStockphoto original URL verified:', imageUrl)
                          return imageUrl
                        }
                      } catch (testError2) {
                        console.log('iStockphoto original URL test failed:', imageUrl)
                      }
                    }
                  }
                }
              }
            }
            
            console.log('No valid iStockphoto preview URL found in page')
            
          } catch (error) {
            console.error('Error fetching iStockphoto preview:', error)
          }
          
          // Fallback: Try alternative URL patterns based on the URL structure
          const urlParts = originalUrl.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          const productName = lastPart.replace(/^gm\d+-/, '').replace(/-\d+$/, '')
          
          const alternatives = [
            `https://media.istockphoto.com/id/${id}/vector/${productName}.jpg`,
            `https://media.istockphoto.com/id/${id}/photo/${productName}.jpg`,
            `https://media.istockphoto.com/id/${id}/vector/stock-vector.jpg`,
            `https://media.istockphoto.com/id/${id}/photo/stock-photo.jpg`,
            `https://media.istockphoto.com/id/${id}/vector/stock-vector-${id}.jpg`,
            `https://media.istockphoto.com/id/${id}/photo/stock-photo-${id}.jpg`,
            `https://media.istockphoto.com/id/${id}/vector/stock-vector-${id}-1.jpg`,
            `https://media.istockphoto.com/id/${id}/photo/stock-photo-${id}-1.jpg`
          ]
          
          // Test each alternative URL with iStockphoto parameters
          for (const altUrl of alternatives) {
            try {
              // Add iStockphoto parameters
              const enhancedUrl = `${altUrl}?a=1&b=1&s=612x612&w=0&k=20&c=DgneR7p3NwDMO-4RQ8AMbyaBCG66qEoWMsReZtASThI=`
              
              const testResponse = await fetch(enhancedUrl, { method: 'HEAD' })
              if (testResponse.ok) {
                console.log('iStockphoto fallback URL verified:', enhancedUrl)
                return enhancedUrl
              }
            } catch (error) {
              // Try original URL without parameters
              try {
                const testResponse = await fetch(altUrl, { method: 'HEAD' })
                if (testResponse.ok) {
                  console.log('iStockphoto fallback URL verified (original):', altUrl)
                  return altUrl
                }
              } catch (error2) {
                // Continue to next URL
              }
            }
          }
          
          // Final fallback: Use a branded placeholder with better formatting
          const productTitle = originalUrl.split('/').pop()?.replace(/-/g, ' ') || 'Product'
          const shortTitle = productTitle.length > 30 ? productTitle.substring(0, 30) + '...' : productTitle
          const encodedTitle = encodeURIComponent(shortTitle)
          return `https://via.placeholder.com/400x300/00a651/ffffff?text=iStock+Photo%0A${encodedTitle}&font=inter&font-size=14`
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
        
        // 123RF: Fetch actual preview from page
        if (siteName === '123rf') {
          try {
            console.log('Fetching 123RF page for preview:', originalUrl)
            
            const response = await fetch(originalUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            })
            
            if (!response.ok) {
              console.log('Failed to fetch 123RF page:', response.status)
              throw new Error(`HTTP ${response.status}`)
            }
            
            const html = await response.text()
            console.log('123RF page fetched, length:', html.length)
            
            // Try to extract preview image from various sources
            const patterns = [
              // Look for og:image meta tag
              /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
              // Look for twitter:image meta tag
              /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
              // Look for JSON-LD structured data
              /"image":\s*"([^"]+)"/i,
              // Look for img tags with src containing 123rf
              /<img[^>]*src="([^"]*123rf[^"]*)"[^>]*>/i,
              // Look for data attributes
              /data-src="([^"]*123rf[^"]*)"/i,
              // Look for background-image in style attributes
              /background-image:\s*url\(['"]?([^'"]*123rf[^'"]*)['"]?\)/i,
              // Look for any URL containing 123rf images
              /https:\/\/[^"'\s]*123rf[^"'\s]*\.(jpg|jpeg|png|webp)/gi
            ]
            
            for (const pattern of patterns) {
              const matches = html.match(pattern)
              if (matches) {
                for (const match of matches) {
                  let imageUrl = match
                  
                  // Clean up the URL
                  if (imageUrl.includes('"')) {
                    imageUrl = imageUrl.split('"')[1] || imageUrl.split('"')[0]
                  }
                  
                  // Ensure it's a valid URL
                  if (imageUrl.startsWith('http') && imageUrl.includes('123rf')) {
                    console.log('Found potential 123RF preview URL:', imageUrl)
                    
                    // Test if this URL works
                    try {
                      const testResponse = await fetch(imageUrl, { method: 'HEAD' })
                      if (testResponse.ok) {
                        console.log('123RF preview URL verified:', imageUrl)
                        return imageUrl
                      }
                    } catch (testError) {
                      console.log('123RF preview URL test failed:', imageUrl)
                    }
                  }
                }
              }
            }
            
            console.log('No valid 123RF preview URL found in page')
            
          } catch (error) {
            console.error('Error fetching 123RF preview:', error)
          }
          
          // Fallback: Try alternative URL patterns
          const alternatives = [
            `https://us.123rf.com/450wm/${id}/${id}.jpg`,
            `https://us.123rf.com/450wm/${id}/${id}.jpeg`,
            `https://us.123rf.com/450wm/${id}/${id}.png`,
            `https://us.123rf.com/450wm/${id}/${id}.webp`,
            `https://us.123rf.com/450wm/${id}/${id}.jpg?ver=6`,
            `https://us.123rf.com/450wm/${id}/${id}.jpg?ver=7`,
            `https://us.123rf.com/450wm/${id}/${id}.jpg?ver=8`,
            `https://us.123rf.com/450wm/${id}/${id}.jpg?ver=9`,
            `https://us.123rf.com/450wm/${id}/${id}.jpg?ver=10`
          ]
          
          // Test each alternative URL
          for (const altUrl of alternatives) {
            try {
              const testResponse = await fetch(altUrl, { method: 'HEAD' })
              if (testResponse.ok) {
                console.log('123RF fallback URL verified:', altUrl)
                return altUrl
              }
            } catch (error) {
              // Continue to next URL
            }
          }
          
          // Final fallback: Use a branded placeholder
          const productTitle = originalUrl.split('/').pop()?.replace(/-/g, ' ') || 'Product'
          const encodedTitle = encodeURIComponent(productTitle)
          return `https://via.placeholder.com/400x300/ff6b35/ffffff?text=${encodedTitle}&font=inter&font-size=16`
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
          return `https://static.vecteezy.com/system/resources/thumbnails/${id}/vector-stock.jpg`
        }
        
        // Envato Elements: Use the correct i3.pngimg.me pattern (from API website)
        if (siteName === 'envato') {
          console.log('Generating Envato Elements preview for ID:', id)
          
          // Primary approach: Use the i3.pngimg.me pattern that the API website uses
          if (id) {
            const imageUrl = `https://i3.pngimg.me/envato/${id}-300.jpg`
            console.log('Testing i3.pngimg.me URL:', imageUrl)
            
            try {
              const testResponse = await fetch(imageUrl, { method: 'HEAD' })
              if (testResponse.ok) {
                console.log('Envato i3.pngimg.me URL verified:', imageUrl)
                return imageUrl
              } else {
                console.log('i3.pngimg.me URL failed with status:', testResponse.status)
              }
            } catch (testError) {
              console.log('i3.pngimg.me URL test failed:', testError instanceof Error ? testError.message : String(testError))
            }
          }
          
          // Fallback: Try different image sizes
          if (id) {
            const fallbackSizes = ['600', '500', '400', '200', '100']
            for (const size of fallbackSizes) {
              const fallbackUrl = `https://i3.pngimg.me/envato/${id}-${size}.jpg`
              console.log('Testing fallback size:', fallbackUrl)
              
              try {
                const testResponse = await fetch(fallbackUrl, { method: 'HEAD' })
                if (testResponse.ok) {
                  console.log('Envato fallback URL verified:', fallbackUrl)
                  return fallbackUrl
                }
              } catch (testError) {
                // Continue to next size
              }
            }
          }
          
          // Final fallback: Branded placeholder
          const productTitle = originalUrl.split('/').pop()?.replace(/-/g, ' ') || 'Envato Product'
          const encodedTitle = encodeURIComponent(productTitle)
          return `https://via.placeholder.com/400x300/667eea/ffffff?text=${encodedTitle}&font=inter&font-size=16`
        }
        
        // Default fallback
        return `https://via.placeholder.com/300x200?text=Preview+Not+Available`
      }
      
      return await getPreviewUrl(site, id, originalUrl)
    }

    const previewImageUrl = await generatePreviewImage(site, id, url)

    return NextResponse.json({
      success: true,
      data: {
        site,
        id,
        url,
        title: 'Untitled', // We'll get the real title from the API when placing the order
        cost: stockSite.cost, // Use database cost (10 points)
        imageUrl: previewImageUrl,
        description: ''
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
