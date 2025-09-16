import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { reviewSchema, sanitizeString } from '@/lib/validation'
import { csrfMiddleware } from '@/lib/csrf'

// Get reviews with privacy protection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rating = searchParams.get('rating')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      isApproved: true,
      isPublished: true
    }

    if (rating && rating !== 'all') {
      where.rating = parseInt(rating)
    }

    if (industry && industry !== 'all') {
      where.industry = {
        contains: industry,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          role: true,
          industry: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          isVerified: true,
          helpfulCount: true,
          metrics: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // Calculate aggregate stats
    const stats = await prisma.review.aggregate({
      where: { isApproved: true, isPublished: true },
      _avg: { rating: true },
      _count: { id: true }
    })

    const fiveStarCount = await prisma.review.count({
      where: { 
        isApproved: true, 
        isPublished: true, 
        rating: 5 
      }
    })

    return NextResponse.json({
      reviews: reviews.map(review => ({
        ...review,
        date: review.createdAt.toISOString().split('T')[0],
        name: review.displayName,
        verified: review.isVerified,
        helpful: review.helpfulCount
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
        fiveStarReviews: fiveStarCount
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// Submit a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate CSRF token
    const csrfCheck = csrfMiddleware(request)
    if (!csrfCheck.isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Extract behavior data for spam detection
    const { behaviorData, ...reviewData } = body
    
    // Validate review data
    const validatedData = reviewSchema.parse(reviewData)
    
    // Enhanced spam detection
    if (behaviorData) {
      // Check if user spent enough time on form
      if (behaviorData.timeOnPage < 30) {
        return NextResponse.json(
          { error: 'Please take your time to fill out the form properly' },
          { status: 400 }
        )
      }
      
      // Check if user interacted enough
      if (behaviorData.keystrokes < 20 || behaviorData.mouseMovements < 10) {
        return NextResponse.json(
          { error: 'Please interact with the form properly' },
          { status: 400 }
        )
      }
      
      // Check spam score
      if (behaviorData.spamScore > 50) {
        return NextResponse.json(
          { error: 'Your review appears to be spam. Please write a genuine review.' },
          { status: 400 }
        )
      }
    }
    
    // Sanitize all inputs
    const sanitizedData = {
      displayName: validatedData.displayName ? sanitizeString(validatedData.displayName) : 'Anonymous',
      role: validatedData.role ? sanitizeString(validatedData.role) : 'User',
      industry: validatedData.industry ? sanitizeString(validatedData.industry) : 'General',
      title: sanitizeString(validatedData.title),
      content: validatedData.content ? sanitizeString(validatedData.content) : sanitizeString(validatedData.comment),
      rating: validatedData.rating,
      metrics: validatedData.metrics ? {
        downloadsSaved: validatedData.metrics.downloadsSaved || 0,
        timeSaved: validatedData.metrics.timeSaved ? sanitizeString(validatedData.metrics.timeSaved) : undefined,
        costSavings: validatedData.metrics.costSavings || 0
      } : null
    }

    // Check if user has already submitted a review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        isApproved: { not: false } // Include pending reviews
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review' },
        { status: 400 }
      )
    }

    // Check if user has made any orders (for verification)
    const userOrders = await prisma.order.count({
      where: { userId: session.user.id }
    })

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        displayName: sanitizedData.displayName,
        role: sanitizedData.role,
        industry: sanitizedData.industry,
        title: sanitizedData.title,
        content: sanitizedData.content,
        rating: sanitizedData.rating,
        metrics: sanitizedData.metrics || undefined,
        isVerified: userOrders > 0,
        isApproved: false, // Requires moderation
        isPublished: false,
        helpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Log review submission for moderation
    console.log('New review submitted for moderation:', {
      reviewId: review.id,
      userId: session.user.id,
      displayName: sanitizedData.displayName,
      rating: sanitizedData.rating,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be published after moderation.',
      reviewId: review.id
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    
    if (error.errors) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
