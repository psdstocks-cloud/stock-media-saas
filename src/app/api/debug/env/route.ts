import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL
    const nodeEnv = process.env.NODE_ENV
    
    return NextResponse.json({
      success: true,
      hasDatabaseUrl: !!databaseUrl,
      databaseUrlLength: databaseUrl?.length || 0,
      databaseUrlStart: databaseUrl?.substring(0, 20) || 'N/A',
      nodeEnv,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB'))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
