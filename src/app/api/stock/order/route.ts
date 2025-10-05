import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let requestId = Date.now().toString(36)
  
  try {
    console.log(`🔄 [Order ${requestId}] Starting order process`)
    
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      console.log(`❌ [Order ${requestId}] Authentication failed`)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { site, id, url, cost } = body
    
    console.log(`📋 [Order ${requestId}] Request data:`, { site, id, url, cost, userId: user.id })
    
    if (!site || !id || !url || cost === undefined) {
      console.log(`❌ [Order ${requestId}] Missing required parameters`)
      return NextResponse.json({ 
        error: 'Missing required parameters',
        received: { site, id, url, cost }
      }, { status: 400 })
    }
    
    // Check user points
    const pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })
    
    console.log(`💰 [Order ${requestId}] User points:`, {
      current: pointsBalance?.currentPoints || 0,
      required: cost
    })
    
    if (!pointsBalance || pointsBalance.currentPoints < cost) {
      return NextResponse.json({ 
        error: 'Insufficient points',
        current: pointsBalance?.currentPoints || 0,
        required: cost
      }, { status: 400 })
    }

    // Check if API key exists
    if (!process.env.NEHTW_API_KEY) {
      console.error(`❌ [Order ${requestId}] NEHTW_API_KEY not configured`)
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    // Place order with nehtw.com
    const nehtwUrl = `https://nehtw.com/api/stockorder/${site}/${id}?url=${encodeURIComponent(url)}`
    console.log(`🌐 [Order ${requestId}] Calling nehtw API:`, nehtwUrl)
    
    const nehtwResponse = await fetch(nehtwUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY,
        'User-Agent': 'StockMediaSaaS/1.0',
        'Accept': 'application/json'
      }
    })
    
    console.log(`📡 [Order ${requestId}] nehtw response status:`, nehtwResponse.status)
    
    // Log response headers for debugging
    const responseHeaders = Object.fromEntries(nehtwResponse.headers.entries())
    console.log(`📄 [Order ${requestId}] Response headers:`, responseHeaders)
    
    const responseText = await nehtwResponse.text()
    console.log(`📜 [Order ${requestId}] Raw response:`, responseText)
    
    let nehtwData
    try {
      nehtwData = JSON.parse(responseText)
    } catch (parseError) {
      console.error(`❌ [Order ${requestId}] JSON parse error:`, parseError)
      return NextResponse.json({ 
        error: 'Invalid API response format',
        details: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
      }, { status: 500 })
    }
    
    console.log(`📦 [Order ${requestId}] Parsed nehtw data:`, nehtwData)
    
    if (nehtwData.success && nehtwData.taskid) {
      console.log(`✅ [Order ${requestId}] Order successful, taskid: ${nehtwData.taskid}`)
      
      // Deduct points - use correct field names from Prisma schema
      await prisma.pointsBalance.update({
        where: { userId: user.id },
        data: {
          currentPoints: pointsBalance.currentPoints - cost,
          totalUsed: pointsBalance.totalUsed + cost, // Use totalUsed (correct field name)
          lastRollover: new Date() // Use lastRollover (correct field name)
        }
      })
      
      // Create points history - use correct field names from Prisma schema
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: -cost, // Use amount (correct field name)
          type: 'SPENT',
          description: `Downloaded from ${site} - Task: ${nehtwData.taskid}` // No metadata field in schema
        }
      })
      
      console.log(`💳 [Order ${requestId}] Points deducted and history created`)
      
      return NextResponse.json({
        success: true,
        taskId: nehtwData.taskid,
        message: 'Order placed successfully'
      })
    } else {
      console.error(`❌ [Order ${requestId}] nehtw API error:`, nehtwData)
      
      // Handle specific error cases
      if (nehtwData.message && nehtwData.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          error: 'API authentication failed',
          details: 'Please contact support'
        }, { status: 500 })
      }
      
      if (nehtwData.message && nehtwData.message.includes('not found')) {
        return NextResponse.json({ 
          error: 'Stock media not found',
          details: 'The requested stock media could not be found'
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: nehtwData.message || nehtwData.data || 'Failed to place order',
        details: nehtwData,
        nehtwSuccess: nehtwData.success
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error(`💥 [Order ${requestId}] Unexpected error:`, error)
    return NextResponse.json({ 
      error: 'Failed to place order',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'internal_error'
    }, { status: 500 })
  }
}