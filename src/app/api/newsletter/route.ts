import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { email?: string }
    if (!body?.email || !/.+@.+\..+/.test(body.email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 })
    }
    // Placeholder: in production integrate with your ESP (Mailchimp, Resend, etc.)
    return NextResponse.json({ success: true, message: 'Subscribed' })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 })
  }
}


