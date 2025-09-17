'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface PointBalanceCardProps {
  className?: string;
}

interface UserPoints {
  currentPoints: number;
  totalPoints: number;
  rolloverRecords: Array<{
    amount: number;
    expiresAt: string;
  }>;
}

export function PointBalanceCard({ className }: PointBalanceCardProps) {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/points');
        if (!response.ok) {
          throw new Error('Failed to fetch points');
        }
        const data = await response.json();
        setPoints(data.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            Point Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !points) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            Point Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Failed to load balance</p>
        </CardContent>
      </Card>
    );
  }

  const { currentPoints, totalPoints, rolloverRecords } = points;
  const usagePercentage = totalPoints > 0 ? (currentPoints / totalPoints) * 100 : 0;
  const expiringSoon = rolloverRecords.filter(record => {
    const expiresAt = new Date(record.expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            Point Balance
          </CardTitle>
          <Link href="/dashboard/pricing">
            <Button size="sm" variant="outline" className="h-7 px-3">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy More
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance Display */}
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {currentPoints.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Available Points</p>
        </div>

        {/* Circular Progress Indicator */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                className="text-muted/20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress circle */}
              <path
                className="text-secondary"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${usagePercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {Math.round(usagePercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Points:</span>
            <span className="font-medium">{totalPoints.toLocaleString()}</span>
          </div>
          
          {expiringSoon > 0 && (
            <Badge variant="secondary" className="w-full justify-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {expiringSoon} rollover{expiringSoon > 1 ? 's' : ''} expiring soon
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
