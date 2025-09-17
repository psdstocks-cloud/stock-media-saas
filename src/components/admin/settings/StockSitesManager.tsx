'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import type { StockSite } from '@prisma/client';

export function StockSitesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [siteSettings, setSiteSettings] = useState<StockSite[]>([]);

  const { data: sites, isLoading } = useQuery<StockSite[]>({
    queryKey: ['adminStockSites'],
    queryFn: async () => {
        const res = await fetch('/api/admin/settings/stock-sites');
        if (!res.ok) throw new Error('Failed to fetch stock sites.');
        return res.json();
    },
  });

  useEffect(() => {
    if (sites) setSiteSettings(sites);
  }, [sites]);

  const handleSettingChange = (id: string, field: 'isActive' | 'cost', value: boolean | number) => {
    setSiteSettings(prev => 
      prev.map(site => site.id === id ? { ...site, [field]: value } : site)
    );
  };
  
  const { mutate: saveChanges, isPending } = useMutation({
      mutationFn: (updatedSites: StockSite[]) => fetch('/api/admin/settings/stock-sites', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSites)
      }),
      onSuccess: () => {
          toast({ title: 'Success', description: 'Settings saved successfully.' });
          queryClient.invalidateQueries({ queryKey: ['adminStockSites'] });
      },
      onError: () => {
          toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
      }
  });

  if (isLoading) return <LoadingSkeleton className="h-64" />;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Manage Stock Sites</CardTitle>
            <CardDescription>Activate or deactivate sites and set the point cost for downloads.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="w-[120px]">Point Cost</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {siteSettings.map(site => (
                        <TableRow key={site.id}>
                            <TableCell className="font-medium">{site.displayName}</TableCell>
                            <TableCell className="capitalize">{site.category}</TableCell>
                            <TableCell>
                                <Switch
                                    checked={site.isActive}
                                    onCheckedChange={(checked) => handleSettingChange(site.id, 'isActive', checked)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={site.cost}
                                    onChange={(e) => handleSettingChange(site.id, 'cost', parseInt(e.target.value) || 0)}
                                    className="w-full"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button onClick={() => saveChanges(siteSettings)} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </Card>
  );
}
