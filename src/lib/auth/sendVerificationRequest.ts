import { Resend } from 'resend'
import { AdminMagicLinkEmail } from '@/emails/AdminMagicLinkEmail'

export async function sendVerificationRequest(params: {
  identifier: string
  url: string
  provider: any
}) {
  const { identifier: email, url } = params

  // Validate Resend API key only at runtime
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required but not set. Please add it to your Vercel environment variables.')
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Stock Media SaaS <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Sign in to your Admin Account - Stock Media SaaS',
      // Render the React component to HTML
      react: AdminMagicLinkEmail({ url, email }),
    })

    if (error) {
      console.error('Failed to send admin magic link email:', error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log('Admin magic link email sent successfully:', {
      email,
      messageId: data?.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error)
    throw new Error('Failed to send verification email.')
  }
}
