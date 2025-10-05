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

    // STEP 1: Get stock info first to get the process_id and proper order URL
    const stockInfoUrl = `https://nehtw.com/api/stockinfo/${site}/${id}?url=${encodeURIComponent(url)}`
    console.log(`🔍 [Order ${requestId}] Getting stock info:`, stockInfoUrl)
    
    const stockInfoResponse = await fetch(stockInfoUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY,
        'User-Agent': 'StockMediaSaaS/1.0',
        'Accept': 'application/json'
      }
    })
    
    const stockInfoData = await stockInfoResponse.json()
    console.log(`📦 [Order ${requestId}] Stock info response:`, stockInfoData)
    
    if (!stockInfoData.success || !stockInfoData.data) {
      return NextResponse.json({ 
        error: 'Failed to get stock information',
        details: stockInfoData
      }, { status: 400 })
    }
    
    // STEP 2: Use the recommended order URL from nehtw
    const orderUrl = stockInfoData.data.actions?.order?.new_url || stockInfoData.data.actions?.order?.url
    
    if (!orderUrl) {
      console.error(`❌ [Order ${requestId}] No order URL provided by nehtw`)
      return NextResponse.json({ 
        error: 'No order URL available',
        details: stockInfoData.data
      }, { status: 400 })
    }
    
    console.log(`🛒 [Order ${requestId}] Placing order with nehtw URL:`, orderUrl)
    
    const orderResponse = await fetch(orderUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY,
        'User-Agent': 'StockMediaSaaS/1.0',
        'Accept': 'application/json'
      }
    })
    
    console.log(`📡 [Order ${requestId}] Order response status:`, orderResponse.status)
    
    const orderResponseText = await orderResponse.text()
    console.log(`📜 [Order ${requestId}] Raw order response:`, orderResponseText)
    
    let orderData
    try {
      orderData = JSON.parse(orderResponseText)
    } catch (parseError) {
      console.error(`❌ [Order ${requestId}] JSON parse error:`, parseError)
      return NextResponse.json({ 
        error: 'Invalid order response format',
        details: orderResponseText.substring(0, 500)
      }, { status: 500 })
    }
    
    console.log(`📦 [Order ${requestId}] Parsed order data:`, orderData)
    
    // Check if order was successful
    const taskId = orderData.taskid || orderData.task_id || stockInfoData.data.process_id
    
    if (orderData.success || taskId) {
      console.log(`✅ [Order ${requestId}] Order successful, taskId: ${taskId}`)
      
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
            description: `Downloaded from ${site} - Task: ${taskId}` // No metadata field in schema
          }
        })
      
      console.log(`💳 [Order ${requestId}] Points deducted and history created`)
      
      return NextResponse.json({
        success: true,
        taskId: taskId,
        message: 'Order placed successfully',
        processId: stockInfoData.data.process_id
      })
    } else {
      console.error(`❌ [Order ${requestId}] Order failed:`, orderData)
      return NextResponse.json({ 
        error: orderData.message || orderData.error || 'Failed to place order',
        details: orderData,
        orderUrl
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