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