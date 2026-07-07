import { useSelector } from 'react-redux'
import ReviewCard from './ReviewCard'
import Loader from '../common/Loader'

function ReviewList({ restaurantId }) {
  const { restaurantReviews, loading } = useSelector((state) => state.review)
  const reviews = restaurantId ? restaurantReviews[restaurantId] || [] : []

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
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  )
}

export default ReviewList
