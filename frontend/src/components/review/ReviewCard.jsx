import { Star, User } from '../../utils/icons'

function ReviewCard({ review }) {
  return (
    <div className="bg-white border border-border rounded-[var(--radius-md)] p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{review.user?.name || review.name || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-warning">
          <Star className="w-4 h-4" weight="fill" />
          {review.rating}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
      )}
    </div>
  )
}

export default ReviewCard
