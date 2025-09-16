'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserWithRelations } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './user-actions';

export const columns: ColumnDef<UserWithRelations>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'pointsBalance.currentPoints',
    header: 'Points',
    cell: ({ row }) => row.original.pointsBalance?.currentPoints ?? 0,
  },
  {
    accessorKey: 'subscriptions',
    header: 'Subscription',
    cell: ({ row }) => {
      const activeSub = row.original.subscriptions?.find(s => s.status === 'ACTIVE');
      return activeSub ? <Badge>{activeSub.plan.name}</Badge> : <Badge variant="secondary">None</Badge>;
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge variant={row.original.role === 'ADMIN' ? 'default' : 'outline'}>{row.original.role}</Badge>
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];
