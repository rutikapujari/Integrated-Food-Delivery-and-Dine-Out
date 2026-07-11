import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { removeFromCart } from '../../redux/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash } from '../../utils/icons'
import { getMenuFallbackImage, resolveImageUrl } from '../../utils/imageFallbacks'
import AddToCartButton from '../menu/AddToCartButton'

function CartItem({ item }) {
  const dispatch = useDispatch()
  const [removing, setRemoving] = useState(false)
  const fallbackImage = getMenuFallbackImage(item)
  const [imageSrc, setImageSrc] = useState(resolveImageUrl(item.image) || fallbackImage)

  useEffect(() => {
    setImageSrc(resolveImageUrl(item.image) || fallbackImage)
  }, [item.image, fallbackImage])

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => {
      dispatch(removeFromCart(item.menuItemId))
    }, 200)
  }

  return (
    <motion.div
      initial={false}
      animate={removing ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-50 to-slate-100">
        <img
          src={imageSrc}
          alt={item.name}
          onError={() => setImageSrc(fallbackImage)}
          className="h-32 w-full object-cover"
        />
        <button
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${item.name}`}
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold">{item.name}</h4>
        {item.restaurantName && (
          <p className="truncate text-sm text-muted-foreground">{item.restaurantName}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
        <AddToCartButton
          item={{ _id: item.menuItemId, price: item.price, restaurantId: item.restaurantId }}
          variant="full"
          size="sm"
        />
      </div>
    </motion.div>
  )
}

export default CartItem
