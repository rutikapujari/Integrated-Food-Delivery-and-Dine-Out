import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cardHover } from '../../utils/motion'
import { Clock, MapPin, Star, Utensils } from 'lucide-react'

const fallbackImages = {
  indian: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=85',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85',
  italian: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85',
  healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85',
  cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
  fast: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
  general: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=85',
  ],
}

function pickGeneralFoodImage(name = '') {
  const imageIndex = [...name].reduce((total, character) => total + character.charCodeAt(0), 0) % fallbackImages.general.length
  return fallbackImages.general[imageIndex]
}

function getFallbackImage(restaurant) {
  const cuisine = Array.isArray(restaurant?.cuisine)
    ? restaurant.cuisine.join(' ')
    : restaurant?.cuisine || ''
  const haystack = `${restaurant?.name || ''} ${cuisine} ${restaurant?.tags?.join?.(' ') || ''}`.toLowerCase()

  if (haystack.includes('pizza') || haystack.includes('italian')) return fallbackImages.pizza
  if (haystack.includes('indian') || haystack.includes('spice') || haystack.includes('biryani')) return fallbackImages.indian
  if (haystack.includes('cafe') || haystack.includes('green') || haystack.includes('healthy') || haystack.includes('salad')) return fallbackImages.cafe
  if (haystack.includes('burger') || haystack.includes('fast')) return fallbackImages.burger

  return pickGeneralFoodImage(restaurant?.name)
}

function RestaurantCard({ restaurant, onClick }) {
  const navigate = useNavigate()
  const fallbackImage = getFallbackImage(restaurant)
  const imageSrc = restaurant.image || restaurant.coverImage || fallbackImage
  const cuisine = Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine
  const deliveryTime = restaurant.deliveryTime || restaurant.avgDeliveryTime || restaurant.averagePrepTime || 30
  const hasRating = Number(restaurant.rating) > 0
  const rating = hasRating ? Number(restaurant.rating).toFixed(1) : 'New'

  const handleClick = () => {
    if (onClick) onClick()
    else navigate(`/restaurants/${restaurant._id}`)
  }

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={handleClick}
      className="group h-full cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-border-hover hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-primary">
          <Utensils className="h-12 w-12" />
        </div>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={restaurant.name}
            loading="lazy"
            onError={(event) => {
              if (event.currentTarget.src.endsWith(fallbackImage)) {
                event.currentTarget.style.display = 'none'
                return
              }
              event.currentTarget.src = fallbackImage
            }}
            className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        {restaurant.isOpen === false && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">Currently Closed</span>
          </div>
        )}
        <div className="absolute left-3 top-3 z-40 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {deliveryTime} min
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-xl font-semibold leading-tight text-foreground">{restaurant.name}</h3>
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${hasRating ? 'bg-success text-white' : 'bg-success-light text-success'}`}>
            {hasRating && <Star className="h-3.5 w-3.5 fill-current" />} {rating}
          </span>
        </div>
        <p className="mt-2 truncate text-base text-muted-foreground">
          {cuisine || 'General'}
        </p>
        <p className="mt-3 flex items-center gap-1.5 truncate border-t border-slate-100 pt-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{restaurant.address || 'Address not provided'}</span>
        </p>
      </div>
    </motion.div>
  )
}

export default RestaurantCard
