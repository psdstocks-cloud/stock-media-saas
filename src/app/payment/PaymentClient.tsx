'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Typography, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  ArrowLeft, 
  Zap, 
  Clock, 
  // Star,
  Loader2,
  // AlertCircle,
  Apple,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculatePricing, VALIDITY_OPTIONS } from '@/lib/pricing-calculator'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  popular?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    popular: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CreditCard,
    description: 'Pay with your PayPal account'
  },
  {
    id: 'apple',
    name: 'Apple Pay',
    icon: Apple,
    description: 'Touch ID or Face ID'
  },
  {
    id: 'google',
    name: 'Google Pay',
    icon: Smartphone,
    description: 'Pay with Google'
  }
]

export default function PaymentClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get parameters from URL
  const points = parseInt(searchParams.get('points') || '50')
  const validity = parseInt(searchParams.get('validity') || '30')
  
  // Calculate pricing
  const { totalPrice, pricePerPoint, savings, tier } = calculatePricing(points, validity)
  const validityOption = VALIDITY_OPTIONS.find(v => v.days === validity)
  
  // Component state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [authStatus, setAuthStatus] = useState(null)

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth-check')
      const result = await response.json()
      setAuthStatus(result)
      console.log('Auth status:', result)
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // Handle virtual payment processing
  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      console.log('Starting payment process...', {
        points,
        validity,
        totalPrice,
        paymentMethod: selectedPaymentMethod,
        tier: tier?.label
      })
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call virtual payment API
      const response = await fetch('/api/virtual-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points,
          validity,
          totalPrice,
          paymentMethod: selectedPaymentMethod,
          tier: tier?.label
        })
      })
      
      const result = await response.json()
      console.log('Payment API response:', { status: response.status, result })
      
      if (response.ok) {
        console.log('Payment successful!', result)
        setOrderComplete(true)
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push('/payment/success?points=' + points + '&transactionId=' + result.transactionId)
        }, 3000)
      } else {
        console.error('Payment failed:', result)
        throw new Error(result.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Payment failed: ${errorMessage}. Please try again.`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Typography variant="h3" className="text-2xl font-bold mb-2">
              Payment Successful!
            </Typography>
            <Typography variant="body" className="text-muted-foreground mb-4">
              Your {points} points have been added to your account.
            </Typography>
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <Typography variant="body-sm" className="text-muted-foreground mt-2">
              Redirecting to dashboard...
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <Typography variant="h4" className="font-bold">
                  Secure Checkout
                </Typography>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <Typography variant="body-sm" className="text-muted-foreground">
                SSL Secured
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon
                  return (
                    <div
                      key={method.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all duration-200",
                        selectedPaymentMethod === method.id
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-6 w-6" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <Typography variant="body" className="font-medium">
                                {method.name}
                              </Typography>
                              {method.popular && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <Typography variant="body-sm" className="text-muted-foreground">
                              {method.description}
                            </Typography>
                          </div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2",
                          selectedPaymentMethod === method.id
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        )}>
                          {selectedPaymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Card Details Form (only show for card payment) */}
            {selectedPaymentMethod === 'card' && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <Typography variant="body" className="font-medium text-blue-800 dark:text-blue-200">
                    Your payment is secure
                  </Typography>
                  <Typography variant="body-sm" className="text-blue-700 dark:text-blue-300">
                    We use industry-standard encryption to protect your payment information.
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Points Package */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <Typography variant="h4" className="font-bold">
                        {points} Points
                      </Typography>
                    </div>
                    {tier && (
                      <Badge className={cn(
                        "text-white",
                        tier.popular ? "bg-orange-500" : "bg-gray-500"
                      )}>
                        {tier.label}
                        {tier.popular && " ⭐"}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Typography variant="body-sm" className="text-muted-foreground">
                        Price per point
                      </Typography>
                      <Typography variant="body" className="font-medium">
                        ${pricePerPoint.toFixed(3)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-muted-foreground">
                        You save
                      </Typography>
                      <Typography variant="body" className="font-medium text-green-600">
                        {savings}%
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <Typography variant="body" className="font-medium">
                        Validity Period
                      </Typography>
                      <Typography variant="body-sm" className="text-muted-foreground">
                        {validityOption?.description}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="body" className="font-bold">
                    {validity} days
                  </Typography>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Typography variant="body">
                      Base price ({points} × ${(totalPrice / (validityOption?.multiplier || 1) / points).toFixed(3)})
                    </Typography>
                    <Typography variant="body">
                      ${(totalPrice / (validityOption?.multiplier || 1)).toFixed(2)}
                    </Typography>
                  </div>
                  {validityOption && validityOption.multiplier > 1 && (
                    <div className="flex justify-between">
                      <Typography variant="body-sm" className="text-muted-foreground">
                        Extended validity (+{Math.round((validityOption.multiplier - 1) * 100)}%)
                      </Typography>
                      <Typography variant="body-sm" className="text-muted-foreground">
                        +${(totalPrice - (totalPrice / validityOption.multiplier)).toFixed(2)}
                      </Typography>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <Typography variant="h4">Total</Typography>
                    <Typography variant="h4" className="text-orange-600">
                      ${totalPrice.toFixed(2)}
                    </Typography>
                  </div>
                </div>

                {/* Debug Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                  <Typography variant="body-sm" className="font-semibold">Debug Info:</Typography>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAuth}
                    className="w-full"
                  >
                    Check Authentication Status
                  </Button>
                  {authStatus && (
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <pre>{JSON.stringify(authStatus, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg font-semibold"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Complete Purchase - ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Features Included */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <Typography variant="body" className="font-medium text-green-800 dark:text-green-200 mb-2">
                    What's included:
                  </Typography>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Access to 25+ stock platforms</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Commercial licensing included</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>High-quality downloads</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>24/7 customer support</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
