import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchRestaurantById } from '../redux/restaurantSlice'
import { fetchReviews } from '../redux/reviewSlice'
import ReviewSummary from '../components/review/ReviewSummary'
import ReviewList from '../components/review/ReviewList'
import ReviewForm from '../components/review/ReviewForm'
import Loader from '../components/common/Loader'

function RestaurantReviewsPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { selected: restaurant, loading: rLoading } = useSelector((state) => state.restaurant)
  const { restaurantReviews, loading: revLoading } = useSelector((state) => state.review)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const reviews = restaurantReviews[id] || []

  useEffect(() => {
    dispatch(fetchRestaurantById(id))
    dispatch(fetchReviews(id))
  }, [dispatch, id])

  if (rLoading && !restaurant) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-2">
        Reviews for {restaurant?.name || 'Restaurant'}
      </h1>
      <p className="text-muted-foreground mb-8">
        See what customers are saying
      </p>

      <div className="space-y-8">
        <ReviewSummary reviews={reviews} />

        {isAuthenticated && (
          <ReviewForm restaurantId={id} />
        )}

        <ReviewList restaurantId={id} />
      </div>
    </motion.div>
  )
}

export default RestaurantReviewsPage
