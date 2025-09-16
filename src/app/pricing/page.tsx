'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Zap, Shield, Clock, CheckCircle, Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { PointPack } from '@/lib/types';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface PricingPlan {
  id: string;
  name: string;
  points: number;
  price: number;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    points: 100,
    price: 9.99,
    features: [
      '100 download credits',
      'All stock sites included',
      'HD quality downloads',
      'Commercial license included',
      'Lifetime access to downloads'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    points: 500,
    price: 39.99,
    features: [
      '500 download credits',
      'All stock sites included',
      '4K quality downloads',
      'Commercial license included',
      'Priority support',
      'Lifetime access to downloads'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business Pack',
    points: 1000,
    price: 69.99,
    features: [
      '1000 download credits',
      'All stock sites included',
      '4K quality downloads',
      'Extended commercial license',
      'Priority support',
      'Team collaboration features',
      'Lifetime access to downloads'
    ]
  }
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for what you use. No subscriptions, no hidden fees. 
            Get instant access to millions of stock photos, videos, and audio files.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-16">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className="relative flex flex-col hover:shadow-xl transition-shadow">
              {plan.popular && (
                <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">
                    ${plan.price}
                  </div>
                  <div className="text-lg text-gray-600">
                    {plan.points} credits
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    router.push('/register');
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Our Service?
                </h2>
                <p className="text-gray-600">
                  Experience the best in stock media with unparalleled benefits.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
                  <p className="text-gray-600">
                    Download your files immediately after purchase.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Licensed</h3>
                  <p className="text-gray-600">
                    All downloads come with commercial licenses.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Lifetime Access</h3>
                  <p className="text-gray-600">
                    Keep your downloads forever, no expiration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of creators who trust our platform for their stock media needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/register')}>
              <Star className="h-5 w-5 mr-2" />
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
