'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useUserStore from '@/stores/userStore'; // Import the new store

const PointsOverview = () => {
  const { points } = useUserStore(); // Get points from the central store

  return (
    <Card className="bg-indigo-700 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-normal tracking-tight">Your Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-orange-400">
          {points === null ? '...' : points}
        </div>
        <p className="text-sm text-indigo-200 mt-1">Points Available</p>
      </CardContent>
    </Card>
  );
};

export default PointsOverview;