import { NextRequest, NextResponse } from 'next/server';
import { parseStockMediaUrl } from '@/lib/url-parser';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE STOCK INFO API ===');
    
    const { url } = await request.json();
    console.log('URL received:', url);

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required and must be a string' 
      }, { status: 400 });
    }

    // Parse URL
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

    // Return mock data immediately (no database calls)
    return NextResponse.json({
      success: true,
      data: {
        id: id,
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
    console.error('Simple API Error:', error);
    return NextResponse.json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
