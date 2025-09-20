import { Resend } from 'resend';
import { User } from '@prisma/client';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export const sendWelcomeEmail = async (user: { email: string; name?: string | null }) => {
  if (!resend) {
    console.warn('Resend API key not configured, skipping welcome email');
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: 'Welcome to StockMedia Pro!',
    html: `<h1>Hi ${user.name || ''},</h1><p>Welcome to StockMedia Pro. We're excited to have you on board!</p>`,
  });
};

export const sendPurchaseReceiptEmail = async (user: { email: string }, transactionDetails: { amount: number, description: string }) => {
  if (!resend) {
    console.warn('Resend API key not configured, skipping purchase receipt email');
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: 'Your Purchase Receipt from StockMedia Pro',
    html: `<p>Thank you for your purchase of ${transactionDetails.description}. Total amount: $${transactionDetails.amount.toFixed(2)}.</p>`,
  });
};

export const sendDownloadReadyEmail = async (user: { email: string }, order: { title: string | null, downloadUrl?: string | null }) => {
  if (!order.downloadUrl) return;
  if (!resend) {
    console.warn('Resend API key not configured, skipping download ready email');
    return;
  }
  const title = order.title || 'Your download';
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `Your download is ready: ${title}`,
    html: `<p>Your download for "${title}" is now ready. You can access it here: <a href="${order.downloadUrl}">Download Now</a></p>`,
  });
};

export const sendTeamInviteEmail = async (user: { email: string }, inviteDetails: { teamName: string, inviterName: string }) => {
  if (!resend) {
    console.warn('Resend API key not configured, skipping team invite email');
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `You're invited to join ${inviteDetails.teamName} on StockMedia Pro`,
    html: `<h1>Team Invitation</h1><p>Hi there!</p><p>${inviteDetails.inviterName} has invited you to join the "${inviteDetails.teamName}" team on StockMedia Pro.</p><p>Join your team to start downloading premium stock media together!</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.com'}/register">Sign up to join the team</a></p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, name: string) => {
  if (!resend) {
    console.warn('Resend API key not configured, skipping password reset email');
    return;
  }
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.com'}/reset-password?token=${resetToken}`;
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset your StockMedia Pro password',
    html: `<h1>Password Reset Request</h1><p>Hi ${name},</p><p>We received a request to reset your password. Click the link below to reset it:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you didn't request this, please ignore this email.</p>`,
  });
};

export const sendEmailVerificationEmail = async (email: string, verificationToken: string, name: string) => {
  if (!resend) {
    console.warn('Resend API key not configured, skipping email verification email');
    return;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.com';
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Stock Media SaaS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .content h2 { color: #1f2937; margin-top: 0; font-size: 24px; }
        .content p { color: #6b7280; margin-bottom: 20px; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .logo { width: 40px; height: 40px; background: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .logo-text { color: #f97316; font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-text">SM</span>
          </div>
          <h1>Stock Media SaaS</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Welcome to Stock Media SaaS! To complete your registration and start accessing our premium stock media library, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>This verification link will expire in 24 hours for security reasons.</p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px;">${verificationUrl}</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>Best regards,<br>The Stock Media SaaS Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${email}. If you have any questions, please contact our support team.</p>
          <p>&copy; 2024 Stock Media SaaS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Verify your email - Stock Media SaaS',
    html: emailHtml,
  });
};