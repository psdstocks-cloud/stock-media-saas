'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Zap, Gift, Crown } from 'lucide-react';
import type { PointPack } from '@/lib/types';

// Helper function to get pack icon and color based on points
const getPackStyle = (points: number) => {
  if (points >= 1000) {
    return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-50 border-yellow-200' };
  } else if (points >= 500) {
    return { icon: Gift, color: 'text-purple-500', bgColor: 'bg-purple-50 border-purple-200' };
  } else {
    return { icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' };
  }
};

// Helper function to calculate value (points per dollar)
const calculateValue = (points: number, price: number) => {
  return Math.round((points / price) * 100) / 100;
};

interface PointPackSelectorProps {
  onPurchase?: (pointPack: PointPack) => void;
}

export function PointPackSelector({ onPurchase }: PointPackSelectorProps) {
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  // Fetch available point packs
  const { data: pointPacks, isLoading, error } = useQuery<PointPack[]>({
    queryKey: ['pointPacks'],
    queryFn: async () => {
      const response = await fetch('/api/point-packs');
      if (!response.ok) throw new Error('Failed to fetch point packs');
      return response.json();
    },
  });

  // Purchase mutation
  const { mutate: purchasePack, isPending: isPurchasing } = useMutation({
    mutationFn: async (pointPackId: string) => {
      const response = await fetch('/api/stripe/checkout-point-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointPackId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      return checkoutUrl;
    },
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePurchase = (pointPack: PointPack) => {
    setSelectedPack(pointPack.id);
    purchasePack(pointPack.id);
    onPurchase?.(pointPack);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load point packs. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!pointPacks || pointPacks.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No point packs are currently available. Please check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Choose Your Point Pack</h3>
        <p className="text-gray-600 mt-2">
          Buy points once and use them whenever you need them. No subscriptions, no commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pointPacks.map((pack) => {
          const { icon: Icon, color, bgColor } = getPackStyle(pack.points);
          const value = calculateValue(pack.points, pack.price);
          const isSelected = selectedPack === pack.id;

          return (
            <Card 
              key={pack.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${bgColor} ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-white shadow-sm">
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                <CardTitle className="text-xl">{pack.name}</CardTitle>
                {pack.description && (
                  <CardDescription className="text-sm">
                    {pack.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {pack.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    ${pack.price.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {value} pts/$
                  </Badge>
                </div>

                <Button
                  onClick={() => handlePurchase(pack)}
                  disabled={isPurchasing && selectedPack === pack.id}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing && selectedPack === pack.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>

              {/* Best Value Badge */}
              {pack.points === Math.max(...pointPacks.map(p => p.points)) && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white">
                    Best Value
                  </Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>
          Points never expire and can be used for any download on our platform.
        </p>
      </div>
    </div>
  );
}
