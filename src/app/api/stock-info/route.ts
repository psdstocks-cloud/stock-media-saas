import { NextRequest, NextResponse } from 'next/server';
import { parseStockMediaUrl } from '@/lib/url-parser';

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
    let parseResult;
    
    if (url) {
      parseResult = parseStockMediaUrl(url);
    } else if (id) {
      // For direct ID lookup, create a mock parse result
      parseResult = {
        success: true,
        data: {
          source: 'unknown',
          id: id,
          url: `https://example.com/item/${id}`
        }
      };
    }

    if (!parseResult?.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid URL or ID provided'
      }, { status: 400 });
    }

    if (!parseResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Invalid URL or ID provided'
      }, { status: 400 });
    }

    const { source, id: assetId } = parseResult.data;

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
          cost: 10
        },
        stockInfo: {
          id: assetId,
          source: source,
          title: `${source.charAt(0).toUpperCase() + source.slice(1)} Image`,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          points: 10,
          price: 10
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

    // Parse URL using our advanced parser
    console.log('Parsing URL...');
    const parseResult = parseStockMediaUrl(url);
    console.log('Parse result:', parseResult);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or unsupported URL. Please check the link and try again.',
        error: parseResult.error || 'Unable to parse URL'
      }, { status: 400 });
    }

    const { source, id } = parseResult.data;

    // Return mock data with correct values based on the actual API response
    console.log('Returning mock data for source:', source);
    
    // Use correct values based on the actual nehtw.com API response
    const mockData = {
      dreamstime: {
        title: "Freelance people work in comfortable conditions set vector flat illustration. Freelancer character working from home or",
        image: "https://thumbs.dreamstime.com/l/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-169271221.jpg",
        points: 0.65,
        price: 0.65
      }
    };
    
    const siteData = mockData[source as keyof typeof mockData] || {
      title: `${source.charAt(0).toUpperCase() + source.slice(1)} Image`,
      image: 'https://picsum.photos/400/400?random=1',
      points: 10,
      price: 10
    };
    
    console.log('Using siteData for source:', source, siteData);
    console.log('Deployment test - updated stock-info API');
    
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