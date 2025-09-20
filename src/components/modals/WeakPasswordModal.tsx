'use client'

import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, Lock } from 'lucide-react'

interface WeakPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  password: string
}

export default function WeakPasswordModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  password 
}: WeakPasswordModalProps) {
  const handleProceed = () => {
    onProceed()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  // Calculate password strength for display
  const getPasswordStrength = (password: string) => {
    const requirements = [
      { label: 'Length (8+ chars)', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
      { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) }
    ]
    
    const metCount = requirements.filter(req => req.met).length
    const totalCount = requirements.length
    const strength = Math.round((metCount / totalCount) * 100)
    
    return { requirements, metCount, totalCount, strength }
  }

  const strengthData = getPasswordStrength(password)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <ModalTitle className="text-xl font-bold text-foreground">
            Weak Password Warning
          </ModalTitle>
          <ModalDescription className="text-muted-foreground text-center">
            Your password meets the minimum requirements but may be vulnerable to guessing attacks.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-6">
          {/* Security Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Security Risk
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Weak passwords are easily cracked by attackers using common techniques. 
                  We strongly recommend choosing a more complex password with a mix of 
                  characters, numbers, and symbols.
                </p>
              </div>
            </div>
          </div>

          {/* Password Analysis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Current Password Analysis
              </span>
            </div>
            
            <div className="space-y-2">
              {strengthData.requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    req.met ? 'bg-green-500' : 'bg-red-400'
                  }`} />
                  <span className={req.met ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Strength:</span>
                <span className={`font-medium ${
                  strengthData.strength >= 80 ? 'text-green-600 dark:text-green-400' :
                  strengthData.strength >= 60 ? 'text-blue-600 dark:text-blue-400' :
                  strengthData.strength >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {strengthData.strength}% ({strengthData.metCount}/{strengthData.totalCount} requirements)
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Recommended Improvements:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Add more special characters</li>
              <li>• Use a mix of uppercase and lowercase letters</li>
              <li>• Include numbers in different positions</li>
              <li>• Consider using a passphrase with random words</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 order-2 sm:order-1"
          >
            Let Me Fix It
          </Button>
          <Button
            variant="destructive"
            onClick={handleProceed}
            className="flex-1 order-1 sm:order-2"
          >
            Use Anyway
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          By proceeding, you acknowledge the security risks associated with weak passwords.
        </div>
      </ModalContent>
    </Modal>
  )
}
