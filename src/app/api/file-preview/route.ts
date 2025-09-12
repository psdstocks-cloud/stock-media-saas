import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StockAPI } from '@/lib/stock-api'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Getting file preview for URL:', url)

    // Get file preview information
    const fileInfo = await StockAPI.getFilePreview(url)

    if (!fileInfo) {
      return NextResponse.json({ 
        error: 'Failed to extract file information from URL' 
      }, { status: 400 })
    }

    console.log('File preview result:', fileInfo)

    return NextResponse.json({
      success: true,
      fileInfo
    })

  } catch (error) {
    console.error('Error getting file preview:', error)
    return NextResponse.json({ 
      error: 'Failed to get file preview' 
    }, { status: 500 })
  }
}
