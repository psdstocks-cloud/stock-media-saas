/**
 * StockMedia Pro Webhook Examples
 * 
 * This file contains examples of how to handle webhooks from StockMedia Pro
 * and integrate with external services.
 */

// ============================================================================
// STRIPE WEBHOOK HANDLING
// ============================================================================

/**
 * Express.js Stripe Webhook Handler
 */
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Webhook } = require('discord.js');

const app = express();

// Middleware to parse raw body for webhook signature verification
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  // Extract user and plan information
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const planId = session.metadata?.planId;
  
  // Update user subscription in your database
  await updateUserSubscription(customerId, subscriptionId, planId);
  
  // Send welcome email
  await sendWelcomeEmail(session.customer_email);
  
  // Log the event
  console.log(`User ${customerId} subscribed to plan ${planId}`);
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Activate user account
  await activateUserAccount(subscription.customer);
  
  // Add initial points
  await addInitialPoints(subscription.customer, subscription.metadata?.planId);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Update subscription status
  await updateSubscriptionStatus(subscription.id, subscription.status);
  
  // Handle plan changes
  if (subscription.metadata?.planChanged) {
    await handlePlanChange(subscription.customer, subscription.metadata.newPlanId);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription cancelled:', subscription.id);
  
  // Deactivate user account
  await deactivateUserAccount(subscription.customer);
  
  // Send cancellation email
  await sendCancellationEmail(subscription.customer);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  // Add monthly points
  await addMonthlyPoints(invoice.customer, invoice.subscription);
  
  // Send payment confirmation
  await sendPaymentConfirmation(invoice.customer_email);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Send payment failure notification
  await sendPaymentFailureNotification(invoice.customer_email);
  
  // Implement retry logic
  await schedulePaymentRetry(invoice.customer);
}

// ============================================================================
// NEHTW.COM WEBHOOK HANDLING
// ============================================================================

/**
 * Handle Nehtw.com download completion webhooks
 */
app.post('/webhook/nehtw', express.json(), async (req, res) => {
  const { orderId, status, downloadUrl, error } = req.body;
  
  try {
    if (status === 'completed') {
      await handleDownloadCompleted(orderId, downloadUrl);
    } else if (status === 'failed') {
      await handleDownloadFailed(orderId, error);
    } else {
      console.log(`Order ${orderId} status: ${status}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Nehtw webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle successful download completion
 */
async function handleDownloadCompleted(orderId, downloadUrl) {
  console.log(`Download completed for order ${orderId}`);
  
  // Update order status in database
  await updateOrderStatus(orderId, 'COMPLETED', downloadUrl);
  
  // Notify user via email
  await notifyUserDownloadReady(orderId);
  
  // Log the event
  console.log(`Order ${orderId} completed with download URL: ${downloadUrl}`);
}

/**
 * Handle download failure
 */
async function handleDownloadFailed(orderId, error) {
  console.log(`Download failed for order ${orderId}: ${error}`);
  
  // Update order status
  await updateOrderStatus(orderId, 'FAILED', null, error);
  
  // Refund points to user
  await refundOrderPoints(orderId);
  
  // Notify user of failure
  await notifyUserDownloadFailed(orderId, error);
}

// ============================================================================
// CUSTOM WEBHOOK HANDLING
// ============================================================================

/**
 * Generic webhook handler with signature verification
 */
class WebhookHandler {
  constructor(secret) {
    this.secret = secret;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(payload, signature, eventType) {
    // Verify signature
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const data = JSON.parse(payload);
    
    switch (eventType) {
      case 'user.registered':
        await this.handleUserRegistered(data);
        break;
      case 'order.created':
        await this.handleOrderCreated(data);
        break;
      case 'order.completed':
        await this.handleOrderCompleted(data);
        break;
      case 'points.added':
        await this.handlePointsAdded(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  async handleUserRegistered(data) {
    console.log('New user registered:', data.user.email);
    // Send welcome email, create user profile, etc.
  }

  async handleOrderCreated(data) {
    console.log('New order created:', data.order.id);
    // Log order, send confirmation, etc.
  }

  async handleOrderCompleted(data) {
    console.log('Order completed:', data.order.id);
    // Notify user, update analytics, etc.
  }

  async handlePointsAdded(data) {
    console.log('Points added:', data.points.amount);
    // Send notification, update dashboard, etc.
  }
}

// ============================================================================
// DISCORD BOT INTEGRATION
// ============================================================================

/**
 * Discord bot for order notifications
 */
const { Client, GatewayIntentBits } = require('discord.js');

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

discordClient.once('ready', () => {
  console.log('Discord bot is ready!');
});

/**
 * Send order notification to Discord
 */
async function sendDiscordNotification(order) {
  const channel = discordClient.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
  
  if (channel) {
    const embed = {
      title: 'New Order Created',
      color: 0x00ff00,
      fields: [
        { name: 'Order ID', value: order.id, inline: true },
        { name: 'User', value: order.user.email, inline: true },
        { name: 'Cost', value: `${order.cost} points`, inline: true },
        { name: 'Status', value: order.status, inline: true }
      ],
      timestamp: new Date().toISOString()
    };
    
    await channel.send({ embeds: [embed] });
  }
}

// ============================================================================
// SLACK INTEGRATION
// ============================================================================

/**
 * Slack webhook for notifications
 */
const { IncomingWebhook } = require('@slack/webhook');

const slackWebhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

/**
 * Send Slack notification
 */
async function sendSlackNotification(message, order = null) {
  const payload = {
    text: message,
    attachments: order ? [{
      color: order.status === 'COMPLETED' ? 'good' : 'warning',
      fields: [
        { title: 'Order ID', value: order.id, short: true },
        { title: 'User', value: order.user.email, short: true },
        { title: 'Cost', value: `${order.cost} points`, short: true }
      ]
    }] : []
  };
  
  await slackWebhook.send(payload);
}

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Email service for webhook notifications
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification
 */
async function sendEmailNotification(to, subject, template, data) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: renderTemplate(template, data)
  };
  
  await transporter.sendMail(mailOptions);
}

/**
 * Template rendering function
 */
function renderTemplate(template, data) {
  return template
    .replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '')
    .replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, obj, prop) => data[obj]?.[prop] || '');
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Database operations for webhook handling
 */
class DatabaseService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async updateUserSubscription(customerId, subscriptionId, planId) {
    return await this.prisma.subscription.upsert({
      where: { stripeCustomerId: customerId },
      update: {
        stripeSubscriptionId: subscriptionId,
        planId: planId,
        status: 'ACTIVE'
      },
      create: {
        userId: await this.getUserIdByCustomerId(customerId),
        planId: planId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE'
      }
    });
  }

  async updateOrderStatus(orderId, status, downloadUrl = null, error = null) {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        downloadUrl: downloadUrl,
        error: error,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });
  }

  async addMonthlyPoints(customerId, subscriptionId) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      include: { plan: true }
    });

    if (subscription) {
      await this.prisma.pointsBalance.upsert({
        where: { userId: subscription.userId },
        update: {
          balance: {
            increment: subscription.plan.points
          }
        },
        create: {
          userId: subscription.userId,
          balance: subscription.plan.points
        }
      });
    }
  }

  async getUserIdByCustomerId(customerId) {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });
    return user?.id;
  }
}

// ============================================================================
// ERROR HANDLING AND LOGGING
// ============================================================================

/**
 * Comprehensive error handling for webhooks
 */
class WebhookErrorHandler {
  static async handleError(error, webhookData, context) {
    console.error(`Webhook error in ${context}:`, error);
    
    // Log to external service (e.g., Sentry)
    if (process.env.SENTRY_DSN) {
      const Sentry = require('@sentry/node');
      Sentry.captureException(error, {
        tags: { context },
        extra: { webhookData }
      });
    }
    
    // Send alert to monitoring service
    await this.sendAlert(error, context);
    
    // Store error in database for debugging
    await this.storeError(error, webhookData, context);
  }

  static async sendAlert(error, context) {
    // Send to Slack, Discord, or email
    const message = `Webhook error in ${context}: ${error.message}`;
    await sendSlackNotification(message);
  }

  static async storeError(error, webhookData, context) {
    // Store in database for debugging
    console.log('Storing error for debugging:', {
      error: error.message,
      context,
      webhookData,
      timestamp: new Date()
    });
  }
}

// Export for use in other files
module.exports = {
  WebhookHandler,
  DatabaseService,
  WebhookErrorHandler,
  sendDiscordNotification,
  sendSlackNotification,
  sendEmailNotification
};
