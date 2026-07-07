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
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { Calendar, Clock, Users, Note } from '../utils/icons'

const today = new Date().toISOString().split('T')[0]

const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required').refine((d) => d >= today, { message: 'Date must be today or in the future' }),
  time: z.string().min(1, 'Time is required'),
  partySize: z.coerce.number().int().min(1, 'At least 1 guest').max(20, 'Maximum 20 guests'),
  specialRequests: z.string().max(300).optional(),
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: { date: today, time: '', partySize: 2, specialRequests: '' },
  })

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
    <motion.div {...pageTransition} className="max-w-lg mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl mb-2">Book a Table</h1>
      <p className="text-muted-foreground mb-8">{restaurant?.name || 'Loading...'}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Date"
          type="date"
          icon={Calendar}
          error={errors.date?.message}
          disabled={submitting}
          register={register('date')}
          min={today}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Time</label>
          <select
            className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            disabled={submitting}
            {...register('time')}
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
        </div>

        <Input
          label="Number of Guests"
          type="number"
          icon={Users}
          error={errors.partySize?.message}
          disabled={submitting}
          register={register('partySize')}
          min={1}
          max={20}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Special Requests (optional)</label>
          <textarea
            rows={3}
            placeholder="Any dietary requirements or special occasions..."
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] border border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
            disabled={submitting}
            {...register('specialRequests')}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
          Confirm Reservation
        </Button>
      </form>
    </motion.div>
  )
}

export default BookReservationPage
