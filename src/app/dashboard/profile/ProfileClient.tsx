'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Typography,
  Badge,
  Separator,
  Skeleton
} from '@/components/ui'
import { 
  User, 
  Mail, 
  Lock, 
  Monitor, 
  Smartphone, 
  MapPin, 
  Clock,
  Trash2,
  Save,
  Edit,
  X
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  lastLoginAt: string | null
  onboardingCompleted: boolean
}

interface Session {
  id: string
  device: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
  userAgent: string
}

interface ProfileUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ProfileClientProps {
  user: ProfileUser
}

export default function ProfileClient({ user: _user }: ProfileClientProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingSession, setIsDeletingSession] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchSessions()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/profile/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const error = await response.json()
        console.error('Failed to update profile:', error.error || 'Unknown error')
        // TODO: Add proper error toast notification
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // TODO: Add proper error toast notification
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (sessionId === 'current-session') {
      console.warn('Cannot terminate current session. Please log out instead.')
      // TODO: Add proper error toast notification
      return
    }

    setIsDeletingSession(sessionId)
    try {
      const response = await fetch(`/api/profile/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSessions(prev => prev.filter(session => session.id !== sessionId))
      } else {
        const error = await response.json()
        console.error('Failed to terminate session:', error.error || 'Unknown error')
        // TODO: Add proper error toast notification
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      // TODO: Add proper error toast notification
    } finally {
      setIsDeletingSession(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('ios') || device.toLowerCase().includes('android')) {
      return <Smartphone className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Typography variant="h2" className="mb-4">Profile Not Found</Typography>
        <Typography color="muted">Unable to load your profile information.</Typography>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2" className="mb-2">Profile Settings</Typography>
            <Typography color="muted">Manage your account information and security settings</Typography>
          </div>
          <Button
            variant={isEditing ? "outline" : "brand"}
            onClick={() => setIsEditing(!isEditing)}
            className="brand-shadow"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter current password to change"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Confirm new password"
                />
              </div>

              {isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full brand-shadow"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and membership information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" color="muted">Member Since</Typography>
                <Typography variant="body-sm">{formatDate(profile.createdAt)}</Typography>
              </div>
              
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" color="muted">Last Login</Typography>
                <Typography variant="body-sm">
                  {profile.lastLoginAt ? formatDate(profile.lastLoginAt) : 'Never'}
                </Typography>
              </div>
              
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" color="muted">Onboarding</Typography>
                <Badge variant={profile.onboardingCompleted ? "default" : "secondary"}>
                  {profile.onboardingCompleted ? 'Completed' : 'Pending'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <Typography variant="h6">Account Actions</Typography>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active login sessions across different devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      {getDeviceIcon(session.device)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Typography variant="body-sm" className="font-medium">
                          {session.device}
                        </Typography>
                        {session.isCurrent && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(session.lastActive)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={isDeletingSession === session.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDeletingSession === session.id ? (
                        'Terminating...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Terminate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
