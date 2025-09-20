'use client'

import { Typography } from '@/components/ui/typography'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterClient() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <Typography variant="h1" className="text-3xl font-bold text-white mb-2">
            Create Account
          </Typography>
          <Typography variant="body" className="text-white/70">
            Join Stock Media SaaS and start downloading premium content
          </Typography>
        </div>

        {/* Registration Form */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg shadow-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
