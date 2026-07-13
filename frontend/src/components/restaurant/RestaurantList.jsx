import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchRestaurants } from '../../redux/restaurantSlice'
import RestaurantCard from './RestaurantCard'
import Pagination from '../common/Pagination'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import Button from '../common/Button'
import { Storefront, Funnel, X } from 'lucide-react'



function RestaurantList({ limit, showPagination = true }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, loading, error, pagination } = useSelector((state) => state.restaurant)
  const { search, filters } = useSelector((state) => state.restaurant)

  useEffect(() => {
    dispatch(fetchRestaurants({
      page: pagination.page,
      limit: limit || pagination.limit,
      search: search || undefined,
      cuisine: filters.cuisine || undefined,
      rating: filters.rating || undefined,
      deliveryTime: filters.deliveryTime || undefined,
    }))
  }, [dispatch, pagination.page, limit])

  if (loading) return <Loader variant="card" count={limit || 8} />
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchRestaurants())} />
  if (!list.length) {
    return (
      <EmptyState
        icon={Storefront}
        title="No restaurants found"
        description="Try adjusting your filters or search terms."
        action={{ label: 'Clear Filters', onClick: () => dispatch(fetchRestaurants()) }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {list.map((r, index) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/restaurants/${r._id}`)}
              className="cursor-pointer"
            >
              <RestaurantCard restaurant={r} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showPagination && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => dispatch({ type: 'restaurant/setPage', payload: page })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RestaurantList
