import { API_URL } from './constants'

const apiOrigin = (() => {
  try {
    return new URL(API_URL).origin
  } catch {
    return ''
  }
})()

const menuImages = {
  fries: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=85',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85',
  drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85',
}

const restaurantImages = {
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=85',
  italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=85',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85',
  default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
}

export function resolveImageUrl(src) {
  if (!src || typeof src !== 'string') return ''
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src
  if (src.startsWith('/')) return `${apiOrigin}${src}`
  return src
}

export function getMenuFallbackImage(item = {}) {
  const text = `${item.name || ''} ${item.category || ''}`.toLowerCase()
  if (text.includes('fries') || text.includes('french')) return menuImages.fries
  if (text.includes('burger')) return menuImages.burger
  if (text.includes('pizza')) return menuImages.pizza
  if (text.includes('pasta') || text.includes('noodle')) return menuImages.pasta
  if (text.includes('biryani') || text.includes('rice')) return menuImages.biryani
  if (text.includes('salad')) return menuImages.salad
  if (text.includes('cake') || text.includes('sweet') || text.includes('dessert')) return menuImages.dessert
  if (text.includes('drink') || text.includes('juice') || text.includes('mocktail')) return menuImages.drink
  if (text.includes('coffee') || text.includes('tea')) return menuImages.coffee
  if (text.includes('sandwich') || text.includes('toast')) return menuImages.sandwich
  return menuImages.default
}

export function getRestaurantFallbackImage(restaurant = {}) {
  const cuisine = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(' ')
    : restaurant.cuisine || restaurant.name || ''
  const text = cuisine.toLowerCase()
  if (text.includes('indian')) return restaurantImages.indian
  if (text.includes('italian') || text.includes('pizza')) return restaurantImages.italian
  if (text.includes('chinese') || text.includes('asian')) return restaurantImages.chinese
  if (text.includes('cafe') || text.includes('coffee')) return restaurantImages.cafe
  return restaurantImages.default
}
