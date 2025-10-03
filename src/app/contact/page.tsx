'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useRef, useEffect } from 'react'
import { Typography, Card, CardContent, Input, Textarea, Button, Alert, AlertDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui"
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageCircle, Users, CreditCard, Wrench, Upload, X, File } from "lucide-react"
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  department: z.string().min(1, 'Please select a department'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  priority: z.string().min(1, 'Please select a priority level'),
  orderReference: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    department: '',
    subject: '',
    priority: '',
    orderReference: '',
    message: ''
  })
  const [errors, setErrors] = useState<Partial<ContactForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format. Allowed: JPG, PNG, GIF, PDF, TXT, DOC, DOCX`)
        return false
      }
      
      return true
    })
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('contact-form-draft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse saved form data:', error)
      }
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('contact-form-draft', JSON.stringify(formData))
    }, 1000) // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId)
  }, [formData])

  const clearDraft = () => {
    localStorage.removeItem('contact-form-draft')
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
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('department', formData.department)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('priority', formData.priority)
      if (formData.orderReference) {
        formDataToSend.append('orderReference', formData.orderReference)
      }
      formDataToSend.append('message', formData.message)
      
      // Add attachments
      attachments.forEach((file, index) => {
        formDataToSend.append(`attachment_${index}`, file)
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.')
        setFormData({ name: '', email: '', department: '', subject: '', priority: '', orderReference: '', message: '' })
        setAttachments([])
        clearDraft()
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

            {/* Business Hours */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <Typography variant="h4" className="font-semibold text-blue-800 dark:text-blue-200">
                  Business Hours
                </Typography>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-800 dark:text-green-200 text-xs">
                  <span className="font-medium">Currently Open</span> - We're here to help!
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Typography variant="h4" className="font-semibold mb-4 text-purple-800 dark:text-purple-200">
                Follow Us
              </Typography>
              <div className="flex space-x-4">
                <a href="https://twitter.com/stockmediasaas" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
                <a href="https://linkedin.com/company/stockmediasaas" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  <Users className="h-6 w-6" />
                </a>
                <a href="https://github.com/stockmediasaas" className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Response Times */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <Typography variant="h4" className="font-semibold mb-4 text-green-800 dark:text-green-200">
                Response Times
              </Typography>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
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
                <div className="flex justify-between">
                  <span>Billing Questions:</span>
                  <span className="font-medium">4 hours</span>
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

                <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Contact form">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <Typography id="name-error" variant="body-sm" className="text-red-600 mt-1" role="alert">
                          {errors.name}
                        </Typography>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </Label>
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
                  </div>

                  {/* Department and Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department *
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              General Inquiry
                            </div>
                          </SelectItem>
                          <SelectItem value="sales">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Sales
                            </div>
                          </SelectItem>
                          <SelectItem value="support">
                            <div className="flex items-center">
                              <Wrench className="h-4 w-4 mr-2" />
                              Technical Support
                            </div>
                          </SelectItem>
                          <SelectItem value="billing">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Billing
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <Typography variant="body-sm" className="text-red-600 mt-1">
                          {errors.department}
                        </Typography>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority Level *
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General question</SelectItem>
                          <SelectItem value="medium">Medium - Standard request</SelectItem>
                          <SelectItem value="high">High - Urgent issue</SelectItem>
                          <SelectItem value="urgent">Urgent - Critical problem</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <Typography variant="body-sm" className="text-red-600 mt-1">
                          {errors.priority}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && (
                      <Typography variant="body-sm" className="text-red-600 mt-1">
                        {errors.subject}
                      </Typography>
                    )}
                  </div>

                  {/* Order Reference Field */}
                  <div>
                    <Label htmlFor="orderReference" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order/Ticket Reference (Optional)
                    </Label>
                    <Input
                      id="orderReference"
                      name="orderReference"
                      type="text"
                      value={formData.orderReference}
                      onChange={handleInputChange}
                      placeholder="Order #12345 or Ticket #67890"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                      />
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 mb-2">
                        Click to upload files or drag and drop
                      </Typography>
                      <Typography variant="body-sm" className="text-gray-500 dark:text-gray-500 text-xs">
                        PNG, JPG, GIF, PDF, TXT, DOC, DOCX up to 10MB each (max 5 files)
                      </Typography>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                    
                    {/* Attachments List */}
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Typography variant="body-sm" className="font-medium text-gray-700 dark:text-gray-300">
                          Attached Files ({attachments.length}/5):
                        </Typography>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4 text-gray-500" />
                              <div>
                                <Typography variant="body-sm" className="font-medium">
                                  {file.name}
                                </Typography>
                                <Typography variant="body-sm" className="text-gray-500 text-xs">
                                  {formatFileSize(file.size)}
                                </Typography>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message * ({formData.message.length}/1000 characters)
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      maxLength={1000}
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

        {/* Google Maps Section */}
        <section className="mt-24">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Visit Our Office
          </Typography>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-96 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509374!2d-122.3965!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808c5c5c5c5c%3A0x5c5c5c5c5c5c5c5c!2s123%20Creative%20Street%2C%20San%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Stock Media SaaS Office Location"
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h3" className="text-xl font-semibold mb-2">
                      Stock Media SaaS Headquarters
                    </Typography>
                    <Typography variant="body" className="text-muted-foreground">
                      123 Creative Street<br />
                      San Francisco, CA 94105<br />
                      United States
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="text-muted-foreground mb-1">
                      Parking Available
                    </Typography>
                    <Typography variant="body-sm" className="text-muted-foreground">
                      Public Transit Accessible
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

