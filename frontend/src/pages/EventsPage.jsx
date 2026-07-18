import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchEvents } from '../redux/eventSlice'
import Loader from '../components/common/Loader'
import {
  Ticket, MapPin, Calendar, CurrencyDollar,
} from '../utils/icons'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'food-festival', label: 'Food Festival' },
  { key: 'live-music', label: 'Live Music' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'tasting', label: 'Tasting' },
  { key: 'pop-up', label: 'Pop-up' },
  { key: 'holiday', label: 'Holiday' },
  { key: 'other', label: 'Other' },
]

function EventsPage() {
  const dispatch = useDispatch()
  const { list, loading, error, total } = useSelector((state) => state.event)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [upcoming, setUpcoming] = useState(true)

  useEffect(() => {
    const params = { upcoming: upcoming ? 'true' : 'false' }
    if (category !== 'all') params.category = category
    if (search.trim()) params.search = search.trim()
    dispatch(fetchEvents(params))
  }, [dispatch, category, search, upcoming])

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-4 md:px-8 py-10 text-white">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
                <Ticket className="h-8 w-8" weight="duotone" />
              </span>
              <div>
                <h1 className="font-display text-3xl">Events & Discover</h1>
                <p className="text-slate-300 text-sm">Food festivals, tastings & live experiences near you</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-primary">
              <Calendar className="h-4 w-4" />
              {total || list.length} events
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c.key ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={upcoming}
              onChange={(e) => setUpcoming(e.target.checked)}
              className="accent-primary"
            />
            Upcoming only
          </label>
        </div>

        <div className="mb-6 relative max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full h-11 pl-4 pr-4 rounded-full border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        {loading ? (
          <Loader variant="card" count={6} />
        ) : !list.length ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Ticket className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No events found</h3>
              <p className="mt-2 text-muted-foreground">Try a different category or check back later.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((ev) => (
              <Link
                key={ev._id}
                to={`/events/${ev._id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
                  {ev.image ? (
                    <img src={ev.image} alt={ev.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Ticket className="h-10 w-10 text-primary/60" weight="duotone" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-foreground">
                    {ev.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold leading-snug">{ev.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ev.description}</p>
                  <div className="mt-auto space-y-1 pt-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(ev.startDate).toLocaleDateString()} · {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {ev.venue || ev.address || ev.restaurantId?.name || 'TBA'}</p>
                    <p className="flex items-center gap-1.5 font-semibold text-primary">
                      <CurrencyDollar className="h-4 w-4" /> {ev.price > 0 ? `₹${ev.price}` : 'Free'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default EventsPage
