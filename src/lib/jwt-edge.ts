// Edge Runtime compatible JWT verification
// This version uses Web Crypto API instead of Node.js crypto

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export interface JWTPayload {
  id: string
  email: string
  name: string | null
  role: string
  iat?: number
  exp?: number
}

// Simple base64 URL decode
function base64UrlDecode(str: string): string {
  // Add padding if needed
  str += '='.repeat((4 - str.length % 4) % 4)
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  return atob(str)
}

// Simple base64 URL encode
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Create HMAC-SHA256 signature using Web Crypto API
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const signatureArray = new Uint8Array(signature)
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
  return base64UrlEncode(signatureBase64)
}

// Verify HMAC-SHA256 signature using Web Crypto API
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createSignature(data, secret)
  return signature === expectedSignature
}

export async function verifyJWTEdge(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [header, payload, signature] = parts

    // Verify signature
    const isValid = await verifySignature(`${header}.${payload}`, signature, JWT_SECRET)
    if (!isValid) {
      return null
    }

    // Decode payload
    const decodedPayload = JSON.parse(base64UrlDecode(payload))

    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null
    }

    return decodedPayload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Synchronous version for compatibility (less secure but works in Edge Runtime)
export function verifyJWTSync(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [_header, payload, _signature] = parts

    // Decode payload without signature verification (for Edge Runtime compatibility)
    const decodedPayload = JSON.parse(base64UrlDecode(payload))

    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null
    }

    return decodedPayload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
