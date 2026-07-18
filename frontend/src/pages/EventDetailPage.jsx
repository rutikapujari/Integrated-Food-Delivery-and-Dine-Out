import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchEventById, rsvpEvent, clearCurrentEvent } from '../redux/eventSlice'
import { notify } from '../utils/toast'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { Ticket, MapPin, Calendar, CurrencyDollar, Clock, Storefront, Users } from '../utils/icons'

function EventDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { event, loading, actionLoading, error } = useSelector((state) => state.event)

  useEffect(() => {
    dispatch(fetchEventById(id))
    return () => dispatch(clearCurrentEvent())
  }, [dispatch, id])

  const handleRsvp = async () => {
    const result = await dispatch(rsvpEvent(id))
    if (rsvpEvent.fulfilled.match(result)) {
      notify.success('RSVP confirmed! See you there.')
    } else {
      notify.error(result.payload || 'Failed to RSVP')
    }
  }

  if (loading && !event) return <Loader variant="page" />
  if (!event) {
    return (
      <motion.div {...pageTransition} className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-semibold">Event not found</h3>
        <Link to="/events" className="mt-3 text-sm text-primary font-semibold hover:underline">Back to Events</Link>
      </motion.div>
    )
  }

  const isFree = !event.price || event.price === 0
  const soldOut = event.capacity && event.bookedCount >= event.capacity

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative h-56 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 md:h-72">
        {event.image && (
          <img src={event.image} alt={event.title} className="h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-4xl px-4 md:px-8 pb-6">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-foreground">
            {event.category.replace('-', ' ')}
          </span>
          <h1 className="mt-2 font-display text-3xl text-white">{event.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="font-semibold text-lg mb-2">About this event</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {event.description || 'No description provided.'}
              </p>
              {event.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {event.restaurantId && (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Storefront className="h-5 w-5 text-primary" /> Hosted by
                </h2>
                <div className="flex items-center gap-3">
                  {event.restaurantId.image && (
                    <img src={event.restaurantId.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{event.restaurantId.name}</p>
                    <p className="text-xs text-muted-foreground">{event.restaurantId.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
              <p className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" /> {new Date(event.startDate).toLocaleString()}</p>
              <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary" /> Ends {new Date(event.endDate).toLocaleString()}</p>
              <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {event.venue || event.address || 'TBA'}</p>
              {event.capacity > 0 && (
                <p className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /> {event.bookedCount}/{event.capacity} booked</p>
              )}
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <CurrencyDollar className="h-4 w-4" /> {isFree ? 'Free' : `₹${event.price}`}
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              loading={actionLoading}
              disabled={soldOut || event.status !== 'published'}
              onClick={handleRsvp}
            >
              <Ticket className="h-5 w-5" /> {soldOut ? 'Sold Out' : 'RSVP / Book Spot'}
            </Button>

            <Link to="/events" className="block text-center text-sm text-muted-foreground hover:text-primary">
              Back to all events
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default EventDetailPage
