'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { PointsHistory } from '@prisma/client';

export const PointsHistoryTable = () => {
  const { data: history, isLoading } = useQuery<PointsHistory[]>({
    queryKey: ['pointsHistory'],
    queryFn: () => fetch('/api/points/history').then((res) => res.json()),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
        <CardDescription>A complete log of your point transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton className="h-48" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.createdAt), 'PP')}</TableCell>
                  <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className={`text-right font-medium ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.amount > 0 ? `+${item.amount}` : item.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
