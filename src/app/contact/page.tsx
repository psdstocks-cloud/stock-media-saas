'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Typography, Card, CardContent, Input, Textarea, Button, Alert, AlertDescription } from "@/components/ui"
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react"
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState<Partial<ContactForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    try {
      contactSchema.parse(formData)
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<ContactForm> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ContactForm] = err.message
          }
        })
        setErrors(fieldErrors)
        return
      }
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h4" className="font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <div className="flex items-center space-x-4">
              <Typography variant="body-sm" className="text-muted-foreground">
                Contact Us
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-6xl font-bold mb-6">
            Get in <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Touch</span>
          </Typography>
          <Typography variant="h3" className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our platform? Need help with your account? We're here to help you succeed.
          </Typography>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Typography variant="h2" className="text-2xl font-bold mb-8">
              Contact Information
            </Typography>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Typography variant="h4" className="font-semibold mb-1">
                    Email Support
                  </Typography>
                  <Typography variant="body" className="text-muted-foreground">
                    support@stockmediasaas.com
                  </Typography>
                  <Typography variant="body-sm" className="text-muted-foreground">
                    We respond within 24 hours
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Typography variant="h4" className="font-semibold mb-1">
                    Phone Support
                  </Typography>
                  <Typography variant="body" className="text-muted-foreground">
                    +1 (555) 123-4567
                  </Typography>
                  <Typography variant="body-sm" className="text-muted-foreground">
                    Mon-Fri 9AM-6PM EST
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Typography variant="h4" className="font-semibold mb-1">
                    Office Location
                  </Typography>
                  <Typography variant="body" className="text-muted-foreground">
                    123 Creative Street<br />
                    San Francisco, CA 94105
                  </Typography>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg">
              <Typography variant="h4" className="font-semibold mb-4">
                Quick Response Times
              </Typography>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>General Inquiries:</span>
                  <span className="font-medium">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Support:</span>
                  <span className="font-medium">12 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Issues:</span>
                  <span className="font-medium">6 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <Typography variant="h2" className="text-2xl font-bold mb-6">
                  Send us a Message
                </Typography>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {submitMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {submitMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <Typography variant="body-sm" className="text-red-600 mt-1">
                        {errors.name}
                      </Typography>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <Typography variant="body-sm" className="text-red-600 mt-1">
                        {errors.email}
                      </Typography>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <Typography variant="body-sm" className="text-red-600 mt-1">
                        {errors.message}
                      </Typography>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-24">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </Typography>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                How quickly do you respond to support requests?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                We aim to respond to all support requests within 24 hours. For urgent technical issues, 
                we typically respond within 6-12 hours during business hours.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Do you offer phone support?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Yes, we offer phone support for Enterprise customers and urgent technical issues. 
                You can reach us at +1 (555) 123-4567 during business hours.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Can I schedule a demo or consultation?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Absolutely! We offer free consultations for teams and enterprises. Contact us to 
                schedule a personalized demo of our platform and discuss your specific needs.
              </Typography>
            </div>
            <div>
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                What if I have a feature request?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                We love hearing from our users! Send us your feature requests through the contact form, 
                and our product team will review them for future updates.
              </Typography>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Typography variant="body-sm" className="text-muted-foreground">
              © 2024 Stock Media SaaS. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  )
}

