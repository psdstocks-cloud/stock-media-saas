'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials or insufficient privileges')
        return
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Admin Access</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/90 font-medium text-sm">Email</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pl-4 pr-10"
                    placeholder="admin@example.com"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/90 font-medium text-sm">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pl-4 pr-10"
                    placeholder="Enter password"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
