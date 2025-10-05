'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpCircle, MessageSquare, Mail, Book } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-600 mt-2">Get help and contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Contact Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Need help? Send us a message and we'll get back to you.</p>
            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Book className="h-5 w-5" />
              <span>Documentation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Browse our help articles and tutorials.</p>
            <Button variant="outline" className="w-full">
              <HelpCircle className="h-4 w-4 mr-2" />
              View Docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
