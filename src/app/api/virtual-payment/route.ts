import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-user"
import { PointsManager } from '@/lib/points'

// Virtual payment plans (matching frontend)
const VIRTUAL_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    points: 50,
    price: 9.99,
    description: '50 download points for premium stock media'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    points: 150,
    price: 24.99,
    description: '150 download points with priority support'
  },
  business: {
    id: 'business',
    name: 'Business',
    points: 500,
    price: 69.99,
    description: '500 download points with team collaboration'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('Virtual Payment - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log('Virtual Payment - Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, points, price, paymentMethod, simulateFailure, testMode } = await request.json()

    if (!planId || !points || !price || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields: planId, points, price, paymentMethod' 
      }, { status: 400 })
    }

    // Validate plan exists
    const plan = VIRTUAL_PLANS[planId as keyof typeof VIRTUAL_PLANS]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Validate plan data matches
    if (plan.points !== points || plan.price !== price) {
      return NextResponse.json({ 
        error: 'Plan data mismatch' 
      }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate payment validation
    const paymentValidation = await validateVirtualPayment(paymentMethod, price, simulateFailure, testMode)
    
    if (!paymentValidation.success) {
      return NextResponse.json({ 
        error: paymentValidation.error 
      }, { status: 400 })
    }

    // Add points to user account
    console.log('Adding points to user account:', {
      userId: session.user.id,
      points,
      planName: plan.name,
      paymentMethod
    })
    
    await PointsManager.addPoints(
      session.user.id,
      points,
      'PURCHASE',
      `Virtual payment: ${plan.name} - ${points} points via ${paymentMethod}`,
      undefined // No orderId for virtual payments
    )
    
    console.log('Points added successfully')

    // Log the virtual payment for testing purposes
    console.log(`Virtual Payment Processed:`, {
      userId: session.user.id,
      planId,
      points,
      price,
      paymentMethod,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Payment processed successfully',
      pointsAdded: points,
      planName: plan.name
    })

  } catch (error) {
    console.error('Virtual payment error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Simulate payment validation based on payment method
async function validateVirtualPayment(paymentMethod: string, amount: number, simulateFailure: boolean = false, testMode: boolean = false) {
  // Simulate different validation rules for different payment methods
  switch (paymentMethod) {
    case 'credit-card':
      // Simulate credit card validation
      if (amount > 100) {
        return { success: false, error: 'Credit card limit exceeded for this amount' }
      }
      break
    
    case 'paypal':
      // Simulate PayPal validation
      if (amount < 5) {
        return { success: false, error: 'Minimum amount for PayPal is $5.00' }
      }
      break
    
    case 'apple-pay':
      // Simulate Apple Pay validation
      if (amount > 50) {
        return { success: false, error: 'Apple Pay limit exceeded for this amount' }
      }
      break
    
    case 'google-pay':
      // Simulate Google Pay validation
      if (amount > 75) {
        return { success: false, error: 'Google Pay limit exceeded for this amount' }
      }
      break
    
    default:
      return { success: false, error: 'Invalid payment method' }
  }

  // Simulate payment failures based on user setting or random chance
  const randomChance = Math.random()
  const shouldFail = testMode ? false : (simulateFailure || randomChance < 0.05) // No random failures in test mode
  
  console.log('Payment validation:', {
    paymentMethod,
    amount,
    simulateFailure,
    randomChance,
    shouldFail
  })
  
  if (shouldFail) {
    console.log('Payment declined by processor (simulated)')
    return { 
      success: false, 
      error: 'Payment was declined by the payment processor' 
    }
  }

  return { success: true }
}
