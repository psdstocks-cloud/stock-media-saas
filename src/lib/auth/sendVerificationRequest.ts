import { render } from '@react-email/render'
import { Resend } from 'resend'
import AdminMagicLinkEmail from '../../emails/AdminMagicLinkEmail'

// Validate Resend API key
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required but not set. Please add it to your Vercel environment variables.')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider: { server, from },
}: {
  identifier: string
  url: string
  provider: { server: any; from: string }
}): Promise<void> {
  try {
    // Render the email template
    const emailHtml = await render(AdminMagicLinkEmail({
      magicLink: url,
      siteName: 'Stock Media SaaS',
      userEmail: email,
    }))

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'Stock Media SaaS <noreply@stockmedia.com>',
      to: [email],
      subject: '🔐 Your Admin Login Link - Stock Media SaaS',
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send admin magic link email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Admin magic link email sent successfully:', {
      email,
      messageId: data?.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error)
    throw error
  }
}
