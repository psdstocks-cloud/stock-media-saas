'use client';

import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const SubscriptionCard = ({ subscription, pointsBalance }: { subscription: any; pointsBalance: any }) => {
  const { toast } = useToast();
  
  const { mutate, isPending } = useMutation({
      mutationFn: () => fetch('/api/stripe/portal').then(res => res.json()),
      onSuccess: (data) => {
          if (data.url) {
              window.location.href = data.url;
          } else {
              throw new Error("Could not retrieve billing portal URL.");
          }
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>Manage your subscription and payment details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <div>
            <p><strong>Current Plan:</strong> {subscription.plan.name}</p>
            <p><strong>Current Points:</strong> {pointsBalance?.currentPoints || 0}</p>
            <p><strong>Next Billing Date:</strong> {format(new Date(subscription.endDate), 'MMMM dd, yyyy')}</p>
          </div>
        ) : (
          <p>You do not have an active subscription.</p>
        )}
        <Button onClick={() => mutate()} disabled={isPending}>
          {isPending ? 'Redirecting...' : 'Manage Billing'}
        </Button>
      </CardContent>
    </Card>
  );
};
