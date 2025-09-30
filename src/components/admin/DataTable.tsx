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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Download,
  RefreshCw,
  X,
  SlidersHorizontal
} from 'lucide-react'

interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string; count?: number }[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: string
  searchPlaceholder?: string
  searchKey?: string
  showSearch?: boolean
  showFilters?: boolean
  filterOptions?: FilterOption[]
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
  onFilterChange?: (filters: Record<string, string>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error,
  searchPlaceholder = "Search...",
  searchKey: _searchKey = "name",
  showSearch = true,
  showFilters = false,
  filterOptions = [],
  showBulkActions = false,
  showPagination = true,
  pageSize = 10,
  emptyMessage = "No data found",
  emptyIcon,
  onRefresh,
  onExport,
  onBulkAction,
  selectedRowIds: _selectedRowIds = [],
  onSelectionChange,
  enableRowSelection = false,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

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

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters }
    if (value === 'all' || value === '') {
      delete newFilters[filterKey]
    } else {
      newFilters[filterKey] = value
    }
    setActiveFilters(newFilters)
    
    // Apply filter to table
    const newColumnFilters = Object.entries(newFilters).map(([key, val]) => ({
      id: key,
      value: val
    }))
    setColumnFilters(newColumnFilters)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setColumnFilters([])
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length
  }

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
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-4">
              {showSearch && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="relative"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilterPanel && showFilters && filterOptions.length > 0 && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body" className="font-medium">
                    Filters
                  </Typography>
                  <div className="flex items-center space-x-2">
                    {getActiveFilterCount() > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilterPanel(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterOptions.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <Label className="text-sm font-medium">{filter.label}</Label>
                      <Select
                        value={activeFilters[filter.key] || 'all'}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`All ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All {filter.label}
                          </SelectItem>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                {option.count !== undefined && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {option.count}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Active Filters */}
                {getActiveFilterCount() > 0 && (
                  <div className="space-y-2">
                    <Typography variant="caption" className="text-muted-foreground">
                      Active Filters:
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(activeFilters).map(([key, value]) => {
                        const filter = filterOptions.find(f => f.key === key)
                        const option = filter?.options.find(o => o.value === value)
                        return (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{filter?.label}: {option?.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0 hover:bg-transparent"
                              onClick={() => handleFilterChange(key, 'all')}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
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
