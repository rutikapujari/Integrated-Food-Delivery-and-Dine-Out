import { SOCKET_URL } from './constants'

const foodImages = {
  pizza: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=85',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=85',
  pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85',
  indian: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=85',
  dessert: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85',
  drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=85',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85',
}

export function getMenuFallbackImage(item = {}) {
  const text = `${item.name || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase()
  if (text.includes('pizza')) return foodImages.pizza
  if (text.includes('burger') || text.includes('sandwich')) return foodImages.burger
  if (text.includes('fries') || text.includes('side')) return foodImages.fries
  if (text.includes('pasta') || text.includes('penne') || text.includes('noodle')) return foodImages.pasta
  if (text.includes('cake') || text.includes('dessert') || text.includes('ice cream') || text.includes('gulab')) return foodImages.dessert
  if (text.includes('tea') || text.includes('coffee') || text.includes('drink') || text.includes('smoothie') || text.includes('beverage')) return foodImages.drink
  if (text.includes('salad') || text.includes('bowl')) return foodImages.salad
  if (text.includes('paneer') || text.includes('biryani') || text.includes('curry') || text.includes('indian')) return foodImages.indian
  return foodImages.default
}

export function getMenuImageSrc(item = {}) {
  const image = typeof item.image === 'string' ? item.image.trim() : ''
  if (!image) return getMenuFallbackImage(item)
  if (/^https?:\/\//i.test(image) || image.startsWith('data:')) return image
  return `${SOCKET_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}`
}
