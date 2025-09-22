'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export type OrderStatus = 'ready' | 'ordering' | 'processing' | 'completed' | 'failed';

export interface UnifiedOrderItemData {
  url: string;
  parsedData?: {
    source: string;
    id: string;
  };
  stockSite?: {
    displayName: string;
    name: string;
  };
  stockInfo?: {
    title: string;
    image: string;
    points: number;
  };
  status: OrderStatus;
  progress?: number;
  downloadUrl?: string;
  error?: string;
  orderId?: string;
  success?: boolean;
}

interface UnifiedOrderItemProps {
  item: UnifiedOrderItemData;
  onOrder: (item: UnifiedOrderItemData) => void;
  onRemove: (url: string) => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus, downloadUrl?: string) => void;
  userPoints?: number;
}

export const UnifiedOrderItem: React.FC<UnifiedOrderItemProps> = ({ 
  item, 
  onOrder, 
  onRemove, 
  onStatusUpdate,
  userPoints = 0 
}) => {
  const { url, parsedData, stockSite, stockInfo, status, progress, downloadUrl, error } = item;

  const renderStatus = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-full text-center">
            <Progress value={progress || 0} className="h-2 mb-2" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        );
      case 'completed':
        return (
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        );
      case 'failed':
        return (
          <div className="text-center">
            <Badge variant="destructive" className="mb-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed
            </Badge>
            <p className="text-xs text-destructive mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => onOrder(item)}
            >
              Retry
            </Button>
          </div>
        );
      case 'ordering':
        return (
          <Button className="w-full" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Ordering...
          </Button>
        );
      default: // 'ready' state
        const canOrder = userPoints >= (stockInfo?.points || 0);
        return (
          <Button 
            className="w-full" 
            onClick={() => onOrder(item)}
            disabled={!canOrder}
          >
            {canOrder ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Order for {stockInfo?.points || 0} Points
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Need {stockInfo?.points || 0} Points
              </>
            )}
          </Button>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'ordering': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {stockInfo?.image ? (
              <Image
                src={stockInfo.image}
                alt={stockInfo.title || 'Stock media item'}
                width={80}
                height={80}
                className="rounded-md object-cover aspect-square"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {stockInfo?.title || 'Loading...'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stockSite?.displayName || parsedData?.source || 'Unknown source'}
                </p>
                {stockInfo?.points && (
                  <p className="text-xs font-medium text-orange-600 mt-1">
                    {stockInfo.points} Points
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <Badge className={`ml-2 ${getStatusColor()}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 w-32">
            {renderStatus()}
          </div>

          {/* Remove Button (only for ready state) */}
          {status === 'ready' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 text-gray-400 hover:text-red-500" 
              onClick={() => onRemove(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};