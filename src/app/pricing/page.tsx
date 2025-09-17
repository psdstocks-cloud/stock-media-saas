'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Zap, Shield, Clock, CheckCircle, Star, ShoppingCart, ArrowRight, Crown, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { PointPack } from '@/lib/types';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
  icon: any;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual creators and small projects',
    monthlyPrice: 19,
    annualPrice: 15,
    features: [
      '100 downloads per month',
      'HD quality downloads',
      'Commercial license included',
      'Basic support',
      'All stock sites access'
    ],
    icon: Star
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing creative teams and agencies',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      '500 downloads per month',
      '4K quality downloads',
      'Extended commercial license',
      'Priority support',
      'Team collaboration tools',
      'Advanced analytics',
      'API access'
    ],
    popular: true,
    icon: Crown
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Built for large organizations with custom needs',
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      'Unlimited downloads',
      '8K quality downloads',
      'Extended commercial license',
      '24/7 dedicated support',
      'Advanced team management',
      'Custom integrations',
      'White-label options',
      'SLA guarantee'
    ],
    icon: Users
  }
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);

  // Fetch point packs for authenticated users
  const { data: pointPacks, isLoading: isLoadingPacks } = useQuery<PointPack[]>({
    queryKey: ['pointPacks'],
    queryFn: async () => {
      const response = await fetch('/api/point-packs');
      if (!response.ok) throw new Error('Failed to fetch point packs');
      return response.json();
    },
    enabled: !!session, // Only fetch if user is authenticated
  });

  // Redirect authenticated users to dashboard pricing
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard/pricing');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingSkeleton className="h-96" />;
  }

  if (status === 'authenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Flexible Pricing Options</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your Perfect
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Scale your creative workflow with our flexible subscription plans or pay-as-you-go point packs. 
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Tabs */}
        <Tabs defaultValue="subscriptions" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="subscriptions" className="text-lg">Monthly Plans</TabsTrigger>
            <TabsTrigger value="point-packs" className="text-lg">Point Packs</TabsTrigger>
          </TabsList>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions" className="space-y-12">
            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-lg font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  Save 20%
                </Badge>
              )}
            </div>

            {/* Subscription Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {subscriptionPlans.map((plan) => {
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const Icon = plan.icon;
                
                return (
                  <Card key={plan.id} className={`relative flex flex-col hover:shadow-xl transition-all hover:-translate-y-1 ${
                    plan.popular ? 'border-secondary shadow-lg scale-105' : 'border-border'
                  }`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1">
                        Recommended
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon size={32} className="text-primary-foreground" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.description}</CardDescription>
                      
                      <div className="space-y-2 mt-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          ${price}
                          <span className="text-lg text-muted-foreground font-normal">/month</span>
                        </div>
                        {isAnnual && (
                          <p className="text-sm text-muted-foreground">
                            Billed annually (${price * 12}/year)
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-grow">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "secondary" : "outline"}
                        size="lg"
                        onClick={() => router.push('/register')}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Choose {plan.name}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Point Packs */}
          <TabsContent value="point-packs" className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Pay-As-You-Go Point Packs</h2>
              <p className="text-lg text-muted-foreground">
                Perfect for occasional users. Buy points once, use them anytime. Never expire.
              </p>
            </div>

            {isLoadingPacks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading point packs...</p>
              </div>
            ) : pointPacks && pointPacks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pointPacks.map((pack) => (
                  <Card key={pack.id} className="flex flex-col hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{pack.name}</CardTitle>
                      {pack.description && (
                        <CardDescription>{pack.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4 flex-grow">
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                          ${pack.price}
                        </div>
                        <div className="text-lg text-muted-foreground">
                          {pack.points} points
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          ${(pack.price / pack.points).toFixed(2)} per point
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          toast({
                            title: 'Redirecting to purchase...',
                            description: `You'll be redirected to complete your ${pack.name} purchase.`,
                          });
                          router.push('/register');
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Points
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Point packs will be available soon.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Why Choose StockMedia Pro?</h2>
                <p className="text-muted-foreground">
                  Experience the best in stock media with unparalleled benefits.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
                  <p className="text-muted-foreground">
                    Download your files immediately after purchase with our global CDN.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Licensed</h3>
                  <p className="text-muted-foreground">
                    All downloads come with commercial licenses and enterprise-grade security.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Lifetime Access</h3>
                  <p className="text-muted-foreground">
                    Keep your downloads forever with no expiration dates or usage limits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who trust our platform for their stock media needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
              <ArrowRight className="h-5 w-5 mr-2" />
              Create Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
