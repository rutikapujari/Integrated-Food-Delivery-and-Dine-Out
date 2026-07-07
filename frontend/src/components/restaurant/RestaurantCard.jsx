import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cardHover } from '../../utils/motion'
import { Star } from '../../utils/icons'

function RestaurantCard({ restaurant, onClick }) {
  const navigate = useNavigate()

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
      className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      <div className="relative">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
        {restaurant.isOpen === false && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-foreground font-semibold bg-white/90 px-4 py-2 rounded-full text-sm">Currently Closed</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold">
          {restaurant.deliveryTime} min
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg truncate">{restaurant.name}</h3>
          <span className="flex items-center gap-1 text-sm font-semibold bg-success-light text-success px-2 py-0.5 rounded-md shrink-0">
            <Star className="w-4 h-4" weight="fill" /> {restaurant.rating}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
        </p>
        {restaurant.address && (
          <p className="text-muted-foreground text-xs mt-1 truncate">{restaurant.address}</p>
        )}
      </div>
    </motion.div>
  )
}

export default RestaurantCard
