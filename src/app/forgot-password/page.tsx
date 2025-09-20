import { Typography } from '@/components/ui/typography'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
            Forgot Password?
          </Typography>
          <Typography variant="body" className="text-white/70">
            Enter your email address and we'll send you a link to reset your password
          </Typography>
        </div>

        {/* Forgot Password Form */}
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
