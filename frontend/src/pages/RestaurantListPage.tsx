// Phase 2: Restaurant List, Details, Menu, Search, and Filters Components
// Modern React TypeScript implementation with Framer Motion

import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurants, setSearch, setFilters, setPage } from '../redux/restaurantSlice'
import RestaurantSearch from '../components/restaurant/RestaurantSearch'
import RestaurantFilters from '../components/restaurant/RestaurantFilters'
import RestaurantList from '../components/restaurant/RestaurantList'
import Loader from '../components/common/Loader'
import { MapPin, Star, Clock, Filter, ChevronRight } from 'lucide-react'

function RestaurantListPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { search, filters, pagination, loading, error } = useSelector((state) => state.restaurant)

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlCuisine = searchParams.get('cuisine') || ''
    const urlRating = searchParams.get('rating') || ''
    const urlDeliveryTime = searchParams.get('deliveryTime') || ''
    const urlPage = parseInt(searchParams.get('page') || '1', 10)

    dispatch(setSearch(urlSearch))
    if (urlCuisine || urlRating || urlDeliveryTime) {
      dispatch(setFilters({
        cuisine: urlCuisine || null,
        rating: urlRating || null,
        deliveryTime: urlDeliveryTime || null,
      }))
    }
    if (urlPage > 1) dispatch(setPage(urlPage))
    dispatch(fetchRestaurants({ page: urlPage, limit: 12, search: urlSearch, cuisine: urlCuisine, rating: urlRating, deliveryTime: urlDeliveryTime }))
  }, [dispatch])

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (filters.cuisine) params.cuisine = filters.cuisine
    if (filters.rating) params.rating = filters.rating
    if (filters.deliveryTime) params.deliveryTime = filters.deliveryTime
    if (pagination.page > 1) params.page = pagination.page
    setSearchParams(params, { replace: true })
  }, [search, filters, pagination.page])

  const handleSearch = useCallback((value) => {
    dispatch(setSearch(value))
    dispatch(setPage(1))
  }, [dispatch])

  const clearAllFilters = useCallback(() => {
    dispatch(setSearch(''))
    dispatch(setFilters({ cuisine: null, rating: null, deliveryTime: null }))
    dispatch(setPage(1))
  }, [dispatch])

  const hasActiveFilters = search || filters.cuisine || filters.rating || filters.deliveryTime

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Discover Restaurants
        </h1>
        <p className="text-xl text-muted-foreground">
          Find your next favorite meal from our curated selection of top-rated restaurants
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-700 dark:text-red-400">Error: {error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <RestaurantSearch value={search} onChange={handleSearch} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <RestaurantFilters />

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFilters}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Clear all filters
          </motion.button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader variant="page" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <RestaurantList showPagination={true} />
        </motion.div>
      )}

      {!loading && !error && pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Showing</p>
              <p className="font-semibold text-lg">Page {pagination.page} of {pagination.pages}</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Restaurants</p>
              <p className="font-semibold text-lg text-primary">{pagination.total || 0}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default RestaurantListPage