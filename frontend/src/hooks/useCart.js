import { useSelector, useDispatch } from 'react-redux'
import { addToCart, updateCartQuantity, removeFromCart, clearCart, applyCoupon, removeCoupon } from '../redux/cartSlice'
import { notify } from '../utils/toast'

export function useCart() {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)

  const handleAddToCart = (item) => {
    if (cart.restaurantId && cart.restaurantId !== item.restaurantId && cart.items.length > 0) {
      return 'conflict'
    }
    dispatch(addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      quantity: 1,
    })).then(() => {
      notify.success(`Added ${item.name} to cart`)
    })
    return 'added'
  }

  const handleUpdateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(menuItemId))
    } else {
      dispatch(updateCartQuantity({ menuItemId, quantity }))
    }
  }

  const handleRemoveFromCart = (menuItemId, itemName) => {
    dispatch(removeFromCart(menuItemId))
    notify.success(`Removed ${itemName || 'item'} from cart`)
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    notify.success('Cart cleared')
  }

  const handleApplyCoupon = (code) => {
    dispatch(applyCoupon({ code, discountPercent: 10, discountAmount: Math.round(cart.subtotal * 0.1) }))
    notify.success(`Coupon "${code}" applied!`)
  }

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon())
    notify.success('Coupon removed')
  }

  return {
    items: cart.items,
    restaurantId: cart.restaurantId,
    subtotal: cart.subtotal,
    total: cart.total,
    deliveryFee: cart.deliveryFee,
    tax: cart.tax,
    discount: cart.discount,
    coupon: cart.coupon,
    loading: cart.loading,
    itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,
  }
}
