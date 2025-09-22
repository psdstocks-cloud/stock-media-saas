'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Download,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { OrderStatus } from '@/components/dashboard/UnifiedOrderItem';

interface Order {
  id: string;
  title: string;
  stockSite: {
    name: string;
    displayName: string;
  };
  status: OrderStatus;
  cost: number;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  fileName?: string;
  imageUrl?: string;
  taskId?: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'ready':
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      );
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format relative date helper
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return formatDate(dateString);
  }
};

// Action handlers (these would be passed as props in a real implementation)
const handleDownload = async (orderId: string) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/regenerate-download`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate download link');
    }
    
    const data = await response.json();
    
    if (data.success && data.downloadUrl) {
      window.open(data.downloadUrl, '_blank');
    } else {
      throw new Error(data.message || 'Failed to generate download link');
    }
  } catch (error) {
    console.error('Download error:', error);
  }
};

const handleRetry = async (orderId: string) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/retry`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to retry order');
    }
  } catch (error) {
    console.error('Retry error:', error);
  }
};

// Column definitions
export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'title',
    header: 'Order',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center space-x-3">
          {order.imageUrl && (
            <img
              src={order.imageUrl}
              alt={order.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="font-medium text-white truncate max-w-xs">
              {order.title}
            </p>
            <p className="text-sm text-white/50 truncate">
              {order.fileName || 'No filename'}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'stockSite',
    header: 'Source',
    cell: ({ row }) => {
      const stockSite = row.getValue('stockSite') as Order['stockSite'];
      return (
        <Badge variant="outline" className="border-white/30 text-white">
          {stockSite.displayName}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderStatus;
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ row }) => {
      const cost = row.getValue('cost') as number;
      return (
        <span className="text-orange-400 font-medium">
          {cost} pts
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return (
        <div className="text-sm text-white/70">
          <p>{formatDate(date)}</p>
          <p className="text-xs text-white/50">{formatRelativeDate(date)}</p>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const order = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {order.status === 'completed' && order.downloadUrl && (
              <DropdownMenuItem onClick={() => window.open(order.downloadUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {order.status === 'completed' && !order.downloadUrl && (
              <DropdownMenuItem onClick={() => handleDownload(order.id)}>
                <Download className="h-4 w-4 mr-2" />
                Generate Download
              </DropdownMenuItem>
            )}
            {order.status === 'failed' && (
              <DropdownMenuItem onClick={() => handleRetry(order.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Order
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Order ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Additional utility columns for different views
export const compactColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'title',
    header: 'Order',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center space-x-2">
          {order.imageUrl && (
            <img
              src={order.imageUrl}
              alt={order.title}
              className="w-8 h-8 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="font-medium text-white text-sm truncate max-w-32">
              {order.title}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderStatus;
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ row }) => {
      const cost = row.getValue('cost') as number;
      return (
        <span className="text-orange-400 font-medium text-sm">
          {cost} pts
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const order = row.original;
      
      return (
        <div className="flex space-x-1">
          {order.status === 'completed' && order.downloadUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(order.downloadUrl, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {order.status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRetry(order.id)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

// Export types for use in other components
export type { Order };
