'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Typography, Button, Alert, AlertDescription } from '@/components/ui'
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react'

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'idle'
  message: string
  details?: string
}

function VerifyEmailForm() {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    // If there's a token in the URL, automatically verify it
    if (token) {
      handleVerification(token)
    }
  }, [token])

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true)
    setVerificationState({ status: 'loading', message: 'Verifying your email...' })

    try {
      console.log('Verifying email with token:', verificationToken.substring(0, 10) + '...')
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()
      console.log('Verification response:', data)

      if (response.ok && data.success) {
        setVerificationState({
          status: 'success',
          message: data.message || 'Email verified successfully!',
          details: data.alreadyVerified ? 'Your email was already verified.' : undefined
        })
        
        // Auto-redirect to login after 5 seconds (give user more time to read)
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 5000)
      } else {
        setVerificationState({
          status: 'error',
          message: data.error || 'Verification failed',
          details: 'Please try requesting a new verification email.'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationState({
        status: 'error',
        message: 'An error occurred during verification',
        details: 'Please try again or contact support if the problem persists.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestNewVerification = () => {
    router.push('/login?requestVerification=true')
  }

  const handleGoToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
            Email Verification
          </Typography>
          <Typography variant="body" className="text-white/70">
            {token ? 'Verifying your email address' : 'Verify your email to complete registration'}
          </Typography>
        </div>

        {/* Verification Card */}
        <Card className="w-full bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              {verificationState.status === 'loading' ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : verificationState.status === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : verificationState.status === 'error' ? (
                <XCircle className="h-6 w-6 text-red-400" />
              ) : (
                <Mail className="h-6 w-6 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">Email Verification</CardTitle>
            <Typography variant="body" className="text-white/70">
              {verificationState.status === 'loading' && 'Please wait while we verify your email...'}
              {verificationState.status === 'success' && 'Verification Complete!'}
              {verificationState.status === 'error' && 'Verification Failed'}
              {verificationState.status === 'idle' && 'Enter your verification token below'}
            </Typography>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Messages */}
            {verificationState.status === 'success' && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  {verificationState.message}
                  {verificationState.details && (
                    <div className="mt-2 text-sm text-green-300">
                      {verificationState.details}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-green-300">
                    Redirecting to login page in 5 seconds...
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {verificationState.status === 'error' && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  {verificationState.message}
                  {verificationState.details && (
                    <div className="mt-2 text-sm text-red-300">
                      {verificationState.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {verificationState.status === 'loading' && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 text-orange-400 animate-spin mx-auto mb-2" />
                <Typography variant="body" className="text-white/70">
                  {verificationState.message}
                </Typography>
              </div>
            )}

            {!token && verificationState.status === 'idle' && (
              <div className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    If you haven't received a verification email, check your spam folder or request a new one.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {verificationState.status === 'success' && (
                <div className="space-y-3">
                  <Button
                    onClick={handleGoToLogin}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 text-lg"
                  >
                    ✅ Proceed to Login
                  </Button>
                  <div className="text-center text-sm text-white/60">
                    You can also wait to be redirected automatically
                  </div>
                </div>
              )}

              {verificationState.status === 'error' && (
                <>
                  <Button
                    onClick={handleRequestNewVerification}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 font-semibold py-3"
                  >
                    📧 Request New Verification Email
                  </Button>
                  <Button
                    onClick={handleGoToLogin}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold py-3"
                  >
                    🔐 Go to Login
                  </Button>
                </>
              )}

              {verificationState.status === 'idle' && !token && (
                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold py-3"
                >
                  🔐 Go to Login
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-white/50 pt-4 border-t border-white/10">
              <p>Need help? Contact our support team for assistance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <Typography variant="body" className="text-white/70">Loading...</Typography>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
