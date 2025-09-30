import { NextRequest, NextResponse } from 'next/server'
import { signOut } from 'next-auth/react'

export async function POST(_request: NextRequest) {
  try {
    await signOut({ redirect: false })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
