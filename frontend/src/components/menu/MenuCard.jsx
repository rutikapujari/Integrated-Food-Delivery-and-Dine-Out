import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cardHover } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { getMenuFallbackImage, resolveImageUrl } from '../../utils/imageFallbacks'
import AddToCartButton from './AddToCartButton'

function MenuCard({ item, onClick, showAddToCart = true }) {
  const fallbackImage = getMenuFallbackImage(item)
  const [imageSrc, setImageSrc] = useState(resolveImageUrl(item.image) || fallbackImage)

  useEffect(() => {
    setImageSrc(resolveImageUrl(item.image) || fallbackImage)
  }, [item.image, fallbackImage])

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
        <img
          src={imageSrc}
          alt={item.name}
          onError={() => setImageSrc(fallbackImage)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {item.isVegetarian && (
          <span className="absolute left-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Veg
          </span>
        )}
        {item.category && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
            {item.category}
          </span>
        )}
        {item.isAvailable === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-xl font-bold text-slate-950">{item.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="rounded-full bg-primary-light px-3 py-1 text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
          {showAddToCart && item.isAvailable !== false && <AddToCartButton item={item} />}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuCard
