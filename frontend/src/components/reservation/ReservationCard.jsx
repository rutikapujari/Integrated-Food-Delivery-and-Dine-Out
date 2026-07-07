import { Calendar, Clock, Users } from '../../utils/icons'

function ReservationCard({ reservation, onClick }) {
  const isCancelled = reservation.status === 'cancelled'
  const isPast = reservation.status === 'completed'

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-[var(--radius-lg)] p-5 transition-all duration-200 ${
        isCancelled
          ? 'border-destructive/30 opacity-60'
          : 'border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{reservation.restaurantName || reservation.restaurant?.name}</h3>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
          reservation.status === 'confirmed' ? 'text-success bg-success-light' :
          reservation.status === 'pending' ? 'text-warning bg-warning-light' :
          reservation.status === 'cancelled' ? 'text-destructive bg-destructive/10' :
          reservation.status === 'completed' ? 'text-muted-foreground bg-surface-muted' :
          'text-accent bg-accent-50'
        }`}>
          {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1) || 'Unknown'}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {new Date(reservation.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {reservation.time}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}
        </span>
      </div>

      {reservation.specialRequests && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-1">{reservation.specialRequests}</p>
      )}
    </div>
  )
}

export default ReservationCard
