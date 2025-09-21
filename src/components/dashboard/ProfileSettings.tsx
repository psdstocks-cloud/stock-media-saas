'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Mail, 
  Shield, 
  RefreshCw,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

interface ProfileSettingsProps {
  className?: string
}

export function ProfileSettings({ className }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fetchProfile = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const result = await response.json()
        setProfile(result.user || result)
        setFormData(prev => ({
          ...prev,
          name: result.user?.name || result.name || '',
          email: result.user?.email || result.email || ''
        }))
      } else {
        setError('Failed to fetch profile data')
      }
    } catch (error) {
      setError('An error occurred while fetching profile')
      console.error('Profile fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError('')
    
    try {
      // Validate password fields if they're shown
      if (showPasswordFields) {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match')
          setIsSaving(false)
          return
        }
        
        if (formData.newPassword && formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters')
          setIsSaving(false)
          return
        }
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      if (showPasswordFields && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        fetchProfile()
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        setShowPasswordFields(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred while updating profile')
      console.error('Profile update error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (error && !profile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchProfile}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                  {profile?.emailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                {!profile?.emailVerified && (
                  <Typography variant="caption" className="text-yellow-600">
                    Email not verified. Check your inbox for verification link.
                  </Typography>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">
                  Change Password
                </Typography>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  {showPasswordFields ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Change
                    </>
                  )}
                </Button>
              </div>

              {showPasswordFields && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <Typography variant="body" className="font-medium">
                Account Information
              </Typography>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Typography variant="caption" color="muted">
                    Role
                  </Typography>
                  <Typography variant="body" className="font-medium capitalize">
                    {profile?.role}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="muted">
                    Member Since
                  </Typography>
                  <Typography variant="body" className="font-medium">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="muted">
                    Last Login
                  </Typography>
                  <Typography variant="body" className="font-medium">
                    {profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'Never'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="muted">
                    Account ID
                  </Typography>
                  <Typography variant="body" className="font-mono text-xs">
                    {profile?.id ? profile.id.slice(0, 8) + '...' : 'N/A'}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfileSettings
