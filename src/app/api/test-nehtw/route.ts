import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const api = new NehtwAPI(apiKey)
    
    // Test different URL formats to see which one works
    const testCases = [
      {
        name: 'Original URL',
        site: 'shutterstock',
        id: '2467146017',
        url: 'https://www.shutterstock.com/image-photo/aerial-sunset-view-skyline-london-skyscrapers-2467146017'
      },
      {
        name: 'Short URL',
        site: 'shutterstock',
        id: '2467146017',
        url: 'https://shutterstock.com/image-photo/aerial-sunset-view-skyline-london-skyscrapers-2467146017'
      },
      {
        name: 'Minimal URL',
        site: 'shutterstock',
        id: '2467146017',
        url: 'https://shutterstock.com/image-photo/2467146017'
      },
      {
        name: 'ID Only URL',
        site: 'shutterstock',
        id: '2467146017',
        url: 'https://shutterstock.com/2467146017'
      },
      {
        name: 'No URL (null)',
        site: 'shutterstock',
        id: '2467146017',
        url: null
      },
      {
        name: 'Empty URL',
        site: 'shutterstock',
        id: '2467146017',
        url: ''
      }
    ]

    const results = []

    for (const testCase of testCases) {
      console.log(`\n=== Testing ${testCase.name} ===`)
      console.log('Test data:', testCase)

      try {
        // Test getStockInfo
        const stockInfo = await api.getStockInfo(testCase.site, testCase.id, testCase.url || undefined)
        console.log(`${testCase.name} - getStockInfo SUCCESS:`, stockInfo)

        // Test placeOrder
        const orderResult = await api.placeOrder(testCase.site, testCase.id, testCase.url || undefined)
        console.log(`${testCase.name} - placeOrder SUCCESS:`, orderResult)

        results.push({
          testCase: testCase.name,
          success: true,
          getStockInfo: stockInfo,
          placeOrder: orderResult
        })

      } catch (error) {
        console.log(`${testCase.name} - ERROR:`, error instanceof Error ? error.message : 'Unknown error')
        results.push({
          testCase: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          getStockInfo: null,
          placeOrder: null
        })
      }
    }

    // Also test API key validation
    console.log('\n=== Testing API Key ===')
    try {
      // Try a simple request to see if API key is valid
      const testResponse = await fetch('https://nehtw.com/api/test', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('API Key test response status:', testResponse.status)
    } catch (error) {
      console.log('API Key test error:', error)
    }

    return NextResponse.json({
      success: true,
      apiKeyConfigured: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      testResults: results,
      summary: {
        totalTests: results.length,
        successfulTests: results.filter(r => r.success).length,
        failedTests: results.filter(r => !r.success).length
      }
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to test Nehtw API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
