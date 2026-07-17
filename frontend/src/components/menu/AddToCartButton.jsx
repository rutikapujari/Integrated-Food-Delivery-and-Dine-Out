import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addToCart, updateCartQuantity, removeFromCart } from '../../redux/cartSlice'
import { notify } from '../../utils/toast'
import { Plus, Minus } from '../../utils/icons'
import Modal from '../common/Modal'
import Button from '../common/Button'

function AddToCartButton({ item, variant = 'icon', size = 'md' }) {
  const dispatch = useDispatch()
  const { items, restaurantId } = useSelector((state) => state.cart)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  const existingItem = items.find((i) => i.menuItemId === item._id)
  const quantity = existingItem?.quantity || 0

  const isSizeSm = size === 'sm'
  const iconSize = isSizeSm ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const btnSize = isSizeSm ? 'w-7 h-7' : 'w-8 h-8'

  const doAdd = useCallback((menuItem) => {
    dispatch(addToCart({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      restaurantId: menuItem.restaurantId,
      restaurantName: menuItem.restaurantName,
      quantity: 1,
    })).then(() => {
      notify.success(`Added ${menuItem.name} to cart`)
    })
  }, [dispatch])

  const handleAdd = useCallback((event) => {
    event?.stopPropagation()
    if (restaurantId && restaurantId !== item.restaurantId && items.length > 0) {
      setPendingItem(item)
      setShowConfirm(true)
      return
    }
    doAdd(item)
  }, [restaurantId, item, items.length, doAdd])

  const confirmSwitch = () => {
    setShowConfirm(false)
    if (pendingItem) {
      dispatch(removeFromCart(items[0].menuItemId))
      setTimeout(() => doAdd(pendingItem), 100)
    }
  }

  if (quantity === 0) {
    if (variant === 'full') {
      return (
        <>
          <Button size={size} icon={Plus} onClick={handleAdd}>Add</Button>
          <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Switch Restaurant?">
            <p className="text-muted-foreground">
              Your cart contains items from another restaurant. Would you like to clear your cart and add items from this restaurant?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={confirmSwitch}>Switch & Add</Button>
            </div>
          </Modal>
        </>
      )
    }
    return (
      <>
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${item.name} to cart`}
          title="Add to cart"
          className={`${btnSize} bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors active:scale-95`}
        >
          <Plus className={iconSize} />
        </button>
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Switch Restaurant?">
          <p className="text-muted-foreground">
            Your cart contains items from another restaurant. Would you like to clear your cart and add items from this restaurant?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={confirmSwitch}>Switch & Add</Button>
          </div>
        </Modal>
      </>
    )
  }

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            quantity <= 1
              ? dispatch(removeFromCart(item._id))
              : dispatch(updateCartQuantity({ menuItemId: item._id, quantity: quantity - 1 }))
          }
          className={`${btnSize} rounded-full border border-border flex items-center justify-center hover:bg-surface-muted transition-colors`}
        >
          <Minus className={iconSize} />
        </button>
        <span className={`${isSizeSm ? 'w-6' : 'w-8'} text-center font-semibold text-sm`}>{quantity}</span>
        <button
          type="button"
          onClick={() => dispatch(updateCartQuantity({ menuItemId: item._id, quantity: quantity + 1 }))}
          className={`${btnSize} rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors`}
        >
          <Plus className={iconSize} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() =>
          quantity <= 1
            ? dispatch(removeFromCart(item._id))
            : dispatch(updateCartQuantity({ menuItemId: item._id, quantity: quantity - 1 }))
        }
        className={`${btnSize} rounded-full border border-border flex items-center justify-center hover:bg-surface-muted transition-colors`}
      >
        <Minus className={iconSize} />
      </button>
      <span className={`${isSizeSm ? 'w-5' : 'w-6'} text-center font-semibold text-xs`}>{quantity}</span>
      <button
        type="button"
        onClick={() => dispatch(updateCartQuantity({ menuItemId: item._id, quantity: quantity + 1 }))}
        className={`${btnSize} rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  )
}

export default AddToCartButton
