import { Star } from '../../utils/icons'
import Button from '../common/Button'

function RatingStars({ value = 0, onChange, size = 'md', interactive = true }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className={`transition-colors ${interactive ? 'cursor-pointer hover:text-warning' : 'cursor-default'}`}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            className={`${sizeClasses[size]} ${star <= value ? 'text-warning' : 'text-border'}`}
            weight={star <= value ? 'fill' : 'regular'}
          />
        </button>
      ))}
    </div>
  )
}

export default RatingStars
