import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { cardHover } from '../../utils/motion'
import { Star } from '../../utils/icons'
import { getRestaurantFallbackImage, resolveImageUrl } from '../../utils/imageFallbacks'

function RestaurantCard({ restaurant, onClick }) {
  const navigate = useNavigate()
  const fallbackImage = getRestaurantFallbackImage(restaurant)
  const [imageSrc, setImageSrc] = React.useState(resolveImageUrl(restaurant.image) || fallbackImage)

  React.useEffect(() => {
    setImageSrc(resolveImageUrl(restaurant.image) || fallbackImage)
  }, [restaurant.image, fallbackImage])

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
      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={restaurant.name}
          onError={() => setImageSrc(fallbackImage)}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {restaurant.isOpen === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground">Currently Closed</span>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm">
          {restaurant.deliveryTime} min
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-xl font-bold text-slate-950">{restaurant.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-light px-2.5 py-1 text-sm font-bold text-success">
            <Star className="w-4 h-4" weight="fill" /> {restaurant.rating}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
        </p>
        {restaurant.address && (
          <p className="mt-2 truncate text-xs text-muted-foreground">{restaurant.address}</p>
        )}
      </div>
    </motion.div>
  )
}

export default RestaurantCard
