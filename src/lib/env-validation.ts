// Environment variable validation utility
export function validateEnvironmentVariables() {
  const requiredVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  }

  const optionalVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  const warnings = Object.entries(optionalVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  console.log('=== ENVIRONMENT VARIABLES VALIDATION ===')
  console.log('Required variables:', Object.keys(requiredVars))
  console.log('Missing required:', missing)
  console.log('Missing optional:', warnings)
  console.log('NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0)
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('========================================')

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return {
    isValid: true,
    missing,
    warnings,
  }
}
