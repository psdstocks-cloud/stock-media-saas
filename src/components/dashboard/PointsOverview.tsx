'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Zap } from 'lucide-react';
import useUserStore from '@/stores/userStore';

const PointsOverview = () => {
  const { points, isLoading } = useUserStore();

  return (
    <Card className="surface-card shadow-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-normal tracking-tight flex items-center text-[hsl(var(--card-foreground))]">
          <Coins className="h-5 w-5 mr-2" aria-hidden="true" />
          Your balance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-5xl font-bold text-[hsl(var(--card-foreground))] mb-2">
          {isLoading ? (
            <div className="animate-pulse bg-[hsl(var(--muted))] rounded h-12 w-32"></div>
          ) : points === null ? (
            '...'
          ) : (
            points.toLocaleString()
          )}
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Points available</p>
        
        {/* Additional Info */}
        <div className="space-y-2 text-xs text-white/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-[hsl(var(--muted-foreground))]">
              <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
              Status
            </span>
            <span className="font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-[hsl(var(--muted-foreground))]">
              <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
              Ready to Order
            </span>
            <span className="font-medium text-yellow-600">Yes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsOverview;