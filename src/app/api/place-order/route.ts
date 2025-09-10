import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NehtwAPI, OrderManager } from '@/lib/nehtw-api'
import { OrderProcessor } from '@/lib/order-processor'
import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'

export async function POST(request: NextRequest) {
  try {
    console.log('Place order API called')
    
    const session = await getServerSession(authOptions)
    console.log('Session check:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, site, id, title, cost, imageUrl } = await request.json()
    console.log('Request data:', { url, site, id, title, cost, imageUrl })

    if (!url || !site || !id || !cost) {
      console.log('Missing required fields:', { url: !!url, site: !!site, id: !!id, cost: !!cost })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if this item was already ordered (free download)
    console.log('Checking for existing order...')
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        stockItemId: id,
        status: { in: ['READY', 'COMPLETED'] }
      },
      include: { stockSite: true }
    })

    if (existingOrder) {
      console.log('Existing order found - providing free download')
      return NextResponse.json({
        success: true,
        existingOrder: true,
        order: {
          id: existingOrder.id,
          status: existingOrder.status,
          title: existingOrder.title,
          cost: existingOrder.cost,
          createdAt: existingOrder.createdAt,
          downloadUrl: existingOrder.downloadUrl,
          stockSite: existingOrder.stockSite
        },
        message: 'You have already ordered this item. Download is free!'
      })
    }

    // Check user balance for new orders
    console.log('Checking user balance for new order...')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { pointsBalance: true }
    })
    console.log('User found:', { user: !!user, pointsBalance: !!user?.pointsBalance })

    if (!user || !user.pointsBalance) {
      console.log('User not found or no points balance')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User points:', { current: user.pointsBalance.currentPoints, required: cost })
    if (user.pointsBalance.currentPoints < cost) {
      return NextResponse.json({ 
        error: 'Insufficient points', 
        currentPoints: user.pointsBalance.currentPoints,
        requiredPoints: cost
      }, { status: 400 })
    }

    // Find or create stock site
    console.log('Finding or creating stock site for:', site)
    let stockSite
    try {
      console.log('Attempting to find stock site with name:', site)
      stockSite = await prisma.stockSite.findFirst({
        where: { name: site }
      })
      console.log('Stock site found:', { found: !!stockSite, id: stockSite?.id, name: stockSite?.name })

      if (!stockSite) {
        console.log('Creating new stock site with data:', {
          name: site,
          displayName: site.charAt(0).toUpperCase() + site.slice(1),
          cost: cost,
          category: 'images',
          isActive: true
        })
        // Create stock site if it doesn't exist
        stockSite = await prisma.stockSite.create({
          data: {
            name: site,
            displayName: site.charAt(0).toUpperCase() + site.slice(1),
            cost: cost,
            category: 'images',
            isActive: true
          }
        })
        console.log('Stock site created successfully:', { id: stockSite.id, name: stockSite.name })
      }
    } catch (error) {
      console.error('Error with stock site operations:', error)
      console.error('Stock site error details:', {
        site,
        cost,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }

    // Validate all parameters before creating order
    if (!session.user.id) {
      console.log('ERROR: session.user.id is null or undefined')
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    
    if (!stockSite.id) {
      console.log('ERROR: stockSite.id is null or undefined')
      return NextResponse.json({ error: 'Invalid stock site' }, { status: 400 })
    }
    
    if (!id) {
      console.log('ERROR: id is null or undefined')
      return NextResponse.json({ error: 'Invalid stock item ID' }, { status: 400 })
    }

    // Create order in database
    console.log('Creating order in database...')
    console.log('OrderManager.createOrder parameters:', {
      userId: session.user.id,
      userIdLength: session.user.id?.length,
      userIdType: typeof session.user.id,
      stockSiteId: stockSite.id,
      stockSiteIdLength: stockSite.id?.length,
      stockSiteIdType: typeof stockSite.id,
      stockItemId: id,
      stockItemIdLength: id?.length,
      stockItemIdType: typeof id,
      stockItemUrl: url,
      stockItemUrlLength: url?.length,
      stockItemUrlType: typeof url,
      title: title || 'Untitled',
      titleLength: (title || 'Untitled')?.length,
      titleType: typeof (title || 'Untitled'),
      cost: cost,
      costType: typeof cost
    })
    
    console.log('🔍 DEBUG: Stock Item ID from API:', {
      id,
      idType: typeof id,
      idLength: id?.length,
      idValue: JSON.stringify(id)
    })
    
    const order = await OrderManager.createOrder(
      session.user.id,
      stockSite.id,
      id,
      url,
      title || 'Untitled',
      cost,
      imageUrl || null
    )
    console.log('Order created:', { id: order.id, status: order.status })

    // Deduct points using PointsManager (proper transaction handling)
    console.log('Deducting points using PointsManager...')
    await PointsManager.deductPoints(
      session.user.id,
      cost,
      `Download: ${title || 'Untitled'} from ${site}`,
      order.id
    )
    console.log('Points deducted successfully using PointsManager')

    // Start real-time order processing
    const apiKey = process.env.NEHTW_API_KEY
    if (!apiKey) {
      console.log('NEHTW_API_KEY not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    console.log('Starting real-time order processing for order:', order.id, 'with site:', site, 'id:', id)

    // Start processing in background (don't await)
    OrderProcessor.startProcessing(order.id, apiKey, site, id, url).catch(error => {
      console.error('Background order processing failed:', error)
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        title: order.title,
        cost: order.cost,
        createdAt: order.createdAt
      }
    })
  } catch (error) {
    console.error('Place order error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
