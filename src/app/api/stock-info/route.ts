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
        id: assetId,
        source: source,
        title: `${source.charAt(0).toUpperCase() + source.slice(1)} Image`,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        points: 10,
        price: 10,
        stockSite: {
          name: source,
          displayName: source.charAt(0).toUpperCase() + source.slice(1),
          cost: 10
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

    // Return mock data immediately (bypassing database and external API calls)
    console.log('Returning mock data for source:', source);
    
    return NextResponse.json({
      success: true,
      data: {
        id: id,
        source: source,
        title: `${source.charAt(0).toUpperCase() + source.slice(1)} Image`,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        points: 10, // Unified pricing
        price: 10,
        stockSite: {
          name: source,
          displayName: source.charAt(0).toUpperCase() + source.slice(1),
          cost: 10
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