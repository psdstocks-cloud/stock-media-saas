import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface VerifyRequestPageProps {
  searchParams: {
    email?: string
  }
}

export default function AdminVerifyRequestPage({ searchParams }: VerifyRequestPageProps) {
  const email = searchParams?.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a magic link to {email || 'your email address'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Click the link in the email to sign in to your admin account. The link will expire in 10 minutes.
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Waiting for verification...</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link href="/admin/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
