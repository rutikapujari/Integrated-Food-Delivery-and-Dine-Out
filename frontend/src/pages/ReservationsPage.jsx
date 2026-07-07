import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchReservations, cancelReservation } from '../redux/reservationSlice'
import { notify } from '../utils/toast'
import ReservationCard from '../components/reservation/ReservationCard'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { Calendar as CalendarIcon } from '../utils/icons'

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

  const upcoming = list.filter((r) => {
    if (r.status === 'cancelled') return false
    if (r.status === 'completed') return false
    const d = new Date(r.date)
    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
  })

  const past = list.filter((r) => {
    if (r.status === 'cancelled') return true
    if (r.status === 'completed') return true
    const d = new Date(r.date)
    return d < new Date(now.getFullYear(), now.getMonth(), now.getDate())
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
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-6">My Reservations</h1>

      <div className="flex gap-1 mb-6 bg-surface-muted rounded-full p-1 w-fit">
        {['upcoming', 'past'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader variant="card" count={3} />
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-1">Failed to load reservations</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => dispatch(fetchReservations())}>Try Again</Button>
        </div>
      ) : !activeList.length ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CalendarIcon className="w-16 h-16 text-border mb-4" weight="duotone" />
          <h3 className="text-lg font-semibold mb-1">
            {tab === 'upcoming' ? 'No upcoming reservations' : 'No past reservations'}
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {tab === 'upcoming'
              ? 'Book a table at your favorite restaurant.'
              : 'Your past reservations will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((res) => (
            <div key={res._id} className="relative">
              <ReservationCard reservation={res} />
              {res.status !== 'cancelled' && res.status !== 'completed' && (
                <button
                  onClick={() => setCancelId(res._id)}
                  className="absolute top-4 right-4 text-xs text-destructive font-semibold hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Reservation"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep It</Button>
            <Button variant="destructive" loading={cancelling} onClick={handleCancel}>Cancel Reservation</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to cancel this reservation? This cannot be undone.
        </p>
      </Modal>
    </motion.div>
  )
}

export default ReservationsPage
