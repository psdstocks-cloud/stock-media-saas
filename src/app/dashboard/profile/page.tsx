'use client';

import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UpdateProfileForm } from '@/components/dashboard/profile/UpdateProfileForm';
import { SubscriptionCard } from '@/components/dashboard/profile/SubscriptionCard';
import { PointsHistoryTable } from '@/components/dashboard/profile/PointsHistoryTable';
import { TeamSettings } from '@/components/dashboard/profile/TeamSettings';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile data.');
      return response.json();
    },
  });

  if (isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <UpdateProfileForm user={{ name: profile.name }} />
        </TabsContent>
        <TabsContent value="subscription" className="mt-4">
          <SubscriptionCard subscription={profile.activeSubscription} pointsBalance={profile.pointsBalance} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <PointsHistoryTable />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}