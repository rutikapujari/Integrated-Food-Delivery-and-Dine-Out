import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { updateCartQuantity, removeFromCart } from '../../redux/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash } from '../../utils/icons'
import AddToCartButton from '../menu/AddToCartButton'

function CartItem({ item, onQuantityChange, onRemove }) {
  const dispatch = useDispatch()
  const [removing, setRemoving] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => {
      dispatch(removeFromCart(item.menuItemId))



    }, 200)
  }
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.div
      initial={false}
      animate={removing ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 p-4 bg-white border border-border rounded-[var(--radius-md)] hover:shadow-md transition-shadow"
    >
      <div className="relative">
        {!imageError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={handleImageError}
            className="w-full h-32 rounded-lg object-cover"
          />




          
        ) : (
          <div className="w-full h-32 rounded-lg bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-1">🍽️</div>
              <p className="text-xs text-muted-foreground">No image</p>
            </div>
          </div>
        )}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold truncate">{item.name}</h4>
        {item.restaurantName && (
          <p className="text-muted-foreground text-sm truncate">{item.restaurantName}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-primary font-bold">{formatCurrency(item.price)}</span>
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
