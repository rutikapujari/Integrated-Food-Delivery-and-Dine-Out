import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { setFilters, clearFilters, fetchRestaurants } from '../../redux/restaurantSlice'
import { CUISINE_TYPES } from '../../utils/constants'
import { ChevronDown, Star, X } from 'lucide-react'

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
      className="mb-8 flex flex-wrap items-center gap-3"
    >
      {/* Cuisine Filter */}
      <div className="relative">
        <motion.select
          value={filters.cuisine || ''}
          onChange={(e) => handleChange('cuisine', e.target.value)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="h-12 min-w-48 cursor-pointer appearance-none rounded-full border border-border bg-white px-5 pr-11 text-base text-foreground shadow-sm outline-none transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        >
          <option value="">All Cuisines</option>
          {CUISINE_TYPES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </motion.select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Rating Filter */}
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((option) => {
          const isSelected = filters.rating === option.value
          return (
            <motion.button
              key={option.value}
              onClick={() => handleChange('rating', isSelected ? null : option.value)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`flex h-12 items-center gap-2 rounded-full border px-5 text-base font-semibold shadow-sm transition-all duration-200 ${isSelected
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-foreground hover:border-primary/30 hover:bg-primary-light'
              }`}
            >
              <option.icon className={`w-4 h-4 ${isSelected ? 'fill-current' : option.color}`} />
              <span>{option.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Delivery Time Filter */}
      <div className="relative">
        <motion.select
          value={filters.deliveryTime || ''}
          onChange={(e) => handleChange('deliveryTime', e.target.value)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="h-12 min-w-44 cursor-pointer appearance-none rounded-full border border-border bg-white px-5 pr-11 text-base text-foreground shadow-sm outline-none transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        >
          <option value="">Any Time</option>
          <option value="30">Under 30 min</option>
          <option value="45">Under 45 min</option>
          <option value="60">Under 60 min</option>
        </motion.select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 items-center gap-2 rounded-full border border-destructive/20 bg-white px-5 text-base font-medium text-destructive shadow-sm transition-all duration-200 hover:bg-red-50"
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
