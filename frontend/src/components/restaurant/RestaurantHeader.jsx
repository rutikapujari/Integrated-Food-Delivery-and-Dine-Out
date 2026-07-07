import { Star } from '../../utils/icons'
import { formatCurrency } from '../../utils/formatCurrency'

function RestaurantHeader({ restaurant, reviewCount }) {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <h1 className="font-display text-4xl md:text-5xl">{restaurant.name}</h1>
        <p className="text-white/80 text-lg">
          {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1">
            <Star className="text-warning w-4 h-4" weight="fill" /> {restaurant.rating}
            {reviewCount !== undefined && ` (${reviewCount} reviews)`}
          </span>
          <span>&bull;</span>
          <span>{restaurant.deliveryTime} min</span>
          <span>&bull;</span>
          <span>{restaurant.minOrder ? `Min order ${formatCurrency(restaurant.minOrder)}` : ''}</span>
        </div>
        {restaurant.isOpen !== false ? (
          <span className="inline-block mt-2 px-3 py-1 bg-success text-white text-xs rounded-full">Open Now</span>
        ) : (
          <span className="inline-block mt-2 px-3 py-1 bg-destructive text-white text-xs rounded-full">Closed</span>
        )}
      </div>
    </div>
  )
}

export default RestaurantHeader
