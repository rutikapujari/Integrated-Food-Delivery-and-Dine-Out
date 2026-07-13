// Phase 2: Restaurant Detail Page
// Complete restaurant details with menu, reviews, and cart integration

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurantById } from '../redux/restaurantSlice'
import { fetchMenuItems } from '../redux/menuSlice'
import { fetchReviews } from '../redux/reviewSlice'
import { formatCurrency } from '../utils/formatCurrency'
import RestaurantHeader from '../components/restaurant/RestaurantHeader'
import MenuList from '../components/menu/MenuList'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { Star, Clock, MapPin, Users, Heart, Share2, ArrowLeft } from 'lucide-react'

function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6"
      >
        <ArrowLeft className="w-10 h-10 text-red-600 dark:text-red-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold mb-2"
      >
        Error Loading Restaurant
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-sm mb-8"
      >
        {message}
      </motion.p>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </motion.button>
    </motion.div>
  )
}

function RestaurantDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selected, loading, error } = useSelector((state) => state.restaurant)
  const menu = useSelector((state) => state.menu.items)
  const reviews = useSelector((state) => state.review.restaurantReviews[id] || [])
  const cart = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantById(id))
      dispatch(fetchMenuItems({ restaurantId: id }))
      dispatch(fetchReviews(id))
    }
  }, [dispatch, id])

  const handleBack = () => {
    navigate(-1)
  }

  const getTotalCartItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getRestaurantCartItems = () => {
    return cart.items.filter(item => item.restaurantId === id)
  }

  const cartHasItems = getRestaurantCartItems().length > 0

  if (loading && !selected) {
    return <Loader variant="page" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchRestaurantById(id))} />
  }

  if (!selected && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6"
        >
          <MapPin className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold mb-2"
        >
          Restaurant Not Found
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-sm mb-8"
        >
          The restaurant you're looking for doesn't exist or may have been removed.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Restaurants
        </motion.button>
      </motion.div>
    )
  }

  if (!selected) return null

  return (
    <motion.div {...pageTransition}>
      <RestaurantHeader restaurant={selected} reviewCount={reviews.length} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={handleBack}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </motion.button>

        <div className="flex gap-8">
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-3xl font-bold mb-6"
            >
              Today's Menu
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <MenuList restaurantId={id} showCategories={true} />
            </motion.div>
          </div>

          {cartHasItems && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="hidden lg:block w-80 shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="sticky top-24 bg-white dark:bg-slate-800 border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Order
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {getRestaurantCartItems().map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex justify-between items-center p-3 bg-surface-bg dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm block truncate">{item.name}</span>
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-sm ml-2">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-border pt-4 mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(getRestaurantCartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={() => navigate('/cart')}
                    className="w-full py-4 font-semibold text-base"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Cart ({getTotalCartItems()} items)
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RestaurantDetailPage