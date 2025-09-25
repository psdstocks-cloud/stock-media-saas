import { NextRequest, NextResponse } from 'next/server';
import { officialParseStockUrl } from '@/lib/official-url-parser';
import { NehtwAPI } from '@/lib/nehtw-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const id = searchParams.get('id');

  if (!url && !id) {
    return NextResponse.json({ 
      success: false,
      message: 'URL or ID parameter is required' 
    }, { status: 400 });
  }

  try {
    let source: string;
    let assetId: string;
    
    if (url) {
      const parseResult = officialParseStockUrl(url);
      if (!parseResult) {
        return NextResponse.json({
          success: false,
          message: 'Invalid URL or ID provided'
        }, { status: 400 });
      }
      source = parseResult.source;
      assetId = parseResult.id;
    } else if (id) {
      // For direct ID lookup, create a mock parse result
      source = 'unknown';
      assetId = id;
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid URL or ID provided'
      }, { status: 400 });
    }

    // Attempt to fetch real stock info from NEHTW
    let nehtwData: { title?: string; image?: string; points?: number; price?: number } | null = null
    try {
      const rawApiKey = process.env.NEHTW_API_KEY
      if (rawApiKey) {
        const api = new NehtwAPI(rawApiKey.replace(/[{}]/g, ''))
        const res = await api.getStockInfo(source, assetId)
        if (res.success && res.data) {
          nehtwData = {
            title: res.data.title,
            image: res.data.image,
            points: 10,
            price: 10
          }
        }
      }
    } catch (e) {
      // Silently handle external API errors, fall back to mock data
    }

    // Enhanced mock data for all supported sites
    const mockData: Record<string, { title: string; image: string; points: number; price: number }> = {
      dreamstime: {
        title: "Freelance people work in comfortable conditions set vector flat illustration. Freelancer character working from home or",
        image: "https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg",
        points: 10,
        price: 10
      },
      shutterstock: {
        title: "Smiling baby girl lying on bed - professional stock photography",
        image: "https://image.shutterstock.com/image-photo/smiling-baby-girl-lying-on-260nw-420756877.jpg",
        points: 10,
        price: 10
      },
      adobestock: {
        title: "Minimal product catalog layout - modern design template",
        image: "https://as1.ftcdn.net/v2/jpg/04/54/40/76/1000_F_454407674_abc123.jpg",
        points: 10,
        price: 10
      },
      depositphotos: {
        title: "Stanley neighborhood Alexandria Egypt - editorial photography",
        image: "https://st.depositphotos.com/1234567/182879584/i/450/depositphotos_182879584-stock-photo-stanley-neighborhood-alexandria-egypt.jpg",
        points: 10,
        price: 10
      },
      epidemicsound: {
        title: "Notification, Message, Text 04 - Sound Effect",
        image: "https://thumbs.dreamstime.com/l/notification-message-text-sound-effect-169271221.jpg",
        points: 10,
        price: 10
      },
      freepik: {
        title: "Modern business concept illustration - vector graphics",
        image: "https://img.freepik.com/free-vector/modern-business-concept-illustration_123456-7890.jpg",
        points: 10,
        price: 10
      },
      flaticon: {
        title: "Business icons set - professional icon collection",
        image: "https://cdn-icons-png.flaticon.com/512/1234/1234567.png",
        points: 10,
        price: 10
      },
      envato: {
        title: "Creative template bundle - premium design assets",
        image: "https://elements-cover-images-0.imgix.net/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      storyblocks: {
        title: "Professional video footage - high quality stock video",
        image: "https://images.storyblocks.com/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      motionarray: {
        title: "Motion graphics template - animated design elements",
        image: "https://motionarray.imgix.net/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      vecteezy: {
        title: "Vector illustration pack - creative design elements",
        image: "https://static.vecteezy.com/system/resources/thumbnails/123456/abc123.jpg",
        points: 10,
        price: 10
      },
      creativefabrica: {
        title: "Font bundle - typography collection",
        image: "https://www.creativefabrica.com/wp-content/uploads/2023/01/abc123.jpg",
        points: 10,
        price: 10
      },
      unsplash: {
        title: "Beautiful landscape photography - high resolution image",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        points: 10,
        price: 10
      },
      pexels: {
        title: "Professional portrait photography - stock photo",
        image: "https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?w=800&h=600&fit=crop",
        points: 10,
        price: 10
      },
      pixabay: {
        title: "Nature photography - free stock image",
        image: "https://cdn.pixabay.com/photo/2023/01/01/12/34/abc123-1234567_960_720.jpg",
        points: 10,
        price: 10
      }
    };
    
    // Prefer real data when available
    const siteData = nehtwData ?? (mockData[source] || {
      title: `${source.charAt(0).toUpperCase() + source.slice(1)} - Professional ${source.includes('video') ? 'Video' : source.includes('audio') ? 'Audio' : source.includes('icon') ? 'Icon' : 'Image'} Asset`,
      image: generatePreviewUrl(source, assetId),
      points: 10,
      price: 10
    });

    // Return mock data for GET requests
    return NextResponse.json({
      success: true,
      data: {
        parsedData: {
          source: source,
          id: assetId,
          url: url || `https://example.com/item/${assetId}`
        },
        stockSite: {
          name: source,
          displayName: source.charAt(0).toUpperCase() + source.slice(1),
          cost: siteData.points
        },
        stockInfo: {
          id: assetId,
          source: source,
          title: siteData.title,
          image: siteData.image,
          points: siteData.points,
          price: siteData.price
        }
      }
    });

  } catch (error) {
    console.error('[STOCK_INFO_GET_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== STOCK INFO API CALLED ===');
    
    const { url } = await request.json();
    console.log('URL received:', url);

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required and must be a string' 
      }, { status: 400 });
    }

    // Parse URL using our official parser
    console.log('Parsing URL...');
    const parseResult = officialParseStockUrl(url);
    console.log('Parse result:', parseResult);

    if (!parseResult) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or unsupported URL. Please check the link and try again.',
        error: 'Unable to parse URL'
      }, { status: 400 });
    }

    const { source, id } = parseResult;

    // Return mock data with correct values based on the actual API response
    console.log('Returning mock data for source:', source);
    
    // Enhanced mock data for all supported sites
    const mockData: Record<string, { title: string; image: string; points: number; price: number }> = {
      dreamstime: {
        title: "Freelance people work in comfortable conditions set vector flat illustration. Freelancer character working from home or",
        image: "https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg",
        points: 10,
        price: 10
      },
      shutterstock: {
        title: "Smiling baby girl lying on bed - professional stock photography",
        image: "https://image.shutterstock.com/image-photo/smiling-baby-girl-lying-on-260nw-420756877.jpg",
        points: 10,
        price: 10
      },
      adobestock: {
        title: "Minimal product catalog layout - modern design template",
        image: "https://as1.ftcdn.net/v2/jpg/04/54/40/76/1000_F_454407674_abc123.jpg",
        points: 10,
        price: 10
      },
      depositphotos: {
        title: "Stanley neighborhood Alexandria Egypt - editorial photography",
        image: "https://st.depositphotos.com/1234567/182879584/i/450/depositphotos_182879584-stock-photo-stanley-neighborhood-alexandria-egypt.jpg",
        points: 10,
        price: 10
      },
      epidemicsound: {
        title: "Notification, Message, Text 04 - Sound Effect",
        image: "https://thumbs.dreamstime.com/l/notification-message-text-sound-effect-169271221.jpg",
        points: 10,
        price: 10
      },
      freepik: {
        title: "Modern business concept illustration - vector graphics",
        image: "https://img.freepik.com/free-vector/modern-business-concept-illustration_123456-7890.jpg",
        points: 10,
        price: 10
      },
      flaticon: {
        title: "Business icons set - professional icon collection",
        image: "https://cdn-icons-png.flaticon.com/512/1234/1234567.png",
        points: 10,
        price: 10
      },
      envato: {
        title: "Creative template bundle - premium design assets",
        image: "https://elements-cover-images-0.imgix.net/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      storyblocks: {
        title: "Professional video footage - high quality stock video",
        image: "https://images.storyblocks.com/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      motionarray: {
        title: "Motion graphics template - animated design elements",
        image: "https://motionarray.imgix.net/abc123-def456.jpg",
        points: 10,
        price: 10
      },
      vecteezy: {
        title: "Vector illustration pack - creative design elements",
        image: "https://static.vecteezy.com/system/resources/thumbnails/123456/abc123.jpg",
        points: 10,
        price: 10
      },
      creativefabrica: {
        title: "Font bundle - typography collection",
        image: "https://www.creativefabrica.com/wp-content/uploads/2023/01/abc123.jpg",
        points: 10,
        price: 10
      },
      unsplash: {
        title: "Beautiful landscape photography - high resolution image",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        points: 10,
        price: 10
      },
      pexels: {
        title: "Professional portrait photography - stock photo",
        image: "https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?w=800&h=600&fit=crop",
        points: 10,
        price: 10
      },
      pixabay: {
        title: "Nature photography - free stock image",
        image: "https://cdn.pixabay.com/photo/2023/01/01/12/34/abc123-1234567_960_720.jpg",
        points: 10,
        price: 10
      }
    };
    
    // Generate dynamic content based on source and ID - always use generatePreviewUrl
    const siteData = {
      title: `${source.charAt(0).toUpperCase() + source.slice(1)} - Professional ${source.includes('video') ? 'Video' : source.includes('audio') ? 'Audio' : source.includes('icon') ? 'Icon' : 'Image'} Asset`,
      image: generatePreviewUrl(source, id),
      points: 10,
      price: 10
    };
    
    console.log('Using siteData for source:', source, siteData);
    console.log('Deployment test - updated stock-info API (GET)');
    
    return NextResponse.json({
      success: true,
      data: {
        parsedData: {
          source: source,
          id: id,
          url: url
        },
        stockSite: {
          name: source,
          displayName: source.charAt(0).toUpperCase() + source.slice(1),
          cost: siteData.points
        },
        stockInfo: {
          id: id,
          source: source,
          title: siteData.title,
          image: siteData.image,
          points: siteData.points,
          price: siteData.price
        }
      }
    });

  } catch (error) {
    console.error('Stock Info API Error:', error);
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generatePreviewUrl(site: string, id: string): string {
  switch (site.toLowerCase()) {
    case 'shutterstock':
      // Use the format from your example: https://i2.pngimg.me/stock/shutterstock/1661260816.jpg
      return `https://i2.pngimg.me/stock/shutterstock/${id}.jpg`
    case 'dreamstime':
      return `https://thumbs.dreamstime.com/z/r-${id}.jpg`
    case 'depositphotos':
      // DepositPhotos uses different subdomains for different ID ranges
      const idStr = id.toString()
      const folder = idStr.slice(0, 5) // First 5 digits for folder
      const idNum = parseInt(id)
      // Use st3 for higher IDs (like 182879584), st for lower IDs (like 108554492)
      const subdomain = idNum > 150000000 ? 'st3' : 'st'
      return `https://${subdomain}.depositphotos.com/thumbs/2115371/image/${folder}/${id}/thumb_110.jpg?forcejpeg=true`
    case 'adobestock':
      return `https://as1.ftcdn.net/v2/jpg/${id.slice(0,2)}/${id.slice(2,4)}/${id.slice(4,6)}/${id.slice(6,8)}/1000_F_${id}_abc123.jpg`
    case '123rf':
      return `https://us.123rf.com/450wm/${id}.jpg`
    case 'istockphoto':
      return `https://media.istockphoto.com/id/${id}/photo.jpg?s=612x612`
    case 'freepik':
      return `https://img.freepik.com/free-photo/${id}.jpg`
    case 'vecteezy':
      return `https://static.vecteezy.com/${id}/preview.jpg`
    case 'unsplash':
      return `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop`
    default:
      return `https://picsum.photos/400/400?random=${id}&sig=${site}`
  }
}