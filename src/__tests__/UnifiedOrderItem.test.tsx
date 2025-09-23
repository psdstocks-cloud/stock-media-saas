import { render, screen } from '@testing-library/react'
import { UnifiedOrderItem } from '@/components/dashboard/UnifiedOrderItem'

const baseItem = {
  url: 'https://x',
  status: 'ready' as const,
  stockInfo: { title: 'Title', image: '', points: 10 },
  parsedData: { source: 'shutterstock', id: '1' },
  stockSite: { displayName: 'Shutterstock', name: 'shutterstock' }
}

describe('UnifiedOrderItem', () => {
  it('shows Order button when ready and enough points', () => {
    render(
      <UnifiedOrderItem
        item={{ ...baseItem, status: 'ready' }}
        onOrder={() => {}}
        onRemove={() => {}}
        userPoints={100}
      />
    )
    expect(screen.getByText(/Order for/i)).toBeInTheDocument()
  })

  it('shows processing UI', () => {
    render(
      <UnifiedOrderItem
        item={{ ...baseItem, status: 'processing' }}
        onOrder={() => {}}
        onRemove={() => {}}
      />
    )
    expect(screen.getByText(/Processing/i)).toBeInTheDocument()
  })
})


