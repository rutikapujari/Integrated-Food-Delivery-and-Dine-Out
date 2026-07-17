import { motion } from 'framer-motion'
import { cardHover } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { getMenuFallbackImage, getMenuImageSrc } from '../../utils/menuImage'
import AddToCartButton from './AddToCartButton'

function MenuCard({ item, onClick, showAddToCart = true }) {
  const imageSrc = getMenuImageSrc(item)
  const cartItem = {
    ...item,
    image: imageSrc,
    restaurantId: item.restaurantId?._id || item.restaurantId,
    restaurantName: item.restaurantId?.name || item.restaurantName,
  }

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-border-hover hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = getMenuFallbackImage(item)
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.isVegetarian && (
          <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-sm border border-success bg-white shadow-sm" title="Vegetarian">
            <span className="h-2 w-2 rounded-full bg-success" />
          </span>
        )}
        {item.isAvailable === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-800">{item.name}</h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{item.restaurantId?.name || item.restaurantName || 'FoodHub kitchen'}</p>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{item.description || 'Freshly prepared with quality ingredients.'}</p>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(item.price)}</span>
          {showAddToCart && item.isAvailable !== false && <AddToCartButton item={cartItem} />}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuCard
