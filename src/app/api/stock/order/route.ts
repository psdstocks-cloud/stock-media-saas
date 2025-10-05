import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { site, id, url, cost } = await request.json()
    
    if (!site || !id || !url || cost === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    console.log('Order request:', { site, id, url, cost })
    
    // Check user points
    const pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })
    
    if (!pointsBalance || pointsBalance.currentPoints < cost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Place order with nehtw.com - use correct URL format
    const nehtwUrl = `https://nehtw.com/api/stockorder/${site}/${id}?url=${encodeURIComponent(url)}`
    console.log('Calling nehtw API:', nehtwUrl)
    
    const nehtwResponse = await fetch(nehtwUrl, {
      method: 'GET', // nehtw API uses GET method
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    console.log('nehtw API response:', nehtwData)
    
    if (nehtwData.success && nehtwData.taskid) {
      // Deduct points - use correct field names
      await prisma.pointsBalance.update({
        where: { userId: user.id },
        data: {
          currentPoints: pointsBalance.currentPoints - cost,
          totalSpent: pointsBalance.totalSpent + cost, // Use totalSpent not totalUsed
          lastUpdated: new Date()
        }
      })
      
      // Create points history - use correct field names
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          points: -cost, // Use points not amount
          type: 'SPENT',
          description: `Downloaded from ${site} - Task: ${nehtwData.taskid}`,
          metadata: {
            taskId: nehtwData.taskid,
            site,
            stockId: id,
            url
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        taskId: nehtwData.taskid // nehtw returns taskid, we return taskId
      })
    } else {
      console.error('nehtw API error:', nehtwData)
      return NextResponse.json({ 
        error: nehtwData.message || nehtwData.data || 'Failed to place order',
        details: nehtwData
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock order error:', error)
    return NextResponse.json({ 
      error: 'Failed to place order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
