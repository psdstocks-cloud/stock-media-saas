// Email service for sending password reset emails
// This is a mock implementation - in production, you would use a real email service like SendGrid, AWS SES, etc.

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  userName: string
): Promise<void> {
  try {
    // In production, replace this with actual email service
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    // For now, we'll just log the email details
    // In production, you would send the actual email here
    console.log('='.repeat(80))
    console.log('📧 PASSWORD RESET EMAIL')
    console.log('='.repeat(80))
    console.log(`To: ${email}`)
    console.log(`Subject: Reset Your Password - StockMedia Pro`)
    console.log('')
    console.log(`Hi ${userName},`)
    console.log('')
    console.log('You requested to reset your password for your StockMedia Pro account.')
    console.log('')
    console.log('Click the link below to reset your password:')
    console.log('')
    console.log(`🔗 ${resetUrl}`)
    console.log('')
    console.log('This link will expire in 1 hour for security reasons.')
    console.log('')
    console.log('If you didn\'t request this password reset, please ignore this email.')
    console.log('')
    console.log('Best regards,')
    console.log('The StockMedia Pro Team')
    console.log('='.repeat(80))
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, you would use a real email service like:
    // - SendGrid: await sgMail.send(mail)
    // - AWS SES: await ses.sendEmail(params).promise()
    // - Nodemailer: await transporter.sendMail(mailOptions)
    
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

// Example implementation with SendGrid (uncomment and configure for production)
/*
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  userName: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Reset Your Password - StockMedia Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password for your StockMedia Pro account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The StockMedia Pro Team</p>
      </div>
    `
  }
  
  await sgMail.send(msg)
}
*/

// Example implementation with AWS SES (uncomment and configure for production)
/*
import AWS from 'aws-sdk'

const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  userName: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p>Hi ${userName},</p>
              <p>You requested to reset your password for your StockMedia Pro account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>The StockMedia Pro Team</p>
            </div>
          `
        }
      },
      Subject: {
        Data: 'Reset Your Password - StockMedia Pro'
      }
    },
    Source: process.env.AWS_SES_FROM_EMAIL!
  }
  
  await ses.sendEmail(params).promise()
}
*/
