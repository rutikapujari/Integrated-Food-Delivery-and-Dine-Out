import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchReservations, cancelReservation } from '../redux/reservationSlice'
import { notify } from '../utils/toast'
import ReservationCard from '../components/reservation/ReservationCard'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { Calendar as CalendarIcon, Storefront } from '../utils/icons'

function ReservationsPage() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((state) => state.reservation)
  const [tab, setTab] = useState('upcoming')
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    dispatch(fetchReservations())
  }, [dispatch])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const upcoming = list.filter((r) => {
    if (r.status === 'Cancelled' || r.status === 'Completed') return false
    return new Date(r.reservationDate) >= todayStart
  })

  const past = list.filter((r) => {
    if (r.status === 'Cancelled' || r.status === 'Completed') return true
    return new Date(r.reservationDate) < todayStart
  })

  const activeList = tab === 'upcoming' ? upcoming : past

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await dispatch(cancelReservation(cancelId))
      notify.success('Reservation cancelled')
    } catch {
      notify.error('Failed to cancel reservation')
    } finally {
      setCancelling(false)
      setCancelId(null)
    }
  }

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Dine-out reservations</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">My Reservations</h1>
            {!loading && <p className="mt-2 text-muted-foreground">{list.length ? `${list.length} reservation${list.length === 1 ? '' : 's'} made` : 'Book a table at your favourite restaurant.'}</p>}
          </div>
          <Link to="/restaurants" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            <Storefront className="h-4 w-4" weight="fill" /> Browse restaurants
          </Link>
        </header>

        <div className="flex gap-1 mb-6 bg-surface-muted rounded-full p-1 w-fit">
          {['upcoming', 'past'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white shadow-[var(--shadow-button)]' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border rounded-[var(--radius-lg)] p-5 animate-pulse">
                <div className="h-1.5 bg-border rounded-t-lg -mt-5 -mx-5 mb-5" style={{ width: 'calc(100% + 2.5rem)' }} />
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-48 bg-border rounded" />
                  <div className="h-5 w-20 bg-border rounded-full" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-32 bg-border rounded" />
                  <div className="h-4 w-20 bg-border rounded" />
                  <div className="h-4 w-24 bg-border rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-border rounded-[var(--radius-lg)]">
            <h3 className="text-lg font-semibold mb-1">Failed to load reservations</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => dispatch(fetchReservations())}>Try Again</Button>
          </div>
        ) : !activeList.length ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-border rounded-[var(--radius-lg)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light mb-4">
              <CalendarIcon className="w-8 h-8 text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {tab === 'upcoming' ? 'No upcoming reservations' : 'No past reservations'}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {tab === 'upcoming'
                ? 'Book a table at your favorite restaurant to get started.'
                : 'Your completed or cancelled reservations will appear here.'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/restaurants" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                <Storefront className="h-4 w-4" weight="fill" /> Browse restaurants
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map((res) => (
              <ReservationCard key={res._id} reservation={res} onCancel={setCancelId} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Reservation"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep It</Button>
            <Button variant="destructive" loading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
  )
}

export default ReservationsPage
