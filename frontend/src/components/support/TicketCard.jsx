import { Clock } from '../../utils/icons'

const statusStyles = {
  open: 'text-success bg-success-light',
  'in-progress': 'text-accent bg-accent-50',
  resolved: 'text-muted-foreground bg-surface-muted',
  closed: 'text-muted-foreground bg-surface-muted',
}

const categoryColors = {
  'Order Issue': 'bg-warning-light text-warning',
  'Account': 'bg-accent-50 text-accent',
  'Payment': 'bg-success-light text-success',
  'Restaurant': 'bg-primary-light text-primary',
  'Other': 'bg-surface-muted text-muted-foreground',
}

function TicketCard({ ticket, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-[var(--radius-md)] p-4 cursor-pointer hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{ticket.subject}</h4>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            #{ticket._id?.slice(-8).toUpperCase()}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[ticket.status] || statusStyles.open}`}>
          {ticket.status?.replace('-', ' ') || 'Open'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[ticket.category] || categoryColors.Other}`}>
          {ticket.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
        {ticket.lastReply && (
          <span className="text-xs text-muted-foreground">
            Last reply: {new Date(ticket.lastReply).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}

export default TicketCard
