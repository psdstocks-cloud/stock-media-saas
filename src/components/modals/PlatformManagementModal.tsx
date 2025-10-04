'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Globe, 
  DollarSign,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface Platform {
  id?: string
  name: string
  displayName: string
  website: string
  category: string
  cost: number
  description: string
  logo?: string
  logoSize: 'small' | 'medium' | 'large'
  isActive: boolean
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
}

interface PlatformManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (platform: Platform) => Promise<void>
  platform?: Platform | null
  mode: 'add' | 'edit'
}

const CATEGORIES = [
  { value: 'photos', label: 'Photos', icon: '📸' },
  { value: 'videos', label: 'Videos', icon: '🎥' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'graphics', label: 'Graphics', icon: '🎨' },
  { value: 'icons', icon: '🔗' },
  { value: 'templates', label: 'Templates', icon: '📄' },
  { value: '3d', label: '3D', icon: '🎲' },
  { value: 'mixed', label: 'Mixed', icon: '🔀' }
]

const LOGO_SIZES = [
  { value: 'small', label: 'Small (32x32px)', description: 'For compact displays' },
  { value: 'medium', label: 'Medium (64x64px)', description: 'Standard size' },
  { value: 'large', label: 'Large (128x128px)', description: 'For featured displays' }
]

export default function PlatformManagementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  platform, 
  mode 
}: PlatformManagementModalProps) {
  const [formData, setFormData] = useState<Platform>({
    name: '',
    displayName: '',
    website: '',
    category: 'photos',
    cost: 10,
    description: '',
    logo: '',
    logoSize: 'medium',
    isActive: true,
    status: 'AVAILABLE'
  })
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form data when platform changes
  useEffect(() => {
    if (platform && mode === 'edit') {
      setFormData(platform)
      if (platform.logo) {
        setLogoPreview(platform.logo)
      }
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        displayName: '',
        website: '',
        category: 'photos',
        cost: 10,
        description: '',
        logo: '',
        logoSize: 'medium',
        isActive: true,
        status: 'AVAILABLE'
      })
      setLogoPreview('')
      setLogoFile(null)
    }
    setErrors({})
  }, [platform, mode, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Platform name is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.name)) {
      newErrors.name = 'Name must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL starting with http:// or https://'
    }

    if (formData.cost < 1 || formData.cost > 1000) {
      newErrors.cost = 'Cost must be between 1 and 1000 points'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (mode === 'add' && !logoFile && !formData.logo) {
      newErrors.logo = 'Logo is required for new platforms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof Platform, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Please select a valid image file' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'File size must be less than 5MB' }))
      return
    }

    setLogoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Clear logo error
    setErrors(prev => ({ ...prev, logo: '' }))
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      let logoUrl = formData.logo

      // Upload logo if new file is selected
      if (logoFile) {
        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('logo', logoFile)
        uploadFormData.append('platformName', formData.name)
        uploadFormData.append('logoSize', formData.logoSize)

        const uploadResponse = await fetch('/api/admin/platforms/upload-logo', {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          logoUrl = uploadData.logoUrl
        } else {
          throw new Error('Failed to upload logo')
        }
        setIsUploading(false)
      }

      await onSave({
        ...formData,
        logo: logoUrl
      })

      onClose()
    } catch (error) {
      console.error('Error saving platform:', error)
      setErrors({ general: 'Failed to save platform. Please try again.' })
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {mode === 'add' ? 'Add New Platform' : 'Edit Platform'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Platform Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., shutterstock"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                <p className="text-xs text-gray-500 mt-1">Lowercase, numbers, and hyphens only</p>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="e.g., Shutterstock"
                  className={errors.displayName ? 'border-red-500' : ''}
                />
                {errors.displayName && <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website URL *</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.shutterstock.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the platform..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Platform Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Platform Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cost">Cost (Points) *</Label>
                <Input
                  id="cost"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseInt(e.target.value) || 0)}
                  className={errors.cost ? 'border-red-500' : ''}
                />
                {errors.cost && <p className="text-sm text-red-500 mt-1">{errors.cost}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Available</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MAINTENANCE">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span>Maintenance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DISABLED">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span>Disabled</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Platform Logo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="logo">Upload Logo *</Label>
                <div className="mt-2">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {logoFile ? logoFile.name : 'Click to upload logo'}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, SVG up to 5MB</p>
                  </label>
                </div>
                {errors.logo && <p className="text-sm text-red-500 mt-1">{errors.logo}</p>}
              </div>

              <div>
                <Label>Logo Size</Label>
                <Select value={formData.logoSize} onValueChange={(value) => handleInputChange('logoSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGO_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        <div>
                          <div className="font-medium">{size.label}</div>
                          <div className="text-xs text-gray-500">{size.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Logo Preview */}
            {logoPreview && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`${
                      formData.logoSize === 'small' ? 'w-8 h-8' :
                      formData.logoSize === 'medium' ? 'w-16 h-16' : 'w-32 h-32'
                    } flex items-center justify-center bg-white rounded border`}>
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formData.displayName}</p>
                      <p className="text-xs text-gray-500">{selectedCategory?.label} • {formData.cost} pts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isUploading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {mode === 'add' ? 'Add Platform' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
