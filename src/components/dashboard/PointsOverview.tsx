'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Zap } from 'lucide-react';
import useUserStore from '@/stores/userStore';

const PointsOverview = () => {
  const { points, isLoading } = useUserStore();

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-orange-500 text-white shadow-2xl border-0 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-normal tracking-tight flex items-center">
          <Coins className="h-5 w-5 mr-2" />
          Your Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-5xl font-bold text-white mb-2">
          {isLoading ? (
            <div className="animate-pulse bg-white/20 rounded h-12 w-32"></div>
          ) : points === null ? (
            '...'
          ) : (
            points.toLocaleString()
          )}
        </div>
        <p className="text-sm text-white/90 mb-4">Points Available</p>
        
        {/* Additional Info */}
        <div className="space-y-2 text-xs text-white/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Status
            </span>
            <span className="font-medium text-green-200">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Ready to Order
            </span>
            <span className="font-medium text-yellow-200">Yes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsOverview;