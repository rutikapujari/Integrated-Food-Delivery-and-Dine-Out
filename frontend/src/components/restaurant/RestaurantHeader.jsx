import { useNavigate } from 'react-router-dom'
import { Star, Calendar } from '../../utils/icons'
import { formatCurrency } from '../../utils/formatCurrency'

function RestaurantHeader({ restaurant, reviewCount }) {
  const navigate = useNavigate()

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {restaurant.image ? (
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
      )}
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
          {restaurant.averagePrepTime ? <><span>{restaurant.averagePrepTime} min prep</span><span>&bull;</span></> : null}
          {restaurant.minimumOrderAmount ? <span>Min order {formatCurrency(restaurant.minimumOrderAmount)}</span> : null}
        </div>
        <div className="flex items-center gap-3 mt-3">
          {restaurant.isOpen !== false ? (
            <span className="inline-block px-3 py-1 bg-success text-white text-xs rounded-full">Open Now</span>
          ) : (
            <span className="inline-block px-3 py-1 bg-destructive text-white text-xs rounded-full">Closed</span>
          )}
          {restaurant.isOpen !== false && (
            <button
              onClick={() => navigate(`/restaurants/${restaurant._id}/reserve`)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-primary text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" weight="fill" /> Reserve a Table
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantHeader
