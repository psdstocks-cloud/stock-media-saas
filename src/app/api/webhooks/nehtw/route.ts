import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all headers from the request
    const headers = Object.fromEntries(request.headers.entries())
    
    // Extract Nehtw-specific headers
    const eventName = headers['x-neh-event_name']
    const status = headers['x-neh-status']
    const orderId = headers['x-neh-order_id'] || headers['x-neh-task_id']
    const downloadUrl = headers['x-neh-download_url']
    const error = headers['x-neh-error']
    
    console.log('Nehtw webhook received:', {
      eventName,
      status,
      orderId,
      downloadUrl,
      error,
      allHeaders: headers
    })

    // Handle different event types
    switch (eventName) {
      case 'download_status_changed':
        await handleDownloadStatusChanged(orderId, status, downloadUrl, error)
        break
      
      case 'account_status_changed':
        await handleAccountStatusChanged(status, headers)
        break
      
      default:
        console.log(`Unhandled event type: ${eventName}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: eventName,
      status: status
    })
  } catch (error) {
    console.error('Nehtw webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    )
  }
}

/**
 * Handle download status changes
 */
async function handleDownloadStatusChanged(
  orderId: string | undefined, 
  status: string | undefined, 
  downloadUrl: string | undefined, 
  error: string | undefined
) {
  if (!orderId) {
    console.error('No order ID provided in webhook')
    return
  }

  try {
    // Find the order in our database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order) {
      console.error(`Order ${orderId} not found in database`)
      return
    }

    // Update order status based on Nehtw status
    let newStatus = order.status
    let updateData: any = {}

    switch (status) {
      case 'completed':
      case 'success':
        newStatus = 'COMPLETED'
        updateData = {
          status: newStatus,
          downloadUrl: downloadUrl,
          completedAt: new Date()
        }
        break
      
      case 'failed':
      case 'error':
        newStatus = 'FAILED'
        updateData = {
          status: newStatus,
          error: error || 'Download failed'
        }
        // Refund points to user
        await refundOrderPoints(order.userId, order.cost)
        break
      
      case 'processing':
      case 'in_progress':
        newStatus = 'PROCESSING'
        updateData = { status: newStatus }
        break
      
      case 'cancelled':
        newStatus = 'CANCELLED'
        updateData = { status: newStatus }
        // Refund points to user
        await refundOrderPoints(order.userId, order.cost)
        break
      
      default:
        console.log(`Unknown status: ${status}`)
        return
    }

    // Update the order
    await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    console.log(`Order ${orderId} updated to status: ${newStatus}`)

    // Send notification to user if completed or failed
    if (newStatus === 'COMPLETED' && downloadUrl) {
      await notifyUserDownloadReady(order.user.email, orderId, downloadUrl)
    } else if (newStatus === 'FAILED') {
      await notifyUserDownloadFailed(order.user.email, orderId, error || 'Unknown error')
    }

  } catch (error) {
    console.error(`Error processing download status for order ${orderId}:`, error)
  }
}

/**
 * Handle account status changes
 */
async function handleAccountStatusChanged(status: string | undefined, headers: Record<string, string>) {
  console.log('Account status changed:', { status, headers })
  
  // Log account status changes for monitoring
  // You might want to store this in a separate table for analytics
  console.log(`Nehtw account status: ${status}`)
  
  // Handle specific account statuses
  switch (status) {
    case 'daily_limit_reached':
      console.log('Daily download limit reached')
      // You might want to notify admins or implement rate limiting
      break
    
    case 'account_suspended':
      console.log('Nehtw account suspended')
      // Critical: notify admins immediately
      await notifyAdminsAccountSuspended(headers)
      break
    
    case 'account_reactivated':
      console.log('Nehtw account reactivated')
      break
    
    default:
      console.log(`Unknown account status: ${status}`)
  }
}

/**
 * Refund points to user when order fails or is cancelled
 */
async function refundOrderPoints(userId: string, points: number) {
  try {
    await prisma.pointsBalance.upsert({
      where: { userId },
      update: {
        currentPoints: {
          increment: points
        }
      },
      create: {
        userId,
        currentPoints: points
      }
    })

    // Add transaction record
    await prisma.pointsHistory.create({
      data: {
        userId,
        amount: points,
        type: 'REFUND',
        description: `Refund for cancelled/failed order`
      }
    })

    console.log(`Refunded ${points} points to user ${userId}`)
  } catch (error) {
    console.error(`Error refunding points to user ${userId}:`, error)
  }
}

/**
 * Notify user when download is ready
 */
async function notifyUserDownloadReady(userEmail: string, orderId: string, downloadUrl: string) {
  // TODO: Implement email notification
  console.log(`Download ready for user ${userEmail}, order ${orderId}`)
  console.log(`Download URL: ${downloadUrl}`)
  
  // You can integrate with your email service here
  // await sendEmail(userEmail, 'Download Ready', `Your download is ready: ${downloadUrl}`)
}

/**
 * Notify user when download fails
 */
async function notifyUserDownloadFailed(userEmail: string, orderId: string, error: string) {
  // TODO: Implement email notification
  console.log(`Download failed for user ${userEmail}, order ${orderId}`)
  console.log(`Error: ${error}`)
  
  // You can integrate with your email service here
  // await sendEmail(userEmail, 'Download Failed', `Your download failed: ${error}`)
}

/**
 * Notify admins when Nehtw account is suspended
 */
async function notifyAdminsAccountSuspended(headers: Record<string, string>) {
  // TODO: Implement admin notification
  console.log('CRITICAL: Nehtw account suspended!')
  console.log('Headers:', headers)
  
  // You can integrate with Slack, Discord, or email here
  // await sendSlackAlert('Nehtw account suspended', headers)
}