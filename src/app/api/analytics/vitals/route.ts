import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const vitals = await request.json()

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vitals:', vitals)
    }

    // In production, send to your analytics service
    // Examples:
    // - Send to Google Analytics
    // - Send to Mixpanel
    // - Send to custom database
    // - Send to Vercel Analytics (handled automatically)

    /* Example: Save to database
    await prisma.webVital.create({
      data: {
        name: vitals.name,
        value: vitals.value,
        rating: vitals.rating,
        delta: vitals.delta,
        id: vitals.id,
        navigationType: vitals.navigationType,
        timestamp: new Date(),
      },
    })
    */

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

// Handle GET requests (for health check)
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'vitals',
    description: 'Web Vitals analytics endpoint'
  })
}
