import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Star, User, Pencil, Trash } from '../../utils/icons'
import Button from '../common/Button'

function ReviewCard({ review, onEdit, onDelete }) {
  const { user } = useSelector((state) => state.auth)
  const isOwner = user && (user._id === (review.userId?._id || review.userId))
  const [editing, setEditing] = useState(false)
  const [editComment, setEditComment] = useState(review.comment)
  const [editRating, setEditRating] = useState(review.rating)

  const handleSave = () => {
    onEdit(review._id, { comment: editComment, rating: editRating })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-white border border-border rounded-[var(--radius-md)] p-4">
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setEditRating(star)}>
              <Star className={`w-5 h-5 ${star <= editRating ? 'text-warning' : 'text-border'}`} weight={star <= editRating ? 'fill' : 'regular'} />
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={editComment}
          onChange={(e) => setEditComment(e.target.value)}
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    )
  }

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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm font-semibold text-warning">
            <Star className="w-4 h-4" weight="fill" />
            {review.rating}
          </div>
          {isOwner && (
            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(review._id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
      )}
    </div>
  )
}

export default ReviewCard
