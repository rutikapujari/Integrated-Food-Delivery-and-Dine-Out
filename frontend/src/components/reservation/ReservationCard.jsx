import { Calendar, Clock, Users, Note, MapPin } from '../../utils/icons'

const STATUS_STYLES = {
  Confirmed: 'bg-success-light text-success',
  Pending: 'bg-warning-light text-warning',
  Cancelled: 'bg-destructive/10 text-destructive',
  Completed: 'bg-surface-muted text-muted-foreground',
}

function ReservationCard({ reservation, onCancel }) {
  const restaurantName = reservation.restaurantId?.name || reservation.restaurantName || 'Restaurant'
  const restaurantAddress = reservation.restaurantId?.address || ''
  const isCancellable = reservation.status === 'Pending' || reservation.status === 'Confirmed'

  return (
    <div className="bg-white border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary-400" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">{restaurantName}</h3>
            {restaurantAddress && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{restaurantAddress}</span>
              </p>
            )}
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[reservation.status] || 'bg-surface-muted text-muted-foreground'}`}>
            {reservation.status || 'Unknown'}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Calendar className="w-3.5 h-3.5" weight="duotone" />
            </span>
            {reservation.reservationDate
              ? new Date(reservation.reservationDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Clock className="w-3.5 h-3.5" weight="duotone" />
            </span>
            {reservation.reservationTime || '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Users className="w-3.5 h-3.5" weight="duotone" />
            </span>
            {reservation.numberOfGuests || 0} {reservation.numberOfGuests === 1 ? 'guest' : 'guests'}
          </span>
        </div>

        {reservation.specialRequest && (
          <div className="flex items-start gap-1.5 mt-3 text-sm text-muted-foreground">
            <Note className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p className="line-clamp-2">{reservation.specialRequest}</p>
          </div>
        )}

        {isCancellable && onCancel && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => onCancel(reservation._id)}
              className="text-sm font-semibold text-destructive hover:text-destructive-hover transition-colors"
            >
              Cancel Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationCard
