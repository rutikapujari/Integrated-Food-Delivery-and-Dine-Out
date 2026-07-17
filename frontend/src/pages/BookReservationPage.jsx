import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurantById } from '../redux/restaurantSlice'
import { reservationService } from '../services/reservationService'
import { notify } from '../utils/toast'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { Calendar, Clock, Users, ArrowLeft, MapPin } from '../utils/icons'

const today = new Date().toISOString().split('T')[0]

const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required').refine((d) => d >= today, { message: 'Date must be today or in the future' }),
  time: z.string().min(1, 'Please select a time slot'),
  partySize: z.coerce.number().int().min(1, 'At least 1 guest').max(20, 'Maximum 20 guests'),
  specialRequests: z.string().max(300, 'Max 300 characters').optional(),
})

const timeSlots = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
  '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]

function BookReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: restaurant, loading: rLoading } = useSelector((state) => state.restaurant)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: { date: today, time: '', partySize: 2, specialRequests: '' },
  })

  const selectedTime = watch('time')
  const guestCount = watch('partySize')

  useEffect(() => {
    dispatch(fetchRestaurantById(id))
  }, [dispatch, id])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await reservationService.create({ ...data, restaurantId: id })
      notify.success('Table reserved successfully!')
      navigate('/reservations')
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to book reservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (rLoading) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-lg px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">Reserve a table</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Book a Table</h1>
        </div>

        {restaurant && (
          <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 mb-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              {restaurant.image && (
                <img src={restaurant.image} alt={restaurant.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
                {restaurant.address && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Date</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Calendar className="w-5 h-5" weight="duotone" />
              </div>
              <input
                type="date"
                min={today}
                disabled={submitting}
                className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-surface-muted disabled:opacity-60"
                {...register('date')}
              />
            </div>
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Time</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Clock className="w-5 h-5" weight="duotone" />
              </div>
              <select
                disabled={submitting}
                className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-surface-muted disabled:opacity-60 appearance-none"
                {...register('time')}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Number of Guests</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Users className="w-5 h-5" weight="duotone" />
              </div>
              <input
                type="number"
                min={1}
                max={20}
                disabled={submitting}
                className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-surface-muted disabled:opacity-60"
                {...register('partySize')}
              />
            </div>
            {errors.partySize && <p className="text-sm text-destructive">{errors.partySize.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Special Requests <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              rows={3}
              placeholder="Dietary requirements, celebrations, accessibility needs..."
              disabled={submitting}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none disabled:bg-surface-muted disabled:opacity-60 text-sm"
              {...register('specialRequests')}
            />
            {errors.specialRequests && <p className="text-sm text-destructive">{errors.specialRequests.message}</p>}
          </div>

          {selectedTime && guestCount > 0 && (
            <div className="bg-primary-light rounded-[var(--radius-sm)] p-3 text-sm text-primary">
              <span className="font-semibold">Summary:</span> Table for {guestCount} on {new Date(watch('date')).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {selectedTime}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            Confirm Reservation
          </Button>
        </form>
      </div>
    </motion.div>
  )
}

export default BookReservationPage
