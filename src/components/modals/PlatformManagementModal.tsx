'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { X, Upload } from 'lucide-react'

interface Platform {
  id?: string
  name: string
  displayName: string
  website: string
  category: string
  cost: number
  description: string
  logo: string
  logoSize: 'small' | 'medium' | 'large'
  isActive: boolean
  status?: string
}

interface PlatformManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (platform: Platform) => void
  platform?: Platform | null
  mode: 'add' | 'edit'
}

const categories = [
  { value: 'design', label: 'Design' },
  { value: 'photography', label: 'Photography' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'fonts', label: 'Fonts' },
  { value: 'templates', label: 'Templates' },
  { value: 'icons', label: 'Icons' },
  { value: 'other', label: 'Other' }
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
    category: 'other',
    cost: 1.0,
    description: '',
    logo: '',
    logoSize: 'medium',
    isActive: true
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (platform && mode === 'edit') {
      setFormData(platform)
    } else if (mode === 'add') {
      setFormData({
        name: '',
        displayName: '',
        website: '',
        category: 'other',
        cost: 1.0,
        description: '',
        logo: '',
        logoSize: 'medium',
        isActive: true
      })
    }
  }, [platform, mode])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async () => {
    // Placeholder for logo upload functionality
    try {
      const response = await fetch('/api/admin/platforms/upload-logo', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, logo: data.logoUrl })
      }
    } catch (error) {
      console.error('Logo upload failed:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {mode === 'add' ? 'Add New Platform' : 'Edit Platform'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., shutterstock"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., Shutterstock"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-white">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="https://www.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-white">Cost (Points)</Label>
              <Input
                id="cost"
                type="number"
                step="0.1"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Platform description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Logo</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleLogoUpload}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              {formData.logo && (
                <span className="text-sm text-gray-400">Logo uploaded</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive" className="text-white">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? 'Saving...' : mode === 'add' ? 'Add Platform' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}