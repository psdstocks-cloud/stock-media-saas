export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { OrderProcessor } from '@/lib/order-processor'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Place order API called')
    
    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let userId = jwtUser?.id
    
    // Fallback to NextAuth session if no JWT user
    if (!userId) {
      const session = await auth()
      console.log('Session check:', { hasSession: !!session, userId: session?.user?.id })
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    const requestData = await request.json()
    console.log('Request data:', requestData)

    // Handle both single item and array of items
    const items = Array.isArray(requestData) ? requestData : [requestData]
    console.log('Processing items:', items.length)

    // Validate each item
    for (const item of items) {
      if (!item.url || !item.site || !item.id || !item.cost) {
        console.log('Missing required fields in item:', { 
          url: !!item.url, 
          site: !!item.site, 
          id: !!item.id, 
          cost: !!item.cost 
        })
        return NextResponse.json({ error: 'Missing required fields in item' }, { status: 400 })
      }
    }

    // Process each item individually
    const orders: any[] = []
    let totalCost = 0
    
    for (const item of items) {
      console.log(`Processing item: ${item.title}`)
      
      // Check if this item was already ordered (free download)
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: userId,
          stockItemId: item.id,
          status: { in: ['READY', 'COMPLETED'] }
        },
        include: { stockSite: true }
      })

      if (existingOrder) {
        console.log('Existing order found - providing free download')
        orders.push({
          id: existingOrder.id,
          status: existingOrder.status,
          title: existingOrder.title,
          cost: 0, // Free download
          createdAt: existingOrder.createdAt,
          downloadUrl: existingOrder.downloadUrl,
          stockSite: existingOrder.stockSite,
          isRedownload: true
        })
        continue // Skip to next item
      }
      
      // Add to total cost for new items
      totalCost += item.cost
    }

    // Check user balance for new orders (only if we have new items to purchase)
    if (totalCost > 0) {
      console.log('Checking user balance for new orders...')
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { pointsBalance: true }
      })
      console.log('User found:', { user: !!user, pointsBalance: !!user?.pointsBalance })

      if (!user || !user.pointsBalance) {
        console.log('User not found or no points balance')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      console.log('User points:', { current: user.pointsBalance.currentPoints, required: totalCost })
      if (user.pointsBalance.currentPoints < totalCost) {
        return NextResponse.json({ 
          error: 'Insufficient points', 
          currentPoints: user.pointsBalance.currentPoints,
          requiredPoints: totalCost
        }, { status: 400 })
      }
    }

    // Process new items (create orders and deduct points)
    const newItems = items.filter(item => {
      return !orders.some(order => order.stockSite?.name === item.site && order.title === item.title)
    })
    
    if (newItems.length > 0) {
      console.log(`Creating ${newItems.length} new orders...`)
      
      // Deduct points for all new items at once
      if (totalCost > 0) {
        console.log(`Deducting ${totalCost} points from user balance...`)
        await PointsManager.deductPoints(userId, totalCost, 'Order purchase', `Purchased ${newItems.length} items`)
        console.log('Points deducted successfully using PointsManager')
      }
      
      // Create orders for new items
      for (const item of newItems) {
        console.log(`Creating order for: ${item.title}`)
        
        // Find or create stock site for this item
        let stockSite = await prisma.stockSite.findFirst({
          where: { name: item.site }
        })

        if (!stockSite) {
          console.log(`Creating new stock site: ${item.site}`)
          stockSite = await prisma.stockSite.create({
            data: {
              name: item.site,
              displayName: item.site.charAt(0).toUpperCase() + item.site.slice(1),
              cost: item.cost,
              category: 'images',
              isActive: true
            }
          })
        }
        
        // Create the order
        const order = await prisma.order.create({
          data: {
            userId: userId,
            stockSiteId: stockSite.id,
            stockItemId: item.id,
            title: item.title,
            cost: item.cost,
            status: 'PENDING',
            imageUrl: item.imageUrl
          }
        })
        
        orders.push({
          id: order.id,
          status: order.status,
          title: order.title,
          cost: order.cost,
          createdAt: order.createdAt,
          stockSite: stockSite,
          isRedownload: false
        })
        
        console.log(`Order created: ${order.id}`)
      }
    }
    
    // TODO: Start processing for new orders
    // This will be implemented in the next step with proper OrderProcessor integration

    // Return all orders (both new and redownloads)
    const response = {
      success: true,
      orders: orders,
      summary: {
        total: orders.length,
        new: orders.filter(o => !o.isRedownload).length,
        redownloads: orders.filter(o => o.isRedownload).length,
        totalCost: totalCost
      }
    }
    
    console.log('Order processing completed:', response.summary)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Place order error:', error)
    return NextResponse.json({ 
      error: 'Failed to place order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}