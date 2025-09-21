import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const api = new NehtwAPI(apiKey)
    
    // Test with the exact same data we're using
    const site = 'shutterstock'
    const id = '2467146017'
    const url = 'https://www.shutterstock.com/image-photo/aerial-sunset-view-skyline-london-skyscrapers-2467146017'

    console.log('Testing Nehtw API with:', { site, id, url })

    try {
      // Test getStockInfo first
      const stockInfo = await api.getStockInfo(site, id, url)
      console.log('Nehtw getStockInfo result:', stockInfo)

      // Test placeOrder
      const orderResult = await api.placeOrder(site, id, url)
      console.log('Nehtw placeOrder result:', orderResult)

      return NextResponse.json({
        success: true,
        tests: {
          getStockInfo: stockInfo,
          placeOrder: orderResult
        }
      })
    } catch (error) {
      console.error('Nehtw API test error:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tests: {
          getStockInfo: null,
          placeOrder: null
        }
      })
    }

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Failed to test Nehtw API' 
    }, { status: 500 })
  }
}
