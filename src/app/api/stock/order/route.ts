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
    
    if (!site || !id || !url || !cost) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    // Check user points
    const pointsBalance = await prisma.pointsBalance.findUnique({
      where: { userId: user.id }
    })
    
    if (!pointsBalance || pointsBalance.currentPoints < cost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Place order with nehtw.com
    const nehtwResponse = await fetch(`https://nehtw.com/api/stockorder/${site}/${id}?url=${encodeURIComponent(url)}`, {
      headers: {
        'X-Api-Key': process.env.NEHTW_API_KEY || ''
      }
    })
    
    const nehtwData = await nehtwResponse.json()
    
    if (nehtwData.success) {
      // Deduct points
      await prisma.pointsBalance.update({
        where: { userId: user.id },
        data: {
          currentPoints: pointsBalance.currentPoints - cost,
          totalUsed: pointsBalance.totalUsed + cost,
          lastRollover: new Date()
        }
      })
      
      // Create points history
      await prisma.pointsHistory.create({
        data: {
          userId: user.id,
          amount: -cost,
          type: 'SPENT',
          description: `Downloaded from ${site} - Task: ${nehtwData.taskid}`
        }
      })
      
      return NextResponse.json({
        success: true,
        taskId: nehtwData.taskid
      })
    } else {
      return NextResponse.json({ error: nehtwData.message || 'Failed to place order' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Stock order error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
