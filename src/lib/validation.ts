import { z } from 'zod'

// Common validation schemas
export const urlSchema = z.string().url().max(2048)
export const emailSchema = z.string().email().max(255)
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

// Stock info request validation
export const stockInfoRequestSchema = z.object({
  url: urlSchema,
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional()
})

// Search request validation
export const searchRequestSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters in search query'),
  filters: z.object({
    category: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    dateRange: z.array(z.string()).optional(),
    priceRange: z.array(z.number()).optional(),
    license: z.enum(['free', 'premium', 'exclusive']).optional()
  }).optional(),
  page: z.number().min(0).default(0),
  limit: z.number().min(1).max(50).default(20)
})

// User registration validation
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User login validation
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Download request validation
export const downloadRequestSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    site: z.string().min(1),
    title: z.string().min(1),
    url: urlSchema,
    imageUrl: urlSchema,
    cost: z.number().min(0),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    dimensions: z.object({
      width: z.number().min(1),
      height: z.number().min(1)
    }).optional()
  })).min(1, 'At least one item is required').max(10, 'Maximum 10 items per download')
})

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .replace(/[;\\]/g, '') // Remove semicolons and backslashes
    .slice(0, 1000) // Limit length
}

// Alias for sanitizeInput (for backward compatibility)
export const sanitizeString = sanitizeInput

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: emailSchema,
  department: z.enum(['general', 'sales', 'support', 'billing'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  orderReference: z.string()
    .max(50, 'Order reference must be less than 50 characters')
    .optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
})

// Review validation
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  orderId: z.string().uuid().optional(),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
  role: z.string()
    .min(2, 'Role must be at least 2 characters')
    .max(100, 'Role must be less than 100 characters')
    .optional(),
  industry: z.string()
    .min(2, 'Industry must be at least 2 characters')
    .max(100, 'Industry must be less than 100 characters')
    .optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must be less than 2000 characters')
    .optional(),
  metrics: z.object({
    downloadsSaved: z.number().min(0).optional(),
    timeSaved: z.string().optional(),
    costSavings: z.number().min(0).optional()
  }).optional()
})

// URL validation and sanitization
export function validateAndSanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow specific domains for security
    const allowedDomains = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'freepik.com',
      'shutterstock.com',
      'gettyimages.com',
      'istockphoto.com',
      'adobe.com',
      'stock.adobe.com',
      'elements.envato.com',
      '123rf.com',
      'alamy.com',
      'mockupcloud.com'
    ]
    
    const hostname = parsedUrl.hostname.toLowerCase()
    const isAllowed = allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
    
    if (!isAllowed) {
      throw new Error('Domain not allowed')
    }
    
    return parsedUrl.toString()
  } catch (error) {
    throw new Error('Invalid URL')
  }
}

// Validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw new Error('Invalid request body')
  }
}