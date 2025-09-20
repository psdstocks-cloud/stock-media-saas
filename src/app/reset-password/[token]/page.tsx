import { Typography } from '@/components/ui/typography'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

  // Validate the token on the server side
  let isTokenValid = false
  let validationError = ''

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/validate-reset-token?token=${encodeURIComponent(token)}`)
    const data = await response.json()
    
    if (response.ok && data.valid) {
      isTokenValid = true
    } else {
      validationError = 'This password reset link is invalid or has expired.'
    }
  } catch (error) {
    validationError = 'Failed to validate reset token. Please try again.'
  }

  // If token is invalid, show error message
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">⚠</span>
            </div>
            <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
              Invalid Reset Link
            </Typography>
            <Typography variant="body" className="text-white/70">
              {validationError}
            </Typography>
          </div>

          {/* Error Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl p-8 text-center">
            <div className="space-y-4">
              <div className="text-red-400 text-sm">
                <p className="mb-2">
                  Password reset links expire after 1 hour for security reasons.
                </p>
                <p>
                  Please request a new password reset link.
                </p>
              </div>
              
              <div className="space-y-2">
                <a 
                  href="/forgot-password"
                  className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Request New Reset Link
                </a>
                
                <a 
                  href="/login"
                  className="block text-center text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  Back to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If token is valid, show the reset form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
            Reset Password
          </Typography>
          <Typography variant="body" className="text-white/70">
            Enter your new password to complete the reset process
          </Typography>
        </div>

        {/* Reset Password Form */}
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}
