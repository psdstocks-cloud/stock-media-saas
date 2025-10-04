'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Image, 
  Video, 
  Music, 
  Palette, 
  Zap,
  Crown,
  Shield
} from 'lucide-react'

interface RequestPlatformModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = [
  { value: 'photos', label: 'Photos', icon: Image },
  { value: 'videos', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'graphics', label: 'Graphics', icon: Palette },
  { value: 'icons', label: 'Icons', icon: Zap },
  { value: 'templates', label: 'Templates', icon: Shield },
  { value: '3d', label: '3D Assets', icon: Crown },
  { value: 'mixed', label: 'Mixed', icon: Shield }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400' }
]

export default function RequestPlatformModal({ isOpen, onClose }: RequestPlatformModalProps) {
  const [formData, setFormData] = useState({
    platformName: '',
    website: '',
    category: '',
    description: '',
    whyNeeded: '',
    priority: 'medium',
    contactEmail: '',
    additionalInfo: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the data to your API
      console.log('Platform request submitted:', formData)
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        platformName: '',
        website: '',
        category: '',
        description: '',
        whyNeeded: '',
        priority: 'medium',
        contactEmail: '',
        additionalInfo: ''
      })
      setIsSubmitted(false)
      onClose()
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)
  const selectedPriority = PRIORITY_LEVELS.find(pri => pri.value === formData.priority)

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your suggestion. We'll review your platform request and get back to you soon.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-orange-600" />
            <span>Request New Platform</span>
          </DialogTitle>
          <DialogDescription>
            Suggest a new stock media platform for us to support. We review all requests and prioritize based on user demand.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name *</Label>
              <Input
                id="platformName"
                value={formData.platformName}
                onChange={(e) => setFormData(prev => ({ ...prev, platformName: e.target.value }))}
                placeholder="e.g., Adobe Stock, Unsplash"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL *</Label>
              <div className="relative">
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => formData.website && window.open(formData.website, '_blank')}
                  disabled={!formData.website}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => {
                    const Icon = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Platform Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the platform and what type of content it offers..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyNeeded">Why do you need this platform? *</Label>
            <Textarea
              id="whyNeeded"
              value={formData.whyNeeded}
              onChange={(e) => setFormData(prev => ({ ...prev, whyNeeded: e.target.value }))}
              placeholder="Explain how this platform would benefit you and other users..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="your@email.com (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any additional details, pricing information, or special requirements..."
              rows={2}
            />
          </div>

          {/* Preview Card */}
          {formData.platformName && formData.category && (
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Preview</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {formData.platformName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium">{formData.platformName}</h5>
                      {selectedCategory && (
                        <>
                          <selectedCategory.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 capitalize">{selectedCategory.label}</span>
                        </>
                      )}
                      {selectedPriority && (
                        <Badge className={selectedPriority.color}>
                          {selectedPriority.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.platformName || !formData.website || !formData.category}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
