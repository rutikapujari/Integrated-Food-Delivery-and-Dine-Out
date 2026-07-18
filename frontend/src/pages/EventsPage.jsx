import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchEvents } from '../redux/eventSlice'
import Loader from '../components/common/Loader'
import {
  Ticket, MapPin, Calendar, CurrencyDollar, MagnifyingGlass,
  Clock, Users, Storefront, ArrowRight, Pizza, Coffee,
  Hamburger, Wine, Bell, Gift, Cake, Star, ForkKnife, CookingPot,
} from '../utils/icons'

const CATEGORIES = [
  { key: 'all', label: 'All Events', icon: Ticket },
  { key: 'food-festival', label: 'Food Festival', icon: ForkKnife },
  { key: 'live-music', label: 'Live Music', icon: Bell },
  { key: 'workshop', label: 'Workshop', icon: CookingPot },
  { key: 'tasting', label: 'Tasting', icon: Wine },
  { key: 'pop-up', label: 'Pop-up', icon: Storefront },
  { key: 'holiday', label: 'Holiday', icon: Gift },
  { key: 'other', label: 'Other', icon: Star },
]

const CATEGORY_COLORS = {
  'food-festival': { bg: 'bg-orange-50', text: 'text-[#EA580C]', accent: '#EA580C' },
  'live-music': { bg: 'bg-purple-50', text: 'text-purple-600', accent: '#9333EA' },
  'workshop': { bg: 'bg-blue-50', text: 'text-blue-600', accent: '#2563EB' },
  'tasting': { bg: 'bg-amber-50', text: 'text-amber-600', accent: '#D97706' },
  'pop-up': { bg: 'bg-green-50', text: 'text-green-600', accent: '#16A34A' },
  'holiday': { bg: 'bg-red-50', text: 'text-red-600', accent: '#DC2626' },
  'other': { bg: 'bg-gray-50', text: 'text-gray-600', accent: '#6B7280' },
}

const CATEGORY_GRADIENTS = {
  'food-festival': 'from-[#EA580C] to-[#F97316]',
  'live-music': 'from-purple-600 to-purple-400',
  'workshop': 'from-blue-600 to-blue-400',
  'tasting': 'from-amber-600 to-amber-400',
  'pop-up': 'from-green-600 to-green-400',
  'holiday': 'from-red-600 to-red-400',
  'other': 'from-gray-600 to-gray-400',
}

function EventsPage() {
  const dispatch = useDispatch()
  const { list, loading, error, total } = useSelector((state) => state.event)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [upcoming, setUpcoming] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const params = { upcoming: upcoming ? 'true' : 'false' }
    if (category !== 'all') params.category = category
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    dispatch(fetchEvents(params))
  }, [dispatch, category, debouncedSearch, upcoming])

  const featuredEvents = list.filter((ev) => ev.image).slice(0, 2)
  const restEvents = list.filter((ev) => !featuredEvents.find((f) => f._id === ev._id))

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#F5F5F5]">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A]">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#EA580C]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#F97316]/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-8 text-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center">
                  <Ticket className="h-5 w-5" weight="fill" />
                </div>
                <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Events</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Food Events</h1>
              <p className="text-white/50 text-sm md:text-base">Food festivals, live music, tastings & experiences near you</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{total || list.length}</p>
                <p className="text-[11px] text-white/40">Events</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold">{list.filter((ev) => ev.price === 0).length}</p>
                <p className="text-[11px] text-white/40">Free</p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-6 relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, festivals, workshops..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-sm text-gray-900 placeholder:text-gray-400 border-0 shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-[#EA580C]/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Category pills */}
        <div className="mb-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                    category === c.key
                      ? 'bg-[#1B2838] text-white shadow-lg'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Upcoming toggle */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-gray-900">
            {category === 'all' ? 'All Events' : CATEGORIES.find((c) => c.key === category)?.label}
            <span className="text-gray-400 font-normal ml-1">({total || list.length})</span>
          </p>
          <button
            onClick={() => setUpcoming(!upcoming)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              upcoming
                ? 'bg-[#EA580C] text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${upcoming ? 'bg-white' : 'bg-gray-400'}`} />
            {upcoming ? 'Upcoming' : 'All Dates'}
          </button>
        </div>

        {/* Featured events (first 2 with images) */}
        {!loading && featuredEvents.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Featured</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredEvents.map((ev) => {
                const catColor = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other
                const gradient = CATEGORY_GRADIENTS[ev.category] || CATEGORY_GRADIENTS.other
                return (
                  <Link
                    key={ev._id}
                    to={`/events/${ev._id}`}
                    className="group relative h-52 md:h-56 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all"
                  >
                    <img src={ev.image} alt={ev.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${catColor.bg} ${catColor.text}`}>
                        {ev.category?.replace(/-/g, ' ') || 'Other'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{ev.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-white/70">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.venue || ev.restaurantId?.name || 'TBA'}</span>
                        {ev.price > 0 ? (
                          <span className="text-[#F97316] font-bold">₹{ev.price}</span>
                        ) : (
                          <span className="text-green-400 font-bold">Free</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <Loader variant="card" count={6} />
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Ticket className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No events found</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Try a different category or check back later for food events near you.
            </p>
            <button
              onClick={() => { setCategory('all'); setSearch('') }}
              className="mt-4 px-5 py-2.5 bg-[#EA580C] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Event grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(restEvents.length > 0 ? restEvents : list).map((ev, i) => {
                const catColor = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other
                const spotsLeft = ev.capacity > 0 ? ev.capacity - (ev.bookedCount || 0) : null
                return (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="h-full"
                  >
                    <Link
                      to={`/events/${ev._id}`}
                      className="group flex flex-col h-[360px] bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5"
                    >
                      {/* Image / placeholder */}
                      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-50">
                        {ev.image ? (
                          <img src={ev.image} alt={ev.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[ev.category] || CATEGORY_GRADIENTS.other} opacity-10`}>
                            <Ticket className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {/* Category badge */}
                        <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${catColor.bg} ${catColor.text}`}>
                          {ev.category?.replace(/-/g, ' ') || 'Other'}
                        </span>
                        {/* Price badge */}
                        <div className="absolute right-3 top-3">
                          {ev.price > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm">
                              ₹{ev.price}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                              Free
                            </span>
                          )}
                        </div>
                        {/* Spots left */}
                        {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              {spotsLeft} spots left
                            </span>
                          </div>
                        )}
                        {spotsLeft !== null && spotsLeft <= 0 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="inline-flex items-center rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col p-4 h-[148px]">
                        <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2">{ev.title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{ev.description || 'No description'}</p>

                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            <span className="text-gray-300">·</span>
                            {new Date(ev.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{ev.venue || ev.address || ev.restaurantId?.name || 'TBA'}</span>
                          </div>
                          {ev.restaurantId?.name && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Storefront className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{ev.restaurantId.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default EventsPage
