'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import type { OrderWithStockSite } from '@/lib/types';
import { useState } from 'react';
import React from 'react';

// Helper to determine badge color based on status
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toUpperCase()) {
    case 'READY':
    case 'COMPLETED':
      return 'default';
    case 'PROCESSING':
      return 'secondary';
    case 'FAILED':
    case 'CANCELED':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Fetch the user's orders
  const { data: orders, isLoading, error } = useQuery<OrderWithStockSite[]>({
    queryKey: ['userOrders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders.');
      return response.json();
    },
    // Poll every 5 seconds if there are processing orders
    refetchInterval: pollingEnabled ? 5000 : false,
  });

  // Handle polling logic with useEffect
  React.useEffect(() => {
    if (orders) {
      // If there are no more processing orders, stop polling
      const isStillProcessing = orders.some(order => order.status === 'PROCESSING');
      if (!isStillProcessing) {
        setPollingEnabled(false);
      } else {
        setPollingEnabled(true); // Re-enable if a new processing order appears
      }
    }
  }, [orders]);
  
  // Mutation to regenerate a download link
  const { mutate: regenerateLink, isPending: isRegenerating } = useMutation({
    mutationFn: (orderId: string) => 
      fetch(`/api/orders/${orderId}/regenerate-download`, { method: 'POST' }),
    onSuccess: async (res, orderId) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to regenerate link.');
      }
      toast({ title: 'Success', description: 'New download link generated!' });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });


  if (isLoading) {
    return <LoadingSkeleton className="h-64" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Image
                      src={order.imageUrl || '/placeholder.svg'}
                      alt={order.title || 'Stock Media'}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.title}</TableCell>
                  <TableCell>{order.cost} pts</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {order.status === 'READY' || order.status === 'COMPLETED' ? (
                      <Button asChild variant="default" size="sm">
                        <a href={order.downloadUrl || '#'} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" /> Download
                        </a>
                      </Button>
                    ) : order.status === 'FAILED' || order.status === 'CANCELED' ? (
                       <Button onClick={() => regenerateLink(order.id)} variant="outline" size="sm" disabled={isRegenerating}>
                          <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} /> Retry
                        </Button>
                    ) : (
                      <span className="text-xs text-gray-500">Processing...</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              You haven't placed any orders yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
