'use client'

import React, { useState } from 'react'
import { useFormState } from 'react-dom'
import { adminLogin } from '@/actions/authActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'

type LoginState = 'default' | 'loading' | 'success' | 'error'

export default function AdminLoginPage() {
  const [loginState, setLoginState] = useState<LoginState>('default')
  const [result, dispatch] = useFormState(adminLogin, undefined)

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setLoginState('loading')
    await dispatch(formData)
  }

  // Handle result changes
  React.useEffect(() => {
    if (result) {
      if (result.success) {
        setLoginState('success')
      } else {
        setLoginState('error')
      }
    }
  }, [result])

  // Reset form state
  const resetForm = () => {
    setLoginState('default')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter your email to receive a secure login link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loginState === 'default' && (
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Magic Link
                </Button>
              </form>
            )}

            {loginState === 'loading' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Sending Magic Link</h3>
                  <p className="text-gray-300">Please wait while we send your secure login link...</p>
                </div>
              </div>
            )}

            {loginState === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Check Your Inbox</h3>
                  <p className="text-gray-300">
                    We've sent a secure login link to your email. The link will expire in 10 minutes.
                  </p>
                </div>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Try Different Email
                </Button>
              </div>
            )}

            {loginState === 'error' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Access Denied</h3>
                  <p className="text-gray-300">
                    {result?.message || 'This email is not authorized for admin access.'}
                  </p>
                </div>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Try Different Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Secure passwordless authentication
          </p>
        </div>
      </div>
    </div>
  )
}
