import { motion } from 'framer-motion'
import { cardHover } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import AddToCartButton from './AddToCartButton'

function MenuCard({ item, onClick, showAddToCart = true }) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-44 object-cover"
        />
        {item.isVegetarian && (
          <span className="absolute top-3 left-3 bg-success text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            Veg
          </span>
        )}
        {item.isAvailable === false && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-foreground font-semibold bg-white/90 px-4 py-2 rounded-full text-sm">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-primary font-bold text-lg">{formatCurrency(item.price)}</span>
          {showAddToCart && item.isAvailable !== false && <AddToCartButton item={item} />}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuCard
