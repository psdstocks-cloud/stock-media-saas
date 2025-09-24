'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandButton } from '@/components/ui/brand-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
// import { SUPPORTED_SITES } from '@/lib/supported-sites';
import { officialParseStockUrl } from '@/lib/official-url-parser';
import { 
  ShoppingCart, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Copy,
  Check
} from 'lucide-react';
import PointsOverview from '@/components/dashboard/PointsOverview';
import { useOrderStore } from '@/stores/orderStore';
import { UnifiedOrderItem } from '@/components/dashboard/UnifiedOrderItem';

interface OrderItem {
  id: string;
  url: string;
  site: string;
  siteId: string;
  title: string;
  cost: number;
  imageUrl: string;
  status: 'ready' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
  error?: string;
  isPreviouslyOrdered?: boolean;
  existingOrderId?: string;
  isLoading?: boolean;
  isQueued?: boolean;
}

interface SupportedSite {
  name: string;
  displayName: string;
  url: string;
  cost: number;
  description?: string;
  category?: string;
  icon?: string;
  isActive?: boolean;
}

export default function OrderV3Page() {
  const { points: currentPoints } = useUserStore();
  const [urls, setUrls] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [supportedSites, setSupportedSites] = useState<SupportedSite[]>([])
  const [sitesLoading, setSitesLoading] = useState(false)
  const [copiedSite, setCopiedSite] = useState<string>('')
  const [copyAnnounce, setCopyAnnounce] = useState<string>('')
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('')
  const [liveAssertive, setLiveAssertive] = useState<string>('')
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [sseFailures, setSseFailures] = useState<Record<string, number>>({})
  const [pollingFallbackIds, setPollingFallbackIds] = useState<Record<string, boolean>>({})
  // Button refs are queried via data-* attributes to avoid ref typing on custom buttons
  const [orderBatchError, setOrderBatchError] = useState<string>('')
  const [queuedParses, setQueuedParses] = useState<string[]>([])
  const [queuedOrderBatch, setQueuedOrderBatch] = useState<boolean>(false)
  const [queuedItemOrders, setQueuedItemOrders] = useState<string[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)
  const [focusIndex, setFocusIndex] = useState<number>(-1)

  const focusItemWrapper = (itemId: string) => {
    try {
      const root = document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement | null
      if (root) {
        const cta = root.querySelector('[data-primary-cta]') as HTMLElement | null
        if (cta && typeof (cta as any).focus === 'function') {
          (cta as any).focus()
          return
        }
        root.focus()
      }
    } catch {
      // no-op: clipboard focus fallback not critical
    }
  }

  // Keep focus index within bounds when items change
  useEffect(() => {
    if (focusIndex >= items.length) {
      setFocusIndex(items.length - 1)
    }
  }, [items.length, focusIndex])

  const onKeyNavigate = (e: React.KeyboardEvent) => {
    if (items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = focusIndex < 0 ? 0 : Math.min(items.length - 1, focusIndex + 1)
      setFocusIndex(next)
      const id = items[next]?.id
      if (id) focusItemWrapper(id)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = focusIndex <= 0 ? 0 : focusIndex - 1
      setFocusIndex(prev)
      const id = items[prev]?.id
      if (id) focusItemWrapper(id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setFocusIndex(0)
      const id = items[0]?.id
      if (id) focusItemWrapper(id)
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = items.length - 1
      setFocusIndex(last)
      const id = items[last]?.id
      if (id) focusItemWrapper(id)
    }
  }

  // v3 store (lightweight cart)
  const addUrl = useOrderStore((s) => s.addUrl)
  const updateItemStatus = useOrderStore((s) => s.updateItemStatus)
  const removeCartItem = useOrderStore((s) => s.removeItem)

  const enrichItemWithStockInfo = async (item: OrderItem) => {
    try {
      updateItemStatus?.(item.id, 'processing')
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' as const } : i))
      const resp = await fetch('/api/stock-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url })
      })
      const json = await resp.json()
      if (json && json.success) {
        const stockInfo = json.data?.stockInfo
        const platform = json.data?.stockSite?.displayName || item.site
        const points = Number(stockInfo?.points ?? 10)
        const image = stockInfo?.image || item.imageUrl
        updateItemStatus?.(item.id, 'ready', { data: { title: item.title, thumbnail: image, points, platform } })
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ready' as const, imageUrl: image, cost: points, isLoading: false } : i))
        setLiveAnnouncement('Item details loaded. You can place the order now.')
      } else {
        const errMsg = json?.message || 'Failed to fetch stock info'
        updateItemStatus?.(item.id, 'error', { errorMessage: errMsg })
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'failed' as const, error: errMsg, isLoading: false } : i))
        setLiveAnnouncement('Failed to fetch item details. You can try again.')
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Network error'
      updateItemStatus?.(item.id, 'error', { errorMessage: errMsg })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'failed' as const, error: errMsg, isLoading: false } : i))
      setLiveAnnouncement('Failed to fetch item details. You can try again.')
    }
  }

  // Load supported platforms from API
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setSitesLoading(true)
        const res = await fetch('/api/supported-sites')
        const data = await res.json()
        if (!ignore && data?.success && Array.isArray(data.sites)) {
          setSupportedSites(data.sites)
        }
      } catch (e) {
        // ignore
      } finally {
        if (!ignore) setSitesLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Online/offline detection
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    const onCameOnline = () => {
      if (queuedParses.length > 0) {
        const payload = queuedParses[0]
        setQueuedParses(prev => prev.slice(1))
        setUrls(payload)
        setLiveAnnouncement('You are back online. Running queued parse now.')
        toast('Queued parse resumed')
        setTimeout(() => { void parseUrls() }, 50)
      }
      if (queuedOrderBatch) {
        setQueuedOrderBatch(false)
        setLiveAnnouncement('You are back online. Placing queued orders now.')
        toast('Queued orders resumed')
        setTimeout(() => { void confirmOrdersBatch() }, 50)
      }
      if (queuedItemOrders.length > 0) {
        const toRun = [...queuedItemOrders]
        setQueuedItemOrders([])
        setLiveAnnouncement('You are back online. Processing queued items now.')
        toast('Queued items resumed')
        setTimeout(() => {
          toRun.forEach((id) => {
            const target = items.find(i => i.id === id)
            if (target) void processOrder(target)
          })
        }, 50)
      }
    }
    window.addEventListener('online', onCameOnline)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      window.removeEventListener('online', onCameOnline)
    }
  }, [])

  // Filter sites based on search term
  const filteredSites = supportedSites.filter(site =>
    site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Curated example URLs per platform (brand-friendly, valid patterns)
  const EXAMPLE_URLS: Record<string, string> = {
    shutterstock: 'https://www.shutterstock.com/image-photo/smiling-baby-girl-lying-on-bed-420756877',
    adobestock: 'https://stock.adobe.com/images/minimal-product-catalog-layout/454407674',
    depositphotos: 'https://depositphotos.com/photo/stanley-neighborhood-alexandria-egypt-182879584.html',
    dreamstime: 'https://www.dreamstime.com/freelance-people-work-comfortable-conditions-set-vector-flat-illustration-freelancer-character-working-home-freelance-image169271221',
    epidemicsound: 'https://www.epidemicsound.com/sound-effects/tracks/6a513424-c3b4-4fd3-af6e-73fa5cfd861d/',
    vectorstock: 'https://www.vectorstock.com/royalty-free-vector/minimal-abstract-shapes-vector-1120004'
  }

  const exampleChips = supportedSites
    .filter(s => EXAMPLE_URLS[s.name])
    .slice(0, 8)
    .map(s => ({ name: s.name, displayName: s.displayName, example: EXAMPLE_URLS[s.name] }))

  const handleCopyExample = async (siteName: string, exampleUrl: string) => {
    try {
      await navigator.clipboard.writeText(exampleUrl)
      setCopiedSite(siteName)
      setCopyAnnounce(`${siteName} example URL copied to clipboard`)
      toast.success('Example URL copied')
      // Focus textarea for quick paste/parse
      if (textAreaRef.current) {
        textAreaRef.current.focus()
      }
      setTimeout(() => { setCopiedSite(''); setCopyAnnounce('') }, 1200)
    } catch {
      toast.error('Copy failed')
    }
  }

  const handlePasteExample = (exampleUrl: string) => {
    const lines = urls ? urls.split('\n') : []
    if (lines.length >= 5) {
      toast.error('Maximum 5 URLs allowed at once')
      return
    }
    const next = (urls && !urls.endsWith('\n')) ? `${urls}\n${exampleUrl}` : `${urls}${exampleUrl}`
    setUrls(next)
    setLiveAnnouncement('Example URL pasted. Ready to parse.')
    if (textAreaRef.current) {
      textAreaRef.current.focus()
      const pos = next.length
      try {
        textAreaRef.current.setSelectionRange(pos, pos)
      } catch {
        // no-op: selection range may fail on some browsers
      }
    }
  }

  const parseUrls = async () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL');
      return;
    }

    setIsLoading(true);
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length > 5) {
      toast.error('Maximum 5 URLs allowed at once');
      setIsLoading(false);
      return;
    }

    const prevFocus = document.activeElement as HTMLElement | null
    try {
      const newItems: OrderItem[] = [];
      
      const unique = new Set<string>()
      const uniques: string[] = []
      const duplicates: string[] = []
      for (const raw of urlList) {
        const url = raw.trim()
        if (unique.has(url)) {
          duplicates.push(url)
        } else {
          unique.add(url)
          uniques.push(url)
        }
      }

      if (duplicates.length > 0) {
        toast((t) => (
          <span>
            Found {duplicates.length} duplicate URL(s). We kept {uniques.length} unique.
          </span>
        ))
      }

      for (const url of uniques) {
        try {
          // Parse URL to get site and ID
          const parseResult = officialParseStockUrl(url);
          
          if (!parseResult) {
            toast.error(`Unsupported URL format: ${url}`);
            setLiveAssertive('One or more URLs are invalid. Please review and try again.')
            // Move focus to the invalid URL range in the textarea
            if (textAreaRef.current) {
              const allLines = urls.split('\n')
              const idx = allLines.findIndex(l => l.trim() === url.trim())
              if (idx >= 0) {
                let start = 0
                for (let i = 0; i < idx; i++) start += allLines[i].length + 1
                const end = start + allLines[idx].length
                try {
                  textAreaRef.current.focus()
                  textAreaRef.current.setSelectionRange(start, end)
                } catch {
                  // no-op: selection range may fail on some browsers
                }
              } else {
                textAreaRef.current.focus()
              }
            }
            continue;
          }

          // Check if this file has been ordered before
          const historyResponse = await fetch('/api/orders');
          const historyData = await historyResponse.json();
          const existingOrder = historyData.success ? 
            historyData.orders.find((order: any) => 
              order.stockItemId === parseResult.id && 
              order.stockSite?.name === parseResult.source &&
              (order.status === 'COMPLETED' || order.status === 'READY')
            ) : null;
          
          const isPreviouslyOrdered = !!existingOrder;
          
          // Create item
          const item: OrderItem = {
            id: `${parseResult.source}-${parseResult.id}-${Date.now()}`,
            url: url,
            site: parseResult.source,
            siteId: parseResult.id,
            title: `${parseResult.source.charAt(0).toUpperCase() + parseResult.source.slice(1)} - ${parseResult.id}`,
            cost: isPreviouslyOrdered ? 0 : 10,
            imageUrl: '',
            status: 'processing',
            isLoading: true,
            isPreviouslyOrdered: isPreviouslyOrdered,
            existingOrderId: existingOrder?.id
          };
          
          newItems.push(item);
          // v3 store entry as pending until explicit order
          addUrl?.(url)
          
          if (isPreviouslyOrdered) {
            toast.success(`Found previously ordered file - Download for FREE!`);
            setLiveAnnouncement('Previously ordered file found. You can download for free.')
          } else {
            toast.success(`Successfully parsed ${parseResult.source} URL`);
            setLiveAnnouncement('URL parsed successfully.')
          }

          addUrl?.(url, item.id)
          void enrichItemWithStockInfo(item)
        } catch (error) {
          toast.error(`Error processing URL: ${url}`);
        }
      }

      setItems(newItems);
      setUrls('');
    } catch (error) {
      toast.error('Failed to parse URLs');
    } finally {
      setIsLoading(false);
      if (prevFocus) {
        try { prevFocus.focus() } catch {
          // no-op
        }
      } else {
        const parseBtn = document.querySelector('[data-parse-btn]') as HTMLElement | null
        if (parseBtn) {
          try { parseBtn.focus() } catch {
            // no-op
          }
        }
      }
    }
  };

  const processOrder = async (item: OrderItem) => {
    const prevFocus = document.activeElement as HTMLElement | null
    try {
      // If offline, queue and exit
      if (!isOnline) {
        setQueuedItemOrders(prev => (prev.includes(item.id) ? prev : [...prev, item.id]))
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isQueued: true, status: 'ready' as const } : i))
        setLiveAnnouncement('You are offline. This item order is queued and will resume when back online.')
        toast('Queued item order to run when you are back online')
        return
      }

      // Update status to processing when online
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'processing' as const, isQueued: false } : i
      ));
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: item.url,
          site: item.site,
          id: item.siteId,
          title: item.title,
          cost: item.cost,
          imageUrl: item.imageUrl,
          isRedownload: true // Always generate fresh link
        }])
      });

      const data = await response.json();
      
      if (data.success) {
        // Start polling for status updates
        pollOrderStatus(item.id, data.orders[0].id);
        toast.success('Generating download link...');
      } else {
        throw new Error(data.error || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setItems(prev => prev.map(i => 
        i.id === item.id ? { 
          ...i, 
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Failed to process order'
        } : i
      ));
      toast.error('Failed to process order');
      setLiveAssertive('Failed to place order. Try again.')
    } finally {
      if (prevFocus) {
        try { prevFocus.focus() } catch {
          // no-op
        }
      }
    }
  };

  const pollOrderStatus = async (itemId: string, orderId: string) => {
    setLiveAnnouncement('Realtime updates unavailable. Switched to polling.')
    setPollingFallbackIds(prev => ({ ...prev, [itemId]: true }))
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`);
        const data = await response.json();
        
        if (data.success) {
          const status = data.order.status;
          const isCompleted = status === 'READY' || status === 'COMPLETED';
          const isFailed = status === 'FAILED';
          
          if (isCompleted) {
            setItems(prev => prev.map(i => 
              i.id === itemId ? { 
                ...i, 
                status: 'completed' as const,
                downloadUrl: data.order.downloadUrl,
                fileName: data.order.fileName
              } : i
            ));
            setPollingFallbackIds(prev => ({ ...prev, [itemId]: false }))
            focusItemWrapper(itemId)
            clearInterval(pollInterval);
            
            // Automatically trigger download
            if (data.order.downloadUrl) {
              if (data.order.downloadUrl.includes('example.com')) {
                toast.success('This is a demo download. In production, this would download the actual file.');
              } else {
                setLiveAnnouncement('Download started.')
                window.open(data.order.downloadUrl, '_blank');
                toast.success('Download started!');
              }
            } else {
              toast.success('Download link ready!');
            }
          } else if (isFailed) {
            setItems(prev => prev.map(i => 
              i.id === itemId ? { 
                ...i, 
                status: 'failed' as const,
                error: 'Order processing failed'
              } : i
            ));
            setPollingFallbackIds(prev => ({ ...prev, [itemId]: false }))
            focusItemWrapper(itemId)
            clearInterval(pollInterval);
            toast.error('Order processing failed');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const startOrderStream = (orderId: string, itemId: string) => {
    try {
      // If EventSource is unavailable (e.g., some older Safari/Firefox environments), fallback to polling
      if (typeof window !== 'undefined' && typeof (window as any).EventSource === 'undefined') {
        setLiveAnnouncement('Realtime updates unavailable in this browser. Switched to polling.')
        setPollingFallbackIds(prev => ({ ...prev, [itemId]: true }))
        pollOrderStatus(itemId, orderId)
        return
      }
      const es = new EventSource(`/api/orders/${orderId}/stream`)
      es.onopen = () => {
        setPollingFallbackIds(prev => ({ ...prev, [itemId]: false }))
        setSseFailures(prev => ({ ...prev, [itemId]: 0 }))
        setLiveAnnouncement('Realtime connection established.')
      }
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data || '{}')
          const status: string | undefined = data.status
          const percentage: number | undefined = data.percentage
          const downloadUrl: string | undefined = data.downloadUrl

          if (status === 'progress' && typeof percentage === 'number') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'processing' as const } : i))
          } else if (status === 'COMPLETED' || status === 'READY' || status === 'complete') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'completed' as const, downloadUrl } : i))
            setLiveAnnouncement('Download is ready.')
            focusItemWrapper(itemId)
            es.close()
          } else if (status === 'FAILED' || status === 'failed') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'failed' as const } : i))
            setLiveAnnouncement('Order failed. You can try again.')
            focusItemWrapper(itemId)
            es.close()
          }
        } catch (e) {
          // Ignore malformed SSE data
        }
      }
      es.onerror = () => {
        es.close()
        // retry with backoff (max 3 attempts); fallback to polling afterwards
        setSseFailures(prev => {
          const count = (prev[itemId] || 0) + 1
          const next = { ...prev, [itemId]: count }
          if (count <= 3) {
            setLiveAnnouncement('Realtime connection lost. Retrying...')
            setTimeout(() => startOrderStream(orderId, itemId), count * 1000)
          } else {
            setLiveAnnouncement('Realtime connection lost. Reconnected via fallback.')
            setPollingFallbackIds(p => ({ ...p, [itemId]: true }))
            pollOrderStatus(itemId, orderId)
          }
          return next
        })
      }
    } catch (e) {
      // SSE unavailable; skip streaming in this environment
    }
  }

  const confirmOrdersBatch = async () => {
    const readyItems = items.filter(item => item.status === 'ready');
    const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
    
    if (!currentPoints || currentPoints < totalCost) {
      toast.error('Insufficient points for all orders');
      return;
    }

    setIsProcessing(true);
    setOrderBatchError('')

    try {
      const payload = readyItems.map((item) => ({
        url: item.url,
        site: item.site,
        id: item.siteId,
        title: item.title,
        cost: item.cost,
        imageUrl: item.imageUrl,
        isRedownload: !!item.isPreviouslyOrdered
      }))

      if (!isOnline) {
        setQueuedOrderBatch(true)
        const ids = readyItems.map(i => i.id)
        setQueuedItemOrders(prev => Array.from(new Set([...prev, ...ids])))
        setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, isQueued: true } : i))
        setLiveAnnouncement('You are offline. Orders queued and will place when back online.')
        toast('Queued orders to place when back online')
        return
      }

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (!data?.success || !Array.isArray(data.orders)) {
        throw new Error(data?.error || 'Failed to place orders')
      }

      setItems(prev => prev.map(i => readyItems.find(r => r.id === i.id) ? { ...i, status: 'processing' as const } : i))

      data.orders.forEach((order: any, idx: number) => {
        const item = readyItems[idx]
        if (order?.id && item) {
          startOrderStream(order.id, item.id)
        }
      })

      toast.success('Orders placed. Tracking progress...')
      setLiveAnnouncement('Orders placed. Tracking progress...')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to place orders'
      setOrderBatchError(msg)
      toast.error(msg)
      setLiveAssertive('Failed to place orders. Try again.')
    } finally {
      setIsProcessing(false)
      // restore focus to a primary action if present
      const confirmBtn = document.querySelector('[data-confirm-btn]') as HTMLElement | null
      const orderAllBtn = document.querySelector('[data-orderall-btn]') as HTMLElement | null
      if (confirmBtn) {
        try { confirmBtn.focus() } catch {
          // no-op
        }
      } else if (orderAllBtn) {
        try { orderAllBtn.focus() } catch {
          // no-op
        }
      }
    }
  }

  const processAllOrders = async () => {
    const readyItems = items.filter(item => item.status === 'ready');
    const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
    
    if (!currentPoints || currentPoints < totalCost) {
      toast.error('Insufficient points for all orders');
      return;
    }

    setIsProcessing(true);
    
    // Process all items
    for (const item of readyItems) {
      await processOrder(item);
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsProcessing(false);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    removeCartItem?.(itemId)
  };

  const getStatusIcon = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const readyItems = items.filter(item => item.status === 'ready');
  const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
  const anyRetryingSse = Object.keys(sseFailures).some((id) => (sseFailures[id] || 0) > 0 && !pollingFallbackIds[id])
  const listBusy = isProcessing || items.some(i => i.isLoading || i.status === 'processing')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Offline banner */}
        {!isOnline && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 text-orange-800 px-4 py-3" role="status" aria-live="polite">
            You are offline. Actions will resume when connection is restored.
          </div>
        )}

        {/* Global live region */}
        <span className="sr-only" role="status" aria-live="polite">{liveAnnouncement}</span>
      <span className="sr-only" role="alert" aria-live="assertive">{liveAssertive}</span>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Stock Media
          </h1>
          <p className="text-lg text-gray-600">
            Download premium stock media from 50+ platforms
          </p>
        </div>

        {/* Points Overview */}
        <div className="flex justify-end">
          <div className="max-w-sm w-full">
            <PointsOverview />
          </div>
        </div>

        {/* URL Input */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Stock Media URLs</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Paste your stock media URLs here (one per line, max 5 URLs)
            </p>
          </CardHeader>
          <CardContent>
            {/* Copy examples toolbar */}
            {exampleChips.length > 0 && (
              <div className="mb-4" aria-label="Quick example URLs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick examples</span>
                  <span className="text-xs text-gray-500">Tap to copy • Brand-safe</span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {exampleChips.map(chip => (
                    <button
                      key={chip.name}
                      type="button"
                      onClick={() => handleCopyExample(chip.name, chip.example)}
                      aria-label={`Copy ${chip.displayName} example URL`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all duration-200 bg-white/70 hover:bg-white shadow-sm hover:shadow-md border-purple-200/60 hover:border-purple-400 ${copiedSite === chip.name ? 'scale-95 ring-2 ring-purple-400/50' : ''}`}
                    
                    >
                      <img src={`/assets/icons/${chip.name}.svg`} alt="" className="w-4 h-4" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-gray-700">{chip.displayName}</span>
                      {copiedSite === chip.name ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
                <span className="sr-only" role="status" aria-live="polite">{copyAnnounce}</span>
              </div>
            )}
            <textarea
              placeholder="Paste your stock media URLs here (one per line, max 5 URLs)..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              ref={textAreaRef}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <p className={`text-sm ${urls.split('\n').filter(url => url.trim()).length > 5 ? 'text-red-500' : 'text-gray-500'}`}>
                  {urls.split('\n').filter(url => url.trim()).length}/5 URLs • Each item costs 10 points
                </p>
                {urls.split('\n').filter(url => url.trim()).length > 5 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Maximum 5 URLs allowed. Please remove extra URLs to proceed.
                  </p>
                )}
              </div>
              <BrandButton 
                data-parse-btn
                onClick={() => {
                  if (!isOnline) {
                    setQueuedParses(prev => [...prev, urls])
                    setLiveAnnouncement('You are offline. Parse queued and will run when back online.')
                    toast('Queued parse to run when you are back online')
                    setUrls('')
                    return
                  }
                  void parseUrls()
                }} 
                disabled={isLoading || !urls.trim() || urls.split('\n').filter(url => url.trim()).length > 5}
                variant="dark"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Parse URLs
              </BrandButton>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {items.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Your Items ({items.length})</span>
                </CardTitle>
                {readyItems.length > 0 && (
                  <BrandButton
                      data-orderall-btn
                      onClick={confirmOrdersBatch}
                    disabled={isProcessing || !currentPoints || currentPoints < totalCost}
                    variant="dark"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Order All ({totalCost} points)
                  </BrandButton>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Fallback notice if any item is using polling */}
              {Object.values(pollingFallbackIds).some(Boolean) && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3" role="status" aria-live="polite">
                  Realtime updates are temporarily unavailable. Using fallback polling; updates may be slightly delayed.
                </div>
              )}
              {anyRetryingSse && !Object.values(pollingFallbackIds).some(Boolean) && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3" role="status" aria-live="polite">
                  Realtime connection interrupted. Retrying...
                </div>
              )}
              {orderBatchError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 flex items-center justify-between" role="alert" aria-live="assertive">
                  <span className="text-sm">{orderBatchError}</span>
                  <Button size="sm" variant="outline" onClick={() => void confirmOrdersBatch()}>Try again</Button>
                </div>
              )}
              <div className="space-y-4" ref={listRef} onKeyDown={onKeyNavigate} tabIndex={0} aria-label="Order items list. Use up and down arrows to navigate." aria-busy={listBusy}>
                {items.map((item, idx) => (
                  (item.isLoading || item.status === 'processing' || (item.status === 'ready' && !item.imageUrl)) ? (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-gray-100 p-4 flex items-center gap-4 bg-white/70">
                      <Skeleton className="h-20 w-20 rounded-md" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-3 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <div className="w-40">
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    </div>
                  ) : (item.status === 'failed' && !item.downloadUrl) ? (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-red-100 p-4 flex items-center gap-4 bg-red-50/60" role="status" aria-live="polite">
                      <div className="h-20 w-20 rounded-md bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800">Couldn’t load item details</p>
                        <p className="text-xs text-red-700 truncate">{item.error || 'Unknown error'}</p>
                      </div>
                      <div className="w-40">
                        <Button size="sm" variant="outline" onClick={() => void enrichItemWithStockInfo(item)}>Try again</Button>
                      </div>
                    </div>
                  ) : (
                    <UnifiedOrderItem
                      key={item.id}
                      item={{
                        url: item.url,
                        parsedData: { source: item.site, id: item.siteId },
                        stockSite: { displayName: item.site, name: item.site },
                        stockInfo: { title: item.title, image: item.imageUrl, points: item.cost },
                        status: item.status,
                        downloadUrl: item.downloadUrl,
                        error: item.error,
                        orderId: item.existingOrderId,
                      success: item.status === 'completed',
                      isQueued: item.isQueued,
                      }}
                      userPoints={currentPoints || 0}
                    onOrder={() => processOrder(item)}
                    onCancelQueued={() => {
                      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isQueued: false } : i))
                      setQueuedItemOrders(prev => prev.filter(id => id !== item.id))
                      if (queuedOrderBatch) {
                        const nextLen = queuedItemOrders.filter(id => id !== item.id).length
                        if (nextLen === 0) setQueuedOrderBatch(false)
                      }
                      setLiveAnnouncement('Queued item canceled. It will not auto-run when online.')
                      toast('Queued item canceled')
                    }}
                    onRemove={() => removeItem(item.id)}
                    dataItemId={item.id}
                    tabIndexOverride={focusIndex === idx ? 0 : -1}
                    />
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        {items.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {readyItems.length} item(s) • Total {totalCost} points
                  </p>
                </div>
                {(() => {
                  const hasBlocking = items.some(i => i.status === 'processing' || i.status === 'failed')
                  const canConfirm = items.length > 0 && !hasBlocking && readyItems.length > 0
                  return (
                    <BrandButton
                      data-confirm-btn
                      onClick={confirmOrdersBatch}
                      disabled={!canConfirm || !currentPoints || currentPoints < totalCost}
                      variant="dark"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Order
                    </BrandButton>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Sites */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-orange-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <span>Supported Platforms</span>
                </CardTitle>
                <p className="text-purple-100 mt-2 text-lg">
                  {filteredSites.length} premium stock media platforms • All at 10 points per download
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{filteredSites.length}</div>
                <div className="text-purple-200 text-sm">Platforms</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search platforms by name or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-purple-200 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:bg-white/30 transition-all duration-200"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {sitesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No platforms found</h3>
                <p className="text-gray-500">Try adjusting your search terms to find more platforms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSites.map((site, index) => (
                  <div
                    key={site.name}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <img src={`/assets/icons/${site.name}.svg`} alt={site.displayName} className="w-10 h-10 bg-gray-100 rounded-xl" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 rounded-full text-xs font-semibold">
                          {site.cost} pts
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-700 transition-colors">{site.displayName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Example:</span>
                        <button className="text-xs text-[var(--brand-purple-hex)] underline" onClick={() => navigator.clipboard.writeText(`${site.url}/example`)}>Copy</button>
                        <button className="text-xs text-orange-600 underline" onClick={() => handlePasteExample(EXAMPLE_URLS[site.name] || `${site.url}/example`)}>Paste</button>
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700 transition-colors">
                          Visit <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
