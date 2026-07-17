import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurantById } from '../redux/restaurantSlice'
import { fetchMenuItems } from '../redux/menuSlice'
import { fetchReviews } from '../redux/reviewSlice'
import { menuService } from '../services/menuService'
import { formatCurrency } from '../utils/formatCurrency'
import RestaurantHeader from '../components/restaurant/RestaurantHeader'
import MenuList from '../components/menu/MenuList'
import RestaurantMenuManager from '../components/restaurant/RestaurantMenuManager'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}

function RestaurantDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selected, loading, error } = useSelector((state) => state.restaurant)
  const reviews = useSelector((state) => state.review)
  const cart = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const restaurantReviews = reviews.restaurantReviews[id] || []
  const [ownerItems, setOwnerItems] = useState([])

  const isOwner = user && selected && (
    user.role === 'admin' || user._id === selected.ownerId
  )

  const refreshOwnerMenu = useCallback(async () => {
    if (!isOwner) return
    try {
      const { data } = await menuService.getAll({ restaurantId: id, limit: 100 })
      setOwnerItems(data.menuItems || [])
    } catch { /* silent */ }
  }, [isOwner, id])

  useEffect(() => {
    dispatch(fetchRestaurantById(id))
    dispatch(fetchMenuItems({ restaurantId: id }))
    dispatch(fetchReviews(id))
  }, [dispatch, id])

  useEffect(() => {
    if (isOwner) refreshOwnerMenu()
  }, [isOwner, refreshOwnerMenu])

  if (loading && !selected) return <Loader variant="page" />
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchRestaurantById(id))} />
  if (!selected && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-semibold">Restaurant not found</h3>
      </div>
    )
  }
  if (!selected) return null

  const cartHasItems = cart.items.length > 0 && cart.restaurantId === id

  return (
    <motion.div {...pageTransition}>
      <RestaurantHeader restaurant={selected} reviewCount={restaurantReviews.length} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <h2 className="font-display text-2xl mb-6">Menu</h2>
            <MenuList restaurantId={id} showCategories />

            {isOwner && (
              <RestaurantMenuManager
                restaurantId={id}
                items={ownerItems}
                onRefresh={refreshOwnerMenu}
              />
            )}
          </div>

          {cartHasItems && (
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24 bg-white border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold mb-4">Your Order</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-muted-foreground ml-2">&times;{item.quantity}</span>
                      <span className="font-semibold ml-2">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
                <Button className="w-full mt-4" onClick={() => navigate('/cart')}>
                  View Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantDetailPage
