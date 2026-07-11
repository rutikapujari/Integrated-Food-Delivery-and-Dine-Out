import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurants, setSearch, setFilters, setPage } from '../redux/restaurantSlice'
import RestaurantSearch from '../components/restaurant/RestaurantSearch'
import RestaurantFilters from '../components/restaurant/RestaurantFilters'
import RestaurantList from '../components/restaurant/RestaurantList'
import { Storefront, Star, Timer, MapPin, ArrowRight } from '../utils/icons'

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
    <motion.div {...pageTransition} className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=85')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78),rgba(234,88,12,0.22))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <Storefront className="h-4 w-4 text-primary-300" /> Explore restaurants
            </p>
            <h1 className="font-display text-6xl leading-[0.9] text-white md:text-7xl">Choose your next favourite place.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
              Search nearby restaurants, compare cuisines, ratings, delivery speed, and dine-out options in one beautiful view.
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/95 p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Smart filter</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Find food faster</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-white">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <RestaurantSearch value={search} onChange={handleSearch} />
            <RestaurantFilters />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Star, value: '4.5+', label: 'Top rated' },
                { icon: Timer, value: '30m', label: 'Fast delivery' },
                { icon: MapPin, value: 'Near', label: 'Local picks' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
                  <Icon className="mx-auto mb-1 h-5 w-5 text-primary" weight="duotone" />
                  <p className="font-bold text-slate-950">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Restaurant dashboard</p>
            <h2 className="mt-2 font-display text-4xl text-slate-950 md:text-5xl">Popular near you</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Handpicked restaurants with fresh menus, fast checkout, and reliable delivery.
          </p>
        </div>
        <RestaurantList />
      </section>
    </motion.div>
  )
}

export default RestaurantListPage
