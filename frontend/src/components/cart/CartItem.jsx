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

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => {
      dispatch(removeFromCart(item.menuItemId))
    }, 200)
  }

  return (
    <motion.div
      initial={false}
      animate={removing ? { opacity: 0, x: 40 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 p-4 bg-white border border-border rounded-[var(--radius-md)]"
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{item.name}</h4>
        {item.restaurantName && (
          <p className="text-muted-foreground text-sm">{item.restaurantName}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold">{formatCurrency(item.price)}</span>
          <AddToCartButton
            item={{ _id: item.menuItemId, price: item.price, restaurantId: item.restaurantId }}
            variant="full"
            size="sm"
          />
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="self-start p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
      >
        <Trash className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default CartItem
