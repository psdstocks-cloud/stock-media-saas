import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Session API: Starting request')
    
    const session = await getServerSession()
    console.log('🔍 Debug Session API: Session object:', session)
    console.log('🔍 Debug Session API: User ID:', session?.user?.id)
    console.log('🔍 Debug Session API: User email:', session?.user?.email)
    console.log('🔍 Debug Session API: User name:', session?.user?.name)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: {
          session: session,
          hasUser: !!session?.user,
          hasUserId: !!session?.user?.id
        }
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      }
    })
  } catch (error) {
    console.error('🔍 Debug Session API: Error:', error)
    return NextResponse.json({ 
      error: 'Session debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
