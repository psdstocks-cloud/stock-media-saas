'use client'

// 1. Import the ColumnDef type
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserActions } from './user-actions'
import { UserWithStatus } from '@/lib/types' // <-- IMPORT the shared type

// 2. Apply the ColumnDef type to the entire array
export const columns: ColumnDef<UserWithStatus>[] = [
  {
    accessorKey: 'name',
    // 3. No need for manual typing here anymore!
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return <div className="font-medium">{name || 'No name'}</div>
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return <div className="text-sm text-gray-500">{email}</div>
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      const variant =
        role === 'SUPER_ADMIN'
          ? 'destructive'
          : role === 'ADMIN'
          ? 'default'
          : 'secondary'
      return <Badge variant={variant}>{role}</Badge>
    },
  },
  {
    accessorKey: 'isSuspended',
    header: 'Status',
    cell: ({ row }) => {
      const isSuspended = row.getValue('isSuspended') as boolean
      return (
        <Badge variant={isSuspended ? 'outline' : 'default'}>
          {isSuspended ? 'Suspended' : 'Active'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return <UserActions user={user} />
    },
  },
]
