import { act } from 'react'
import { useOrderStore } from '@/stores/orderStore'

describe('orderStore v3 cart actions', () => {
  beforeEach(() => {
    const { resetOrder } = useOrderStore.getState()
    resetOrder?.()
  })

  it('adds URL as pending item', () => {
    act(() => useOrderStore.getState().addUrl?.('https://example.com/item', 'test-id'))
    const items = useOrderStore.getState().orderItems || []
    expect(items.find(i => i.id === 'test-id')?.status).toBe('pending')
  })

  it('updates item status and data', () => {
    act(() => useOrderStore.getState().addUrl?.('u', 'id-1'))
    act(() => useOrderStore.getState().updateItemStatus?.('id-1', 'ready', { data: { title: 't', thumbnail: 'img', points: 10, platform: 'p' } }))
    const item = (useOrderStore.getState().orderItems || []).find(i => i.id === 'id-1')
    expect(item?.status).toBe('ready')
    expect(item?.data?.title).toBe('t')
  })

  it('removes item', () => {
    act(() => useOrderStore.getState().addUrl?.('u', 'id-2'))
    act(() => useOrderStore.getState().removeItem?.('id-2'))
    const items = useOrderStore.getState().orderItems || []
    expect(items.find(i => i.id === 'id-2')).toBeUndefined()
  })
})


