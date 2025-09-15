import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 DEBUG: Testing complete verification flow...')
    
    const testEmail = 'psdstockss@gmail.com'
    
    // Step 1: Clear any existing tokens
    console.log('🧹 Step 1: Clearing existing verification tokens...')
    await prisma.verificationToken.deleteMany({
      where: { identifier: testEmail }
    })
    
    // Step 2: Create a test verification token
    console.log('🔍 Step 2: Creating test verification token...')
    const testToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: testEmail,
        token: testToken,
        expires: expires
      }
    })
    
    console.log('✅ Verification token created:', {
      token: `${verificationToken.token.substring(0, 10)}...`,
      expires: verificationToken.expires,
      isExpired: new Date() > verificationToken.expires
    })
    
    // Step 3: Test token retrieval
    console.log('🔍 Step 3: Testing token retrieval...')
    const retrievedToken = await prisma.verificationToken.findFirst({
      where: { 
        identifier: testEmail,
        token: testToken
      }
    })
    
    if (!retrievedToken) {
      return NextResponse.json({
        success: false,
        error: 'Token retrieval failed',
        step: 'token_retrieval'
      }, { status: 500 })
    }
    
    console.log('✅ Token retrieved successfully')
    
    // Step 4: Test compound unique constraint
    console.log('🔍 Step 4: Testing compound unique constraint...')
    try {
      // This should fail due to unique constraint
      await prisma.verificationToken.create({
        data: {
          identifier: testEmail,
          token: testToken, // Same token
          expires: new Date(Date.now() + 5 * 60 * 1000)
        }
      })
      
      return NextResponse.json({
        success: false,
        error: 'Unique constraint not working properly',
        step: 'unique_constraint'
      }, { status: 500 })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log('✅ Unique constraint working correctly')
      } else {
        throw error
      }
    }
    
    // Step 5: Test token deletion (simulate NextAuth cleanup)
    console.log('🔍 Step 5: Testing token deletion...')
    await prisma.verificationToken.delete({
      where: { 
        identifier_token: {
          identifier: testEmail,
          token: testToken
        }
      }
    })
    
    // Verify deletion
    const deletedToken = await prisma.verificationToken.findFirst({
      where: { 
        identifier: testEmail,
        token: testToken
      }
    })
    
    if (deletedToken) {
      return NextResponse.json({
        success: false,
        error: 'Token deletion failed',
        step: 'token_deletion'
      }, { status: 500 })
    }
    
    console.log('✅ Token deleted successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Verification flow test completed successfully!',
      data: {
        testEmail,
        tokenCreated: true,
        tokenRetrieved: true,
        uniqueConstraintWorking: true,
        tokenDeleted: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Verification flow test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'general',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
