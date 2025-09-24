import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    if (!url) return new NextResponse('Missing url', { status: 400 })
    const upstream = await fetch(url)
    if (!upstream.ok) return new NextResponse('Bad upstream', { status: 400 })
    const blob = await upstream.arrayBuffer()
    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    return new NextResponse(blob, { status: 200, headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=300' } })
  } catch (e) {
    return new NextResponse('Proxy error', { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch image: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to proxy image' 
    }, { status: 500 });
  }
}
