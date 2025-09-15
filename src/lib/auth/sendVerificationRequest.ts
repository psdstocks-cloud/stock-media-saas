import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import AdminMagicLinkEmail from '../../emails/AdminMagicLinkEmail'

// Create Gmail transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

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

    // Send the email using Gmail SMTP
    const info = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || 'Stock Media SaaS <psdstockspay@gmail.com>',
      to: email,
      subject: '🔐 Your Admin Login Link - Stock Media SaaS',
      html: emailHtml,
    })

    console.log('Admin magic link email sent successfully:', {
      email,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error)
    throw error
  }
}
