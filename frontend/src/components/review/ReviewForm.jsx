import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReview } from '../../redux/reviewSlice'
import { notify } from '../../utils/toast'
import RatingStars from './RatingStars'
import Button from '../common/Button'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment too long'),
})

function ReviewForm({ restaurantId, orderId }) {
  const dispatch = useDispatch()
  const [rating, setRating] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  const onSubmit = async (data) => {
    const result = await dispatch(createReview({
      restaurantId,
      orderId,
      rating: data.rating,
      comment: data.comment,
    }))

    if (createReview.fulfilled.match(result)) {
      notify.success('Review submitted!')
      reset()
      setRating(0)
    } else {
      notify.error(result.payload || 'Failed to submit review')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
      <h3 className="font-semibold text-lg mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="text-sm font-semibold block mb-2">Your Rating</label>
        <RatingStars
          value={rating}
          onChange={(val) => { setRating(val); setValue('rating', val) }}
        />
        {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-semibold">Your Review</label>
        <textarea
          rows={4}
          placeholder="Tell us about your experience..."
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] border border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none text-sm"
          {...register('comment')}
        />
        {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
      </div>

      <Button type="submit">Submit Review</Button>
    </form>
  )
}

export default ReviewForm
