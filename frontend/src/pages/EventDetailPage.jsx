import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchEventById, rsvpEvent, clearCurrentEvent } from '../redux/eventSlice'
import { notify } from '../utils/toast'
import Loader from '../components/common/Loader'
import {
  Ticket, MapPin, Calendar, CurrencyDollar, Clock, Storefront,
  Users, Lock, ArrowLeft, CheckCircle, Share, Phone,
} from '../utils/icons'

const CATEGORY_COLORS = {
  'food-festival': { bg: 'bg-orange-50', text: 'text-[#EA580C]' },
  'live-music': { bg: 'bg-purple-50', text: 'text-purple-600' },
  'workshop': { bg: 'bg-blue-50', text: 'text-blue-600' },
  'tasting': { bg: 'bg-amber-50', text: 'text-amber-600' },
  'pop-up': { bg: 'bg-green-50', text: 'text-green-600' },
  'holiday': { bg: 'bg-red-50', text: 'text-red-600' },
  'other': { bg: 'bg-gray-50', text: 'text-gray-600' },
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

function EventDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { event, loading, actionLoading, error } = useSelector((state) => state.event)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchEventById(id))
    return () => dispatch(clearCurrentEvent())
  }, [dispatch, id])

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      notify.error('Please login to RSVP')
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    const result = await dispatch(rsvpEvent(id))
    if (rsvpEvent.fulfilled.match(result)) {
      notify.success('RSVP confirmed! See you there.')
    } else {
      notify.error(result.payload || 'Failed to RSVP')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      notify.success('Link copied!')
    }
  }

  if (loading && !event) return <Loader variant="page" />
  if (!event) {
    return (
      <motion.div {...pageTransition} className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center py-16 px-4">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Ticket className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Event not found</h3>
        <p className="text-sm text-gray-500 mb-4">This event may have been removed or is no longer available.</p>
        <Link to="/events" className="px-5 py-2.5 bg-[#EA580C] text-white rounded-xl text-sm font-bold">Browse Events</Link>
      </motion.div>
    )
  }

  const isFree = !event.price || event.price === 0
  const soldOut = event.capacity && event.bookedCount >= event.capacity
  const spotsLeft = event.capacity > 0 ? event.capacity - (event.bookedCount || 0) : null
  const catColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other
  const gradient = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.other

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#F5F5F5]">
      {/* Hero */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${gradient}`}>
        {event.image && (
          <img src={event.image} alt={event.title} className="h-full w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${catColor.bg} ${catColor.text} mb-2`}>
              {event.category?.replace(/-/g, ' ') || 'Other'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{event.title}</h1>
            {event.restaurantId?.name && (
              <p className="text-sm text-white/60 flex items-center gap-1.5">
                <Storefront className="w-3.5 h-3.5" /> Hosted by {event.restaurantId.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8 -mt-4 relative z-10 pb-10">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Quick info cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <Calendar className="w-5 h-5 text-[#EA580C] mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900">{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            <p className="text-[10px] text-gray-400">{new Date(event.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <MapPin className="w-5 h-5 text-[#EA580C] mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900 line-clamp-1">{event.venue || 'TBA'}</p>
            <p className="text-[10px] text-gray-400">Venue</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            {isFree ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-green-600">Free</p>
                <p className="text-[10px] text-gray-400">No cost</p>
              </>
            ) : (
              <>
                <CurrencyDollar className="w-5 h-5 text-[#EA580C] mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">₹{event.price}</p>
                <p className="text-[10px] text-gray-400">Per person</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-5">
            {/* About */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <h2 className="font-bold text-gray-900 mb-3">About this event</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {event.description || 'No description provided for this event.'}
              </p>
              {event.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Hosted by */}
            {event.restaurantId && (
              <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="font-bold text-gray-900 mb-3">Hosted by</h2>
                <Link to={`/restaurants/${event.restaurantId._id || ''}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  {event.restaurantId.image && (
                    <img src={event.restaurantId.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{event.restaurantId.name}</p>
                    <p className="text-xs text-gray-400 truncate">{event.restaurantId.address || 'Address not available'}</p>
                  </div>
                  {event.restaurantId.phone && (
                    <a href={`tel:${event.restaurantId.phone}`} onClick={(e) => e.stopPropagation()} className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#EA580C]">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Right column — RSVP sidebar */}
          <div className="space-y-4">
            {/* Details card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#EA580C]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Start</p>
                  <p className="font-semibold text-gray-900">{new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-500">{new Date(event.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#EA580C]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">End</p>
                  <p className="font-semibold text-gray-900">{new Date(event.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-500">{new Date(event.endDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#EA580C]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Venue</p>
                  <p className="font-semibold text-gray-900">{event.venue || event.address || 'To be announced'}</p>
                </div>
              </div>

              {event.capacity > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#EA580C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Capacity</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{event.bookedCount || 0}/{event.capacity}</p>
                      {spotsLeft !== null && spotsLeft > 0 && (
                        <span className="text-[10px] font-bold text-[#EA580C]">({spotsLeft} left)</span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EA580C] rounded-full transition-all"
                        style={{ width: `${Math.min(((event.bookedCount || 0) / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Price</span>
                  <span className="text-lg font-bold text-[#EA580C]">{isFree ? 'Free' : `₹${event.price}`}</span>
                </div>

                {isAuthenticated ? (
                  <button
                    disabled={actionLoading || soldOut || event.status !== 'published'}
                    onClick={handleRsvp}
                    className="w-full flex items-center justify-center gap-2 bg-[#EA580C] text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-[0_2px_8px_rgba(234,88,12,0.3)]"
                  >
                    {actionLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : soldOut ? (
                      'Sold Out'
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        RSVP / Book Spot
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      notify.error('Please login to RSVP')
                      navigate('/login', { state: { from: `/events/${id}` } })
                    }}
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#EA580C] text-[#EA580C] py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
                  >
                    <Lock className="w-4 h-4" />
                    Login to RSVP
                  </button>
                )}
              </div>
            </div>

            <Link
              to="/events"
              className="block text-center text-sm text-gray-500 hover:text-[#EA580C] font-medium transition-colors"
            >
              ← Back to all events
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default EventDetailPage
