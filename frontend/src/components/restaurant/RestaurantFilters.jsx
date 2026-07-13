import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { setFilters, clearFilters, fetchRestaurants } from '../../redux/restaurantSlice'
import { CUISINE_TYPES } from '../../utils/constants'
import { Star, X } from 'lucide-react'

function RestaurantFilters() {
  const dispatch = useDispatch()
  const { filters, pagination } = useSelector((state) => state.restaurant)
  const hasFilters = filters.cuisine || filters.rating || filters.deliveryTime

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value || null }))
    dispatch({ type: 'restaurant/setPage', payload: 1 })
    dispatch(fetchRestaurants({ page: 1, limit: pagination.limit }))
  }

  const handleClear = () => {
    dispatch(clearFilters())
    dispatch({ type: 'restaurant/setPage', payload: 1 })
  }

  const ratingOptions = [
    { value: '4.5', label: '4.5+', icon: Star, color: 'text-yellow-500' },
    { value: '4.0', label: '4.0+', icon: Star, color: 'text-blue-500' },
    { value: '3.5', label: '3.5+', icon: Star, color: 'text-green-500' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 mb-6"
    >
      {/* Cuisine Filter */}
      <motion.select
        value={filters.cuisine || ''}
        onChange={(e) => handleChange('cuisine', e.target.value)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 px-5 rounded-full border border-border bg-white text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="">All Cuisines</option>
        {CUISINE_TYPES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </motion.select>

      {/* Rating Filter */}
      <div className="flex gap-2">
        {ratingOptions.map((option) => {
          const isSelected = filters.rating === option.value
          return (
            <motion.button
              key={option.value}
              onClick={() => handleChange('rating', isSelected ? null : option.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 h-10 px-4 rounded-full border text-sm font-semibold transition-all duration-300 ${isSelected
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-transparent shadow-lg'
                : 'border-border hover:bg-surface-muted hover:border-primary/30'
              }`}
            >
              <option.icon className={`w-4 h-4 ${isSelected ? 'fill-current' : option.color}`} />
              <span>{option.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Delivery Time Filter */}
      <motion.select
        value={filters.deliveryTime || ''}
        onChange={(e) => handleChange('deliveryTime', e.target.value)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 px-5 rounded-full border border-border bg-white text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="">Any Time</option>
        <option value="30">Under 30 min</option>
        <option value="45">Under 45 min</option>
        <option value="60">Under 60 min</option>
      </motion.select>

      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-r from-red-500/10 to-orange-500/10 text-destructive border border-destructive/20 hover:from-red-500/20 hover:to-orange-500/20 transition-all duration-300"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RestaurantFilters
