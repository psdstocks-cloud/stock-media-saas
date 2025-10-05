'use client'

import { useState } from 'react'
import { 
  Modal, 
  ModalContent,
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Typography,
  Badge
} from '@/components/ui'
import { 
  Search, 
  Download, 
  Star, 
  CreditCard, 
  Users, 
  Settings,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
  onClose: () => void
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Stock Media SaaS',
    description: 'Your premium stock media platform is ready to use',
    icon: Star,
    content: (
      <div className="text-center space-y-4">
        <div className="h-16 w-16 brand-gradient rounded-full flex items-center justify-center mx-auto">
          <Star className="h-8 w-8 text-white" />
        </div>
        <Typography variant="h3" className="brand-text-gradient">
          Let's get you started!
        </Typography>
        <Typography variant="body" color="muted">
          We'll walk you through the key features that will help you find and download amazing stock media.
        </Typography>
      </div>
    )
  },
  {
    id: 'points',
    title: 'Points System',
    description: 'How our flexible pricing works',
    icon: CreditCard,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <Typography variant="h4" className="mb-2">
            Flexible Point-Based System
          </Typography>
          <Typography variant="body" color="muted">
            Buy points and use them to download any media. No subscriptions, no restrictions.
          </Typography>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Badge variant="secondary" className="mb-2">100 Points</Badge>
              <Typography variant="h6" className="mb-1">$10</Typography>
              <Typography variant="caption" color="muted">Perfect for small projects</Typography>
            </CardContent>
          </Card>
          <Card className="text-center brand-border">
            <CardContent className="pt-6">
              <Badge variant="default" className="mb-2">500 Points</Badge>
              <Typography variant="h6" className="mb-1">$40</Typography>
              <Typography variant="caption" color="muted">Most popular choice</Typography>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Badge variant="secondary" className="mb-2">1000 Points</Badge>
              <Typography variant="h6" className="mb-1">$70</Typography>
              <Typography variant="caption" color="muted">Best value for teams</Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 'search',
    title: 'Smart Search',
    description: 'Find exactly what you need',
    icon: Search,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-white" />
          </div>
          <Typography variant="h4" className="mb-2">
            AI-Powered Search
          </Typography>
          <Typography variant="body" color="muted">
            Our smart search understands context and finds the perfect media for your needs.
          </Typography>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Typography variant="body-sm">Search by keywords, colors, or concepts</Typography>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Typography variant="body-sm">Filter by media type, resolution, and format</Typography>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Typography variant="body-sm">Save searches and create collections</Typography>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'download',
    title: 'Instant Downloads',
    description: 'Get your media immediately',
    icon: Download,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="h-6 w-6 text-white" />
          </div>
          <Typography variant="h4" className="mb-2">
            Lightning-Fast Downloads
          </Typography>
          <Typography variant="body" color="muted">
            Download high-resolution files instantly with our optimized CDN.
          </Typography>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Multiple Formats</CardTitle>
              <CardDescription>
                Download in your preferred format and resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body-sm">Photos</Typography>
                  <Badge variant="outline">JPG, PNG, WebP</Badge>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm">Videos</Typography>
                  <Badge variant="outline">MP4, MOV, AVI</Badge>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm">Audio</Typography>
                  <Badge variant="outline">MP3, WAV, AAC</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">High Quality</CardTitle>
              <CardDescription>
                Professional-grade media for all your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body-sm">Photos</Typography>
                  <Badge variant="outline">Up to 8K</Badge>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm">Videos</Typography>
                  <Badge variant="outline">4K, 8K</Badge>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm">Audio</Typography>
                  <Badge variant="outline">Lossless</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Advanced Features',
    description: 'Professional tools for creators',
    icon: Settings,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <Typography variant="h4" className="mb-2">
            Professional Tools
          </Typography>
          <Typography variant="body" color="muted">
            Advanced features designed for professional creators and teams.
          </Typography>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary mt-1" />
              <div>
                <Typography variant="h6" className="mb-1">Team Collaboration</Typography>
                <Typography variant="body-sm" color="muted">
                  Share collections and collaborate with your team
                </Typography>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Download className="h-5 w-5 text-primary mt-1" />
              <div>
                <Typography variant="h6" className="mb-1">Bulk Downloads</Typography>
                <Typography variant="body-sm" color="muted">
                  Download multiple files at once with our bulk tool
                </Typography>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-primary mt-1" />
              <div>
                <Typography variant="h6" className="mb-1">Favorites & Collections</Typography>
                <Typography variant="body-sm" color="muted">
                  Save and organize your favorite media
                </Typography>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-primary mt-1" />
              <div>
                <Typography variant="h6" className="mb-1">API Access</Typography>
                <Typography variant="body-sm" color="muted">
                  Integrate with your existing workflows
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
]

export function OnboardingModal({ isOpen, onComplete, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        onComplete()
      } else {
        const error = await response.json()
        console.error('Failed to complete onboarding:', error)
        // Still complete the onboarding flow even if API call fails
        onComplete()
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still complete the onboarding flow even if API call fails
      onComplete()
    } finally {
      setIsCompleting(false)
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <ModalContent className="p-0">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 bg-muted/30 p-6 border-r">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Typography variant="h5" className="brand-text-gradient">
                  Getting Started
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {onboardingSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 border border-primary/20' 
                          : isCompleted 
                            ? 'bg-green-50 border border-green-200' 
                            : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography variant="body-sm" className="font-medium">
                          {step.title}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {step.description}
                        </Typography>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <Typography variant="h3" className="mb-2">
                  {currentStepData.title}
                </Typography>
                <Typography variant="body-lg" color="muted">
                  {currentStepData.description}
                </Typography>
              </div>

              <div className="mb-8">
                {currentStepData.content}
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
                  <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="brand-gradient h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button
                  variant="brand"
                  onClick={handleNext}
                  disabled={isCompleting}
                  className="brand-shadow"
                >
                  {isCompleting ? (
                    'Completing...'
                  ) : isLastStep ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
