'use client'

import React, { useState } from "react"
import { Typography } from "@/components/ui"
import { ArrowRight, ShoppingCart, Play, Clock, Zap, CheckCircle2, Download, ChevronRight, ChevronLeft, ExternalLink, HelpCircle } from "lucide-react"
import DemoVideoModal from "@/components/modals/DemoVideoModal"
import InteractiveScreenshot from "@/components/landing/InteractiveScreenshot"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// Removed unused Badge import

export default function HowItWorksClient() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [activeUseCase, setActiveUseCase] = useState(0)

  const steps = [
    {
      id: 1,
      title: 'Sign Up',
      description: 'Create your account to access our powerful stock media download platform.',
      icon: Zap,
      time: '30 seconds',
      features: [
        'Supports 50+ stock platforms',
        'Quick registration process',
        'Instant access to all features',
        'Secure account management'
      ],
      screenshot: '/images/step1-paste-url.png',
      gif: '/images/step1-paste-url.gif',
      cta: 'Sign Up Now',
      ctaLink: '/register',
      questions: [
        {
          question: 'Is registration free?',
          answer: 'Yes! Registration is completely free. You only pay for the points you use to download content.'
        },
        {
          question: 'What information do I need?',
          answer: 'Just your email address and a secure password. We also recommend verifying your email for account security.'
        },
        {
          question: 'How quickly can I start using the platform?',
          answer: 'Instantly! Once you complete registration and verify your email, you can start downloading content immediately.'
        }
      ],
      demoSteps: [
        {
          title: 'Enter Details',
          description: 'Fill in your email and create a secure password',
          action: 'Enter email and password...'
        },
        {
          title: 'Account Creation',
          description: 'Our system creates your secure account instantly',
          action: 'Creating account...'
        },
        {
          title: 'Email Verification',
          description: 'Verify your email to activate your account',
          action: 'Check your email...'
        },
        {
          title: 'Ready to Start',
          description: 'Your account is ready and you can start using the platform',
          action: 'Click Next to continue'
        }
      ]
    },
    {
      id: 2,
      title: 'Confirm & Process',
      description: 'We validate, show points upfront, and begin processing instantly.',
      icon: CheckCircle2,
      time: '1 minute',
      features: [
        'Real-time point calculation',
        'Transparent pricing',
        'Instant processing start',
        'Progress tracking'
      ],
      screenshot: '/images/step2-confirm.png',
      gif: '/images/step2-confirm.gif',
      cta: 'See Pricing',
      ctaLink: '/pricing',
      questions: [
        {
          question: 'How are points calculated?',
          answer: 'Most assets cost 10 points each. We calculate points based on the platform and content type, always showing the cost before you confirm.'
        },
        {
          question: 'Can I cancel during processing?',
          answer: 'Yes, you can cancel during processing and receive a full refund of your points. Processing usually takes 1-3 minutes.'
        },
        {
          question: 'What if processing fails?',
          answer: 'If processing fails, we automatically refund your points and notify you. You can try again or contact support for assistance.'
        }
      ],
      demoSteps: [
        {
          title: 'Point Calculation',
          description: 'We calculate the exact points needed for this download',
          action: 'Calculating points...'
        },
        {
          title: 'Price Display',
          description: 'See the transparent pricing before you commit',
          action: 'Total: 25 points ($6.25)'
        },
        {
          title: 'Confirmation',
          description: 'Review and confirm your order',
          action: 'Click "Confirm Order"'
        },
        {
          title: 'Processing Started',
          description: 'Your order is now being processed',
          action: 'Processing...'
        }
      ]
    },
    {
      id: 3,
      title: 'Download',
      description: 'Get a fresh, time-safe download link every time you need it.',
      icon: Download,
      time: '30 seconds',
      features: [
        'Fresh download links',
        'No expiration dates',
        'High-speed downloads',
        'Download history'
      ],
      screenshot: '/images/step3-download.png',
      gif: '/images/step3-download.gif',
      cta: 'View History',
      ctaLink: '/dashboard/history',
      questions: [
        {
          question: 'How long are links valid?',
          answer: 'Download links are valid indefinitely. We generate fresh links every time you access your downloads for maximum security.'
        },
        {
          question: 'Can I re-download later?',
          answer: 'Yes! You can re-download any completed item from your download history without using additional points.'
        },
        {
          question: 'What file formats are supported?',
          answer: 'We support all major formats: JPG, PNG, MP4, MOV, AI, EPS, and more. The format depends on the original content from the stock platform.'
        }
      ],
      demoSteps: [
        {
          title: 'Processing Complete',
          description: 'Your download is ready',
          action: 'Download ready!'
        },
        {
          title: 'Fresh Link Generated',
          description: 'A new, time-safe download link has been created',
          action: 'Link generated'
        },
        {
          title: 'Download Available',
          description: 'Click to download your file',
          action: 'Download Now'
        },
        {
          title: 'History Saved',
          description: 'Your download is saved in your history',
          action: 'Added to history'
        }
      ]
    }
  ]

  const useCases = [
    {
      title: 'Designer',
      description: 'Perfect for graphic designers who need quick access to high-quality assets',
      icon: '🎨',
      benefits: [
        'Access to 50+ premium platforms',
        'No subscription management',
        'Pay only for what you use',
        'Fresh links every time'
      ],
      timeToStart: '2 minutes',
      example: 'Download 10 Shutterstock images for a client project'
    },
    {
      title: 'Marketer',
      description: 'Ideal for marketing teams creating campaigns and social media content',
      icon: '📈',
      benefits: [
        'Bulk download capabilities',
        'Team collaboration features',
        'Cost-effective for campaigns',
        'Instant access to assets'
      ],
      timeToStart: '3 minutes',
      example: 'Bulk download 50 images for a social media campaign'
    },
    {
      title: 'Agency',
      description: 'Perfect for creative agencies managing multiple client projects',
      icon: '🏢',
      benefits: [
        'Multi-user accounts',
        'Client project organization',
        'Usage analytics',
        'Scalable pricing'
      ],
      timeToStart: '5 minutes',
      example: 'Manage assets for 10 different client projects'
    }
  ]

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <Typography variant="h1" className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </Typography>
          <Typography variant="h3" className="text-[hsl(var(--muted-foreground))] text-lg md:text-xl mb-8">
            Paste a stock media URL, confirm points, and download. Three simple steps with fresh links every time.
          </Typography>
          
          {/* Time Estimate */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Takes just 2 minutes to get started
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => setIsDemoOpen(true)} 
              className="inline-flex items-center px-6 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Watch quick demo"
            >
              <Play className="h-4 w-4 mr-2" aria-hidden="true" />
              Watch 3-Min Demo
            </button>
            <a 
              href="/register" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
            >
              <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
              Get Started
            </a>
            <a 
              href="/pricing" 
              className="inline-flex items-center px-6 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              View Pricing
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Walkthrough */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Walkthrough</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Click through each step to see exactly how it works
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={activeStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeStep 
                        ? 'bg-orange-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={activeStep === steps.length - 1}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Active Step Display */}
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white">
                        {React.createElement(steps[activeStep].icon, { className: "w-6 h-6" })}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Step {steps[activeStep].id}</h3>
                        <p className="text-orange-500 font-medium">{steps[activeStep].time}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-3xl font-bold mb-4">{steps[activeStep].title}</h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      {steps[activeStep].description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {steps[activeStep].features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <a
                      href={steps[activeStep].ctaLink}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
                    >
                      {steps[activeStep].cta}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>

                  <div className="relative">
                    <InteractiveScreenshot
                      title={steps[activeStep].title}
                      description={steps[activeStep].description}
                      icon={steps[activeStep].icon}
                      steps={steps[activeStep].demoSteps}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              See how different professionals use our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeUseCase === index ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setActiveUseCase(index)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {useCase.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">
                        Setup time: {useCase.timeToStart}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      Example: {useCase.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about our process
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, stepIndex) => (
                <div key={stepIndex} className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-orange-500" />
                    Step {step.id}: {step.title}
                  </h3>
                  <div className="space-y-3">
                    {step.questions.map((qa, qIndex) => (
                      <div key={qIndex} className="flex items-start gap-2 group relative">
                        <div className="relative">
                          <HelpCircle className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0 cursor-help hover:text-orange-500 transition-colors" />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                            <div className="text-center">
                              <div className="font-semibold mb-1">{qa.question}</div>
                              <div className="text-gray-200">{qa.answer}</div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {qa.question}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of professionals who trust our platform
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/dashboard/order-v3"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-orange-600 hover:bg-orange-50 transition-colors font-semibold"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Your First Order
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-white text-white hover:bg-white hover:text-orange-600 transition-colors font-semibold"
            >
              View Pricing Plans
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
}


