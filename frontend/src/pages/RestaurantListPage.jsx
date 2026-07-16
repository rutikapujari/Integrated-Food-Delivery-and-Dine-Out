import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { setSearch, setFilters, setPage } from '../redux/restaurantSlice'
import RestaurantSearch from '../components/restaurant/RestaurantSearch'
import RestaurantFilters from '../components/restaurant/RestaurantFilters'
import RestaurantList from '../components/restaurant/RestaurantList'
import { MapPin, Star } from '../utils/icons'

function RestaurantListPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { search, filters, pagination, list, loading } = useSelector((state) => state.restaurant)

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
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white md:px-9 md:py-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40 md:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="relative">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-orange-200"><MapPin className="h-4 w-4" weight="fill" /> Delivering in Pune</p>
          <h1 className="font-display text-4xl leading-none md:text-6xl">Discover great food<br className="hidden md:block" /> near you.</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-white/10 px-3 py-1.5"><Star className="mr-1 inline h-4 w-4 fill-orange-300 text-orange-300" weight="fill" /> Top rated local picks</span><span className="rounded-full bg-white/10 px-3 py-1.5">{loading ? 'Finding restaurants...' : `${pagination.total || list.length} restaurants available`}</span></div>
        </div>
      </section>
      <RestaurantSearch value={search} onChange={handleSearch} />
      <RestaurantFilters />
      <RestaurantList />
      </div>
    </motion.div>
  )
}

export default RestaurantListPage
