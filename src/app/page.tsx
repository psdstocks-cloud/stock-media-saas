"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"
import { 
  Download, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="brand" className="text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              New Design System
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="brand-text-gradient">
                Stock Media SaaS
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern, production-ready SaaS platform with Material.io efficiency, 
              Spotify UX, and Figma's minimalist design.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="brand" className="text-lg px-8">
              <Play className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button size="xl" variant="brand-outline" className="text-lg px-8">
              <Download className="h-5 w-5 mr-2" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold">Design System Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with modern design principles and brand identity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="brand-border hover:brand-shadow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Dark Purple and Vibrant Orange with CSS variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded bg-primary"></div>
                  <span className="text-sm">Primary (Dark Purple)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded bg-secondary"></div>
                  <span className="text-sm">Secondary (Vibrant Orange)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="brand-border hover:brand-shadow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Reusable UI components with variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="default">Default</Button>
                  <Button size="sm" variant="brand">Brand</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="brand">Brand</Badge>
                  <Badge variant="success">Success</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="brand-border hover:brand-shadow transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Dark Mode</CardTitle>
              <CardDescription>
                Complete dark mode support with CSS variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Light Mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Dark Mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Auto Switching</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold">Interactive Demo</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Try out the components and see the design system in action
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Example</CardTitle>
              <CardDescription>
                Input fields with brand styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Input placeholder="Enter your message" />
              </div>
              <div className="flex gap-2">
                <Button variant="brand">Submit</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>
                Different loading spinner sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <LoadingSpinner size="sm" text="Small" />
                <LoadingSpinner size="md" text="Medium" />
                <LoadingSpinner size="lg" text="Large" />
                <LoadingSpinner size="xl" text="Extra Large" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modal Demo</CardTitle>
              <CardDescription>
                Click the button to open a modal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="brand" 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Open Modal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Design System Modal"
        description="This is a demo modal showcasing the design system"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This modal demonstrates the design system's modal component with 
            proper styling, animations, and accessibility features.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="brand" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
