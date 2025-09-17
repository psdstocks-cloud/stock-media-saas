import { Resend } from 'resend';
import { User } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export const sendWelcomeEmail = async (user: { email: string; name?: string | null }) => {
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: 'Welcome to StockMedia Pro!',
    html: `<h1>Hi ${user.name || ''},</h1><p>Welcome to StockMedia Pro. We're excited to have you on board!</p>`,
  });
};

export const sendPurchaseReceiptEmail = async (user: { email: string }, transactionDetails: { amount: number, description: string }) => {
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: 'Your Purchase Receipt from StockMedia Pro',
    html: `<p>Thank you for your purchase of ${transactionDetails.description}. Total amount: $${transactionDetails.amount.toFixed(2)}.</p>`,
  });
};

export const sendDownloadReadyEmail = async (user: { email: string }, order: { title: string, downloadUrl?: string | null }) => {
  if (!order.downloadUrl) return;
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `Your download is ready: ${order.title}`,
    html: `<p>Your download for "${order.title}" is now ready. You can access it here: <a href="${order.downloadUrl}">Download Now</a></p>`,
  });
};

export const sendTeamInviteEmail = async (user: { email: string }, inviteDetails: { teamName: string, inviterName: string }) => {
  await resend.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `You're invited to join ${inviteDetails.teamName} on StockMedia Pro`,
    html: `<h1>Team Invitation</h1><p>Hi there!</p><p>${inviteDetails.inviterName} has invited you to join the "${inviteDetails.teamName}" team on StockMedia Pro.</p><p>Join your team to start downloading premium stock media together!</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.com'}/register">Sign up to join the team</a></p>`,
  });
};