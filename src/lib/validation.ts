import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim()

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim()

// URL validation schema
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters')

// Plan validation schema
export const planSchema = z.enum(['starter', 'professional', 'business', 'enterprise'])

// Registration form validation
export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  plan: planSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

// Reset password validation
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Stock URL validation
export const stockUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters')
  .refine((url) => {
    const supportedDomains = [
      'shutterstock.com',
      'adobestock.com',
      'gettyimages.com',
      'istockphoto.com',
      'unsplash.com',
      'pexels.com',
      'depositphotos.com',
      '123rf.com',
      'dreamstime.com',
      'fotolia.com'
    ]
    return supportedDomains.some(domain => url.includes(domain))
  }, 'Please enter a URL from a supported stock media site')

// Profile update validation
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Display name can only contain letters, numbers, spaces, dots, underscores, and hyphens')
    .trim()
    .optional()
})

// Contact form validation
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim()
})

// Review validation
export const reviewSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Display name can only contain letters, numbers, spaces, dots, underscores, and hyphens')
    .trim(),
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters')
    .trim(),
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters')
    .trim(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  content: z
    .string()
    .min(20, 'Review must be at least 20 characters')
    .max(2000, 'Review must be less than 2000 characters')
    .trim(),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  metrics: z.object({
    downloadsSaved: z.number().min(0).optional(),
    timeSaved: z.string().max(100).optional(),
    moneySaved: z.number().min(0).optional()
  }).optional()
})

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
    return parsedUrl.toString()
  } catch {
    throw new Error('Invalid URL format')
  }
}

// XSS protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// SQL injection protection
export function escapeSql(unsafe: string): string {
  return unsafe
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z")
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().ip(),
  endpoint: z.string().min(1).max(100),
  limit: z.number().min(1).max(1000),
  windowMs: z.number().min(1000).max(3600000) // 1 second to 1 hour
})

export type RegistrationForm = z.infer<typeof registrationSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type StockUrlForm = z.infer<typeof stockUrlSchema>
export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>
export type ContactForm = z.infer<typeof contactSchema>
export type RateLimitForm = z.infer<typeof rateLimitSchema>
