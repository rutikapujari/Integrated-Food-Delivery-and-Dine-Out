import { useDispatch, useSelector } from 'react-redux'
import { updateReview, deleteReview } from '../../redux/reviewSlice'
import { notify } from '../../utils/toast'
import ReviewCard from './ReviewCard'
import Loader from '../common/Loader'

function ReviewList({ restaurantId }) {
  const dispatch = useDispatch()
  const { restaurantReviews, loading } = useSelector((state) => state.review)
  const reviews = restaurantId ? restaurantReviews[restaurantId] || [] : []

  const handleEdit = async (id, updates) => {
    const result = await dispatch(updateReview({ id, ...updates }))
    if (updateReview.fulfilled.match(result)) {
      notify.success('Review updated')
    } else {
      notify.error(result.payload || 'Failed to update review')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    const result = await dispatch(deleteReview({ id, restaurantId }))
    if (deleteReview.fulfilled.match(result)) {
      notify.success('Review deleted')
    } else {
      notify.error(result.payload || 'Failed to delete review')
    }
  }

  if (loading) return <Loader variant="text" count={3} />

  if (!reviews.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  )
}

export default ReviewList
