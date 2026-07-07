import { Star } from '../../utils/icons'

function ReviewSummary({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6 text-center">
        <p className="text-muted-foreground text-sm">No ratings yet</p>
      </div>
    )
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
  }))

  return (
    <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{avgRating}</p>
          <div className="flex items-center gap-0.5 justify-center mt-1">
            <Star className="w-4 h-4 text-warning" weight="fill" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right text-muted-foreground">{d.star}</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-8 text-muted-foreground">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReviewSummary
