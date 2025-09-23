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
      if (!item.url || !item.site || !item.id || item.cost === undefined || item.cost === null) {
        console.log('Missing required fields in item:', { 
          url: !!item.url, 
          site: !!item.site, 
          id: !!item.id, 
          cost: item.cost 
        })
        return NextResponse.json({ error: 'Missing required fields in item' }, { status: 400 })
      }
    }

    const createdOrders: any[] = []
    const errors: any[] = []

    // Process each item individually with transactions
    for (const item of items) {
      console.log(`Processing item: ${item.title}`)
      
      try {
        // Check if this item was already ordered (free download)
        // CORRECTED: Only check for truly completed orders, not pending ones
        const existingOrder = await prisma.order.findFirst({
          where: {
            userId: userId,
            stockItemId: item.id,
            status: { in: ['READY', 'COMPLETED'] }
          },
          include: { stockSite: true }
        })

        if (existingOrder) {
          console.log('Existing completed order found - providing free download')
          createdOrders.push({
            id: existingOrder.id,
            status: existingOrder.status,
            title: `${existingOrder.title} (Re-download)`,
            cost: 0, // Free download
            createdAt: existingOrder.createdAt,
            downloadUrl: existingOrder.downloadUrl,
            stockSite: existingOrder.stockSite,
            isRedownload: true
          })
          continue // Skip to next item
        }

        // Check user balance for this item
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { pointsBalance: true }
        })

        if (!user || !user.pointsBalance) {
          errors.push({ url: item.url, error: 'User not found' })
          continue
        }

        if (user.pointsBalance.currentPoints < item.cost) {
          errors.push({ url: item.url, error: 'Insufficient points' })
          continue
        }
        
        // --- Start Transaction for each item ---
        const transactionResult = await prisma.$transaction(async (tx) => {
          // 1. Find or create stock site
          let stockSite = await tx.stockSite.findFirst({
            where: { name: item.site }
          })

          if (!stockSite) {
            console.log(`Creating new stock site: ${item.site}`)
            stockSite = await tx.stockSite.create({
              data: {
                name: item.site,
                displayName: item.site.charAt(0).toUpperCase() + item.site.slice(1),
                cost: item.cost,
                category: 'images',
                isActive: true
              }
            })
          }

          // 2. Create the Order first to get a valid ID
          const newOrder = await tx.order.create({
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

          // 3. Deduct points and create history record using the new order's ID
          await PointsManager.deductPoints(
            userId, 
            item.cost, 
            `Purchase of ${item.title}`, 
            newOrder.id, 
            tx
          )

          return { order: newOrder, stockSite }
        })
        // --- End Transaction ---

        createdOrders.push({
          id: transactionResult.order.id,
          status: transactionResult.order.status,
          title: transactionResult.order.title,
          cost: transactionResult.order.cost,
          createdAt: transactionResult.order.createdAt,
          stockSite: transactionResult.stockSite,
          isRedownload: false
        })

        console.log(`Order created successfully: ${transactionResult.order.id}`)

        // Asynchronously process the order after it has been successfully created
        const { OrderProcessor } = await import('@/lib/order-processor')
        const apiKey = process.env.NEHTW_API_KEY || 'A8K9bV5s2OX12E8cmS4I96mtmSNzv7'
        OrderProcessor.startProcessing(transactionResult.order.id, apiKey, item.site, item.id, item.url).catch(console.error)

      } catch (error) {
        console.error(`Failed to process order for ${item.url}:`, error)
        errors.push({ url: item.url, error: 'An internal error occurred during transaction.' })
      }
    }

    // Handle response based on results
    if (createdOrders.length === 0 && errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'All orders failed.', 
        details: errors 
      }, { status: 500 })
    }

    const response = {
      success: true,
      orders: createdOrders,
      errors: errors,
      summary: {
        total: createdOrders.length,
        new: createdOrders.filter(o => !o.isRedownload).length,
        redownloads: createdOrders.filter(o => o.isRedownload).length,
        errors: errors.length
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