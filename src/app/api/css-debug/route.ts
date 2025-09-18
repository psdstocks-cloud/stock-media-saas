import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
    request: {
      url: request.url,
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        accept: request.headers.get('accept'),
      }
    },
    build: {
      buildTime: process.env.BUILD_TIME || 'Not set',
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'Not set',
    }
  };

  console.log('🔍 CSS Debug API called:', debugInfo);

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
