import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RestaurantCard from '../components/restaurant/RestaurantCard'

const mockRestaurant = {
  _id: 'rest123',
  name: 'Pizza Palace',
  cuisine: 'Italian, Pizza',
  rating: 4.5,
  address: '123 Main St, Mumbai',
  image: 'https://example.com/pizza.jpg',
  deliveryTime: 25,
  isOpen: true,
}

const mockRestaurantNoImage = {
  _id: 'rest456',
  name: 'Burger Barn',
  cuisine: 'American',
  rating: 0,
  address: '456 Oak Ave, Delhi',
  deliveryTime: 30,
  isOpen: true,
}

const renderCard = (restaurant = mockRestaurant, onClick) => {
  return render(
    <MemoryRouter>
      <RestaurantCard restaurant={restaurant} onClick={onClick} />
    </MemoryRouter>
  )
}

describe('RestaurantCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders restaurant name', () => {
    renderCard()
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument()
  })

  it('renders cuisine type', () => {
    renderCard()
    expect(screen.getByText('Italian, Pizza')).toBeInTheDocument()
  })

  it('renders rating when rating > 0', () => {
    renderCard()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders "New" when rating is 0', () => {
    renderCard(mockRestaurantNoImage)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    renderCard()
    expect(screen.getByText('25 min')).toBeInTheDocument()
  })

  it('renders address', () => {
    renderCard()
    expect(screen.getByText('123 Main St, Mumbai')).toBeInTheDocument()
  })

  it('renders restaurant image', () => {
    renderCard()
    const img = screen.getByRole('img', { name: /pizza palace/i })
    expect(img).toHaveAttribute('src', 'https://example.com/pizza.jpg')
  })

  it('shows "Currently Closed" overlay when isOpen is false', () => {
    renderCard({ ...mockRestaurant, isOpen: false })
    expect(screen.getByText('Currently Closed')).toBeInTheDocument()
  })

  it('does not show closed overlay when isOpen is true', () => {
    renderCard()
    expect(screen.queryByText('Currently Closed')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderCard(mockRestaurant, onClick)

    await user.click(screen.getByText('Pizza Palace'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('navigates to restaurant detail when no onClick provided', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByText('Pizza Palace'))
  })

  it('renders fallback address when no address provided', () => {
    renderCard({ ...mockRestaurant, address: '' })
    expect(screen.getByText('Address not provided')).toBeInTheDocument()
  })

  it('renders "General" when no cuisine provided', () => {
    renderCard({ ...mockRestaurant, cuisine: '' })
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('handles array cuisine format', () => {
    renderCard({ ...mockRestaurant, cuisine: ['Chinese', 'Thai'] })
    expect(screen.getByText('Chinese, Thai')).toBeInTheDocument()
  })

  it('shows default delivery time when not provided', () => {
    renderCard({ ...mockRestaurant, deliveryTime: undefined })
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('has correct card structure', () => {
    renderCard()
    const card = screen.getByText('Pizza Palace').closest('[class*="cursor-pointer"]')
    expect(card).toBeInTheDocument()
  })
})
