'use client'

import { DataTable } from './data-table'
import { columns } from './columns'
import { UserWithStatus } from '@/lib/types'

interface UsersTableProps {
  users: UserWithStatus[]
}

export function UsersTable({ users }: UsersTableProps) {
  return <DataTable columns={columns} data={users} />
}
