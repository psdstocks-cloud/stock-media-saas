'use client'

import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: string
  searchPlaceholder?: string
  searchKey?: string
  showSearch?: boolean
  showFilters?: boolean
  showBulkActions?: boolean
  showPagination?: boolean
  pageSize?: number
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onRefresh?: () => void
  onExport?: () => void
  onBulkAction?: (selectedIds: string[], action: string) => void
  selectedRowIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  enableRowSelection?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error,
  searchPlaceholder = "Search...",
  searchKey = "name",
  showSearch = true,
  showFilters = false,
  showBulkActions = false,
  showPagination = true,
  pageSize = 10,
  emptyMessage = "No data found",
  emptyIcon,
  onRefresh,
  onExport,
  onBulkAction,
  selectedRowIds = [],
  onSelectionChange,
  enableRowSelection = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Add selection column if enabled
  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Handle row selection changes
  React.useEffect(() => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => {
      const data = row.original as any
      return data.id || data.userId || data.orderId
    }).filter(Boolean)
    
    if (onSelectionChange) {
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, table, onSelectionChange])

  const handleBulkAction = (action: string) => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => {
      const data = row.original as any
      return data.id || data.userId || data.orderId
    }).filter(Boolean)
    
    if (onBulkAction && selectedIds.length > 0) {
      onBulkAction(selectedIds, action)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        {(showSearch || showFilters) && (
          <div className="flex items-center space-x-4 mt-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            {showFilters && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Typography variant="caption" color="muted">
                  Filters coming soon
                </Typography>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Bulk Actions */}
        {showBulkActions && table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <Typography variant="body" className="font-medium">
                {table.getFilteredSelectedRowModel().rows.length} item{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''} selected
              </Typography>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  Export Selected
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left p-4 font-medium"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {tableColumns.map((_, j) => (
                      <td key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="text-center p-8">
                    {emptyIcon}
                    <Typography variant="h3" className="mb-2">
                      {emptyMessage}
                    </Typography>
                    <Typography variant="body" color="muted">
                      {globalFilter ? 'Try adjusting your search query' : 'No data available'}
                    </Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/50"
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && table.getPageCount() > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Typography variant="caption" color="muted">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </Typography>
              <Typography variant="caption" color="muted">
                ({table.getFilteredRowModel().rows.length} total items)
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTable
