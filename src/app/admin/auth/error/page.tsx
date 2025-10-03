'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-white/70">
            There was an error with your authentication. Please try again.
          </p>
          <Button asChild className="w-full">
            <Link href="/admin/auth/signin">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
