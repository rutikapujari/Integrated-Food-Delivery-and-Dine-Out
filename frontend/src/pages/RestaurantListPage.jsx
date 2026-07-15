import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurants, setSearch, setFilters, setPage } from '../redux/restaurantSlice'
import RestaurantSearch from '../components/restaurant/RestaurantSearch'
import RestaurantFilters from '../components/restaurant/RestaurantFilters'
import RestaurantList from '../components/restaurant/RestaurantList'

function RestaurantListPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { search, filters, pagination } = useSelector((state) => state.restaurant)

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
  }, [])

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

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl leading-none tracking-normal text-foreground md:text-6xl">
          Restaurants
        </h1>
      </div>
      <RestaurantSearch value={search} onChange={handleSearch} />
      <RestaurantFilters />
      <RestaurantList />
    </motion.div>
  )
}

export default RestaurantListPage
