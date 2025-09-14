// scripts/seed-admin-settings.ts
// Seed admin settings with default values

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAdminSettings() {
  try {
    console.log('🌱 Seeding admin settings...')

    const defaultSettings = [
      // General Settings
      {
        category: 'general',
        key: 'site_name',
        value: 'Stock Media SaaS',
        type: 'string',
        description: 'The name of your platform',
        isRequired: true,
        order: 1
      },
      {
        category: 'general',
        key: 'site_description',
        value: 'Premium stock media downloads with subscription-based point system',
        type: 'string',
        description: 'Platform description for SEO and marketing',
        isRequired: true,
        order: 2
      },
      {
        category: 'general',
        key: 'contact_email',
        value: 'support@stockmediasaas.com',
        type: 'email',
        description: 'Primary contact email address',
        isRequired: true,
        order: 3
      },
      {
        category: 'general',
        key: 'support_email',
        value: 'support@stockmediasaas.com',
        type: 'email',
        description: 'Support email address',
        isRequired: true,
        order: 4
      },
      {
        category: 'general',
        key: 'timezone',
        value: 'UTC',
        type: 'string',
        description: 'Default timezone for the platform',
        isRequired: true,
        order: 5
      },
      {
        category: 'general',
        key: 'currency',
        value: 'USD',
        type: 'string',
        description: 'Default currency for pricing',
        isRequired: true,
        order: 6
      },

      // Security Settings
      {
        category: 'security',
        key: 'session_timeout',
        value: '30',
        type: 'number',
        description: 'Session timeout in minutes',
        isRequired: true,
        validation: JSON.stringify({ min: 5, max: 1440 }),
        order: 1
      },
      {
        category: 'security',
        key: 'max_login_attempts',
        value: '5',
        type: 'number',
        description: 'Maximum login attempts before account lockout',
        isRequired: true,
        validation: JSON.stringify({ min: 3, max: 10 }),
        order: 2
      },
      {
        category: 'security',
        key: 'lockout_duration',
        value: '15',
        type: 'number',
        description: 'Account lockout duration in minutes',
        isRequired: true,
        validation: JSON.stringify({ min: 5, max: 60 }),
        order: 3
      },
      {
        category: 'security',
        key: 'require_2fa',
        value: 'false',
        type: 'boolean',
        description: 'Require two-factor authentication for admin users',
        isRequired: false,
        order: 4
      },
      {
        category: 'security',
        key: 'password_min_length',
        value: '8',
        type: 'number',
        description: 'Minimum password length',
        isRequired: true,
        validation: JSON.stringify({ min: 6, max: 32 }),
        order: 5
      },

      // Payment Settings
      {
        category: 'payment',
        key: 'stripe_public_key',
        value: '',
        type: 'string',
        description: 'Stripe publishable key',
        isRequired: true,
        isEncrypted: true,
        order: 1
      },
      {
        category: 'payment',
        key: 'stripe_secret_key',
        value: '',
        type: 'password',
        description: 'Stripe secret key',
        isRequired: true,
        isEncrypted: true,
        order: 2
      },
      {
        category: 'payment',
        key: 'stripe_webhook_secret',
        value: '',
        type: 'password',
        description: 'Stripe webhook signing secret',
        isRequired: true,
        isEncrypted: true,
        order: 3
      },
      {
        category: 'payment',
        key: 'stripe_webhook_url',
        value: '',
        type: 'url',
        description: 'Stripe webhook endpoint URL',
        isRequired: true,
        order: 4
      },
      {
        category: 'payment',
        key: 'payment_currency',
        value: 'usd',
        type: 'string',
        description: 'Payment currency code',
        isRequired: true,
        order: 5
      },

      // Email Settings
      {
        category: 'email',
        key: 'smtp_host',
        value: '',
        type: 'string',
        description: 'SMTP server hostname',
        isRequired: true,
        order: 1
      },
      {
        category: 'email',
        key: 'smtp_port',
        value: '587',
        type: 'number',
        description: 'SMTP server port',
        isRequired: true,
        validation: JSON.stringify({ min: 1, max: 65535 }),
        order: 2
      },
      {
        category: 'email',
        key: 'smtp_username',
        value: '',
        type: 'string',
        description: 'SMTP username',
        isRequired: true,
        order: 3
      },
      {
        category: 'email',
        key: 'smtp_password',
        value: '',
        type: 'password',
        description: 'SMTP password',
        isRequired: true,
        isEncrypted: true,
        order: 4
      },
      {
        category: 'email',
        key: 'smtp_secure',
        value: 'true',
        type: 'boolean',
        description: 'Use secure SMTP connection',
        isRequired: true,
        order: 5
      },
      {
        category: 'email',
        key: 'from_email',
        value: 'noreply@stockmediasaas.com',
        type: 'email',
        description: 'Default from email address',
        isRequired: true,
        order: 6
      },
      {
        category: 'email',
        key: 'from_name',
        value: 'Stock Media SaaS',
        type: 'string',
        description: 'Default from name',
        isRequired: true,
        order: 7
      },

      // API Settings
      {
        category: 'api',
        key: 'nehtw_api_key',
        value: '',
        type: 'password',
        description: 'Nehtw.com API key for stock media downloads',
        isRequired: true,
        isEncrypted: true,
        order: 1
      },
      {
        category: 'api',
        key: 'nehtw_api_url',
        value: 'https://api.nehtw.com',
        type: 'url',
        description: 'Nehtw.com API base URL',
        isRequired: true,
        order: 2
      },
      {
        category: 'api',
        key: 'api_rate_limit',
        value: '1000',
        type: 'number',
        description: 'API rate limit per hour',
        isRequired: true,
        validation: JSON.stringify({ min: 100, max: 10000 }),
        order: 3
      },
      {
        category: 'api',
        key: 'webhook_timeout',
        value: '30',
        type: 'number',
        description: 'Webhook timeout in seconds',
        isRequired: true,
        validation: JSON.stringify({ min: 5, max: 300 }),
        order: 4
      },

      // Analytics Settings
      {
        category: 'analytics',
        key: 'google_analytics_id',
        value: '',
        type: 'string',
        description: 'Google Analytics tracking ID',
        isRequired: false,
        order: 1
      },
      {
        category: 'analytics',
        key: 'google_tag_manager_id',
        value: '',
        type: 'string',
        description: 'Google Tag Manager container ID',
        isRequired: false,
        order: 2
      },
      {
        category: 'analytics',
        key: 'enable_analytics',
        value: 'true',
        type: 'boolean',
        description: 'Enable analytics tracking',
        isRequired: true,
        order: 3
      },
      {
        category: 'analytics',
        key: 'retention_days',
        value: '365',
        type: 'number',
        description: 'Data retention period in days',
        isRequired: true,
        validation: JSON.stringify({ min: 30, max: 2555 }),
        order: 4
      },

      // System Settings
      {
        category: 'system',
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable maintenance mode',
        isRequired: true,
        order: 1
      },
      {
        category: 'system',
        key: 'maintenance_message',
        value: 'We are currently performing scheduled maintenance. Please check back soon.',
        type: 'string',
        description: 'Maintenance mode message',
        isRequired: false,
        order: 2
      },
      {
        category: 'system',
        key: 'backup_frequency',
        value: 'daily',
        type: 'string',
        description: 'Database backup frequency',
        isRequired: true,
        options: JSON.stringify(['hourly', 'daily', 'weekly', 'monthly']),
        order: 3
      },
      {
        category: 'system',
        key: 'log_level',
        value: 'info',
        type: 'string',
        description: 'Application log level',
        isRequired: true,
        options: JSON.stringify(['debug', 'info', 'warn', 'error']),
        order: 4
      },
      {
        category: 'system',
        key: 'max_file_size',
        value: '10485760',
        type: 'number',
        description: 'Maximum file upload size in bytes (10MB)',
        isRequired: true,
        validation: JSON.stringify({ min: 1048576, max: 104857600 }),
        order: 5
      }
    ]

    // Clear existing settings
    await prisma.adminSetting.deleteMany({})

    // Insert default settings
    for (const setting of defaultSettings) {
      await prisma.adminSetting.create({
        data: setting
      })
    }

    console.log(`✅ Created ${defaultSettings.length} admin settings`)

    // Create some default feature flags
    const defaultFeatureFlags = [
      {
        name: 'new_dashboard',
        description: 'Enable the new dashboard design',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        name: 'advanced_analytics',
        description: 'Enable advanced analytics features',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        name: 'beta_features',
        description: 'Enable beta features for testing',
        isEnabled: false,
        rolloutPercentage: 10
      },
      {
        name: 'mobile_app',
        description: 'Enable mobile app features',
        isEnabled: false,
        rolloutPercentage: 0
      }
    ]

    // Clear existing feature flags
    await prisma.featureFlag.deleteMany({})

    // Insert default feature flags
    for (const flag of defaultFeatureFlags) {
      await prisma.featureFlag.create({
        data: flag
      })
    }

    console.log(`✅ Created ${defaultFeatureFlags.length} feature flags`)

    console.log('🎉 Admin settings seeding completed!')
  } catch (error) {
    console.error('Error seeding admin settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdminSettings()
